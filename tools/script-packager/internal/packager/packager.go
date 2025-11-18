package packager

import (
	"bytes"
	"database/sql"
	"fmt"
	"strings"

	_ "github.com/lib/pq" // PostgreSQL driver
	"github.com/cassracp/script-packager/internal/github"
	"github.com/cassracp/script-packager/pkg/encoding"
	goencoding "golang.org/x/text/encoding"
	"golang.org/x/text/encoding/charmap"
	"golang.org/x/text/transform"
)

// Packager handles the logic for unifying, encoding, and executing scripts against a database.
type Packager struct {
	ghClient *github.Client
	dbHost   string
	dbPort   string
	dbUser   string
	dbPass   string
	dbName   string
}

// NewPackager creates a new Packager instance.
func NewPackager(client *github.Client, dbHost, dbPort, dbUser, dbPass, dbName string) *Packager {
	return &Packager{
		ghClient: client,
		dbHost:   dbHost,
		dbPort:   dbPort,
		dbUser:   dbUser,
		dbPass:   dbPass,
		dbName:   dbName,
	}
}

// ExecuteUnifiedScript fetches selected scripts, unifies them,
// determines the database encoding, and executes the appropriate SQL content.
func (p *Packager) ExecuteUnifiedScript(selectedScripts []github.Script) error {
	var unifiedSqlContentBuilder strings.Builder
	unifiedSqlContentBuilder.WriteString("\\set ON_ERROR_STOP on\n\n") // Use \n for Go strings, will be sent to DB
	unifiedSqlContentBuilder.WriteString("BEGIN;\n\n")

	for _, script := range selectedScripts {
		fmt.Printf("Fetching content for %s...\n", script.Name)
		rawContent, err := p.ghClient.GetScriptContent(script.Path)
		if err != nil {
			return fmt.Errorf("failed to get content for %s: %w", script.Name, err)
		}

		detectedEncoding, err := encoding.DetectEncoding(rawContent)
		if err != nil {
			return fmt.Errorf("failed to detect encoding for %s: %w", script.Name, err)
		}
		fmt.Printf("Detected encoding for %s: %s\n", script.Name, detectedEncoding)

		// Decode raw content to UTF-8 string
		var decodedContent string
		if strings.EqualFold(detectedEncoding, "UTF-8") {
			decodedContent = string(rawContent)
		} else {
			decoder := goencoding.Nop.NewDecoder()
			if strings.EqualFold(detectedEncoding, "windows-1252") || strings.EqualFold(detectedEncoding, "ISO-8859-1") {
				decoder = charmap.Windows1252.NewDecoder()
			} else {
				fmt.Printf("Warning: Unknown or unsupported detected encoding '%s' for %s. Attempting direct decode.\n", detectedEncoding, script.Name)
				decodedContent = string(rawContent)
			}
			
			if decoder != goencoding.Nop.NewDecoder() { // Only transform if a specific decoder was set
				decodedBytes, _, err := transform.Bytes(decoder, rawContent)
				if err != nil {
					return fmt.Errorf("failed to decode %s from %s to UTF-8: %w", script.Name, detectedEncoding, err)
				}
				decodedContent = string(decodedBytes)
			}
		}

		unifiedSqlContentBuilder.WriteString(fmt.Sprintf("/*=====%s=====*/\n", script.Name))
		unifiedSqlContentBuilder.WriteString(strings.TrimSpace(decodedContent))
		unifiedSqlContentBuilder.WriteString(";\n") // Ensure semicolon and newline
	}

	unifiedSqlContentBuilder.WriteString("\n\nCOMMIT;")
	finalSqlStringUTF8 := unifiedSqlContentBuilder.String()

	// --- Database Connection and Execution ---
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		p.dbHost, p.dbPort, p.dbUser, p.dbPass, p.dbName)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}
	fmt.Println("Successfully connected to the database.")

	// Determine DB encoding
	var dbEncoding string
	err = db.QueryRow("SELECT pg_encoding_to_char(encoding) FROM pg_database WHERE datname = $1", p.dbName).Scan(&dbEncoding)
	if err != nil {
		return fmt.Errorf("failed to query database encoding: %w", err)
	}
	fmt.Printf("Database encoding detected: %s\n", dbEncoding)

	var sqlToExecute string
	var hadReplacements bool

	if strings.EqualFold(dbEncoding, "UTF8") {
		sqlToExecute = finalSqlStringUTF8
		fmt.Println("Executing unified script as UTF-8.")
	} else if strings.EqualFold(dbEncoding, "WIN1252") || strings.EqualFold(dbEncoding, "ISO-8859-1") {
		win1252Bytes, replaced, err := convertToWindows1252(finalSqlStringUTF8)
		if err != nil {
			return fmt.Errorf("failed to convert unified script to windows-1252: %w", err)
		}
		sqlToExecute = string(win1252Bytes) // Convert back to string for execution
		hadReplacements = replaced
		fmt.Println("Executing unified script as Windows-1252.")
		if hadReplacements {
			fmt.Println("Warning: Some characters were replaced during conversion to Windows-1252 for execution due to incompatibility.")
		}
	} else {
		return fmt.Errorf("unsupported database encoding: %s. Only UTF8 and WIN1252 are supported.", dbEncoding)
	}

	// Execute the SQL
	_, err = db.Exec(sqlToExecute)
	if err != nil {
		return fmt.Errorf("failed to execute unified SQL script: %w", err)
	}

	fmt.Println("Unified SQL script executed successfully against the database.")
	return nil
}

// generateBatchContent creates the content for the ExecutarScript.bat file.
// This function is no longer needed in the new approach.
func generateBatchContent() string {
	return "" // Return empty as it's not used
}


// convertToWindows1252 converts a UTF-8 string to Windows-1252 byte slice,
// replacing any unsupported characters. It also returns a boolean indicating
// if any replacements occurred.
func convertToWindows1252(utf8String string) ([]byte, bool, error) {
	var (
		buf             bytes.Buffer
		hadReplacements bool
	)

	// Create a Windows-1252 encoder
	encoder := charmap.Windows1252.NewEncoder()

	for _, r := range utf8String {
		// Try to encode the single rune
		encodedRune, _, err := transform.String(encoder, string(r))
		if err != nil {
			// If encoding fails, it means the rune is not supported by Windows-1252
			buf.WriteByte('?') // Replace with '?'
			hadReplacements = true
		} else {
			// If successful, append the encoded bytes
			buf.WriteString(encodedRune)
		}
	}

	return buf.Bytes(), hadReplacements, nil
}
