package packager

import (
	"archive/zip"
	"bytes" // Added this import
	"fmt"
	"os"
	"strings"

	"github.com/cassracp/script-packager/internal/github"
	"github.com/cassracp/script-packager/pkg/encoding"
	goencoding "golang.org/x/text/encoding"
	"golang.org/x/text/encoding/charmap"
	"golang.org/x/text/transform"
)

// Packager handles the logic for unifying, encoding, and zipping scripts.
type Packager struct {
	ghClient *github.Client
}

// NewPackager creates a new Packager instance.
func NewPackager(client *github.Client) *Packager {
	return &Packager{
		ghClient: client,
	}
}

// CreateUnifiedPackage fetches selected scripts, unifies them,
// generates two SQL files (UTF-8 and Windows-1252), a .bat file,
// and zips them into a single archive.
func (p *Packager) CreateUnifiedPackage(selectedScripts []github.Script, outputPath string) error {
	var unifiedSqlContentBuilder strings.Builder
	unifiedSqlContentBuilder.WriteString("\\set ON_ERROR_STOP on\r\n\r\n")
	unifiedSqlContentBuilder.WriteString("BEGIN;\r\n\r\n")

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
			// Use golang.org/x/text/encoding to decode from detectedEncoding to UTF-8
			// For simplicity, we'll assume detectedEncoding is directly usable by golang.org/x/text/encoding
			// A more robust solution might involve a mapping for less common names.
			decoder := goencoding.Nop.NewDecoder() // Default to Nop if specific decoder not found
			if detectedEncoding == "windows-1252" {
				decoder = charmap.Windows1252.NewDecoder()
			} else if detectedEncoding == "ISO-8859-1" { // chardet might return this
				decoder = charmap.ISO8859_1.NewDecoder()
			}
			
			decodedBytes, _, err := transform.Bytes(decoder, rawContent)
			if err != nil {
				return fmt.Errorf("failed to decode %s from %s to UTF-8: %w", script.Name, detectedEncoding, err)
			}
			decodedContent = string(decodedBytes)
		}

		unifiedSqlContentBuilder.WriteString(fmt.Sprintf("/*=====%s=====*/\r\n", script.Name))
		unifiedSqlContentBuilder.WriteString(strings.TrimSpace(decodedContent))
		unifiedSqlContentBuilder.WriteString(";\r\n") // Ensure semicolon and newline
	}

	unifiedSqlContentBuilder.WriteString("\r\n\r\nCOMMIT;")
	finalSqlString := unifiedSqlContentBuilder.String()

	batchContent := generateBatchContent()

	// Create the zip file
	zipFile, err := os.Create(outputPath)
	if err != nil {
		return fmt.Errorf("failed to create zip file: %w", err)
	}
	defer zipFile.Close()

	zipWriter := zip.NewWriter(zipFile)
	defer zipWriter.Close()

	// Add UTF-8 SQL file
	utf8SqlFile, err := zipWriter.Create("ScriptsUnificados_utf8.sql")
	if err != nil {
		return fmt.Errorf("failed to create utf8 sql file in zip: %w", err)
	}
	_, err = utf8SqlFile.Write([]byte(finalSqlString))
	if err != nil {
		return fmt.Errorf("failed to write utf8 sql content to zip: %w", err)
	}

	// Add Windows-1252 SQL file
	win1252Bytes, hadReplacements, err := convertToWindows1252(finalSqlString)
	if err != nil {
		return fmt.Errorf("failed to convert to windows-1252 for zip: %w", err)
	}
	if hadReplacements {
		fmt.Println("Warning: Some characters in ScriptsUnificados_win1252.sql were replaced due to encoding incompatibility.")
	}
	win1252SqlFile, err := zipWriter.Create("ScriptsUnificados_win1252.sql")
	if err != nil {
		return fmt.Errorf("failed to create win1252 sql file in zip: %w", err)
	}
	_, err = win1252SqlFile.Write(win1252Bytes)
	if err != nil {
		return fmt.Errorf("failed to write win1252 sql content to zip: %w", err)
	}

	// Add Batch file
	batchZipFile, err := zipWriter.Create("ExecutarScript.bat")
	if err != nil {
		return fmt.Errorf("failed to create batch file in zip: %w", err)
	}
	_, err = batchZipFile.Write([]byte(batchContent))
	if err != nil {
		return fmt.Errorf("failed to write batch content to zip: %w", err)
	}

	fmt.Printf("Successfully created unified package: %s\n", outputPath)
	return nil
}

// generateBatchContent creates the content for the ExecutarScript.bat file.
func generateBatchContent() string {
	return `@echo off
setlocal
chcp 65001 > nul
set "DB_USER=suporte"
set "DB_NAME=docwin"
set "PSQL_PATH=%SERVIDORDOC%\bin\psql.exe"
set "TEMP_ENCODING_FILE=db_encoding.tmp"
set "SCRIPT_UTF8=ScriptsUnificados_utf8.sql"
set "SCRIPT_WIN1252=ScriptsUnificados_win1252.sql"
if not defined SERVIDORDOC (
    echo.
    echo [ERRO] A variável de ambiente SERVIDORDOC não está definida.
    echo        Certifique-se de que o PostgreSQL esteja instalado e configurado.
    echo.
    pause
    exit /b 1
)
if not exist "%PSQL_PATH%" (
    echo.
    echo [ERRO] O executável psql.exe não foi encontrado em:
    echo "%PSQL_PATH%"
    echo.
    pause
    exit /b 1
)
echo.
echo --- Verificador e Executor de Scripts SQL ---
echo.
echo Tentando identificar o encoding do banco de dados '%DB_NAME%'...
"%PSQL_PATH%" -U %DB_USER% -d %DB_NAME% -t -c "SELECT pg_encoding_to_char(encoding) FROM pg_database WHERE datname = '%DB_NAME%';" > "%TEMP_ENCODING_FILE%" 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao conectar ao banco de dados ou executar a consulta.
    echo        Verifique as credenciais, o nome do banco e se o serviço do PostgreSQL está ativo.
    del "%TEMP_ENCODING_FILE%" >nul 2>nul
    echo.
    pause
    exit /b 1
)
set /p DB_ENCODING=<"%TEMP_ENCODING_FILE%"
del "%TEMP_ENCODING_FILE%"
for /f "tokens=* delims= " %%a in ("%DB_ENCODING%") do set "DB_ENCODING=%%a"
echo Encoding detectado: %DB_ENCODING%
echo.
set "SCRIPT_TO_RUN="
if /I "%DB_ENCODING%"=="UTF8" (
    echo Selecionando script para UTF-8...
    set "SCRIPT_TO_RUN=%SCRIPT_UTF8%"
    chcp 65001 > nul
) else if /I "%DB_ENCODING%"=="WIN1252" (
    echo Selecionando script para WIN-1252...
    set "SCRIPT_TO_RUN=%SCRIPT_WIN1252%"
    chcp 1252 > nul
) else (
    echo.
    echo [AVISO] Encoding não reconhecido: '%DB_ENCODING%'.
    echo         Não foi possível determinar o script correto para executar.
    echo.
    pause
    exit /b 1
)
if not exist "%SCRIPT_TO_RUN%" (
    echo.
    echo [ERRO] O arquivo de script '%SCRIPT_TO_RUN%' não foi encontrado.
    echo.
    pause
    exit /b 1
)
echo.
echo Executando: "%SCRIPT_TO_RUN%"
echo -------------------------------------------------
"%PSQL_PATH%" -U %DB_USER% -d %DB_NAME% -f "%SCRIPT_TO_RUN%"
if %errorlevel% neq 0 (
    echo.
    echo -------------------------------------------------
    echo [ERRO] Ocorreu um erro durante a execução do script SQL.
    echo.
) else (
    echo.
    echo -------------------------------------------------
    echo [SUCESSO] Script SQL executado com sucesso.
    echo.
)
pause
endlocal
exit /b 0
`
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
