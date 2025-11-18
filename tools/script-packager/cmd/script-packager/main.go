package main

import (
	"bytes"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

const (
	markerBat     = "---START-BAT---"
	markerSqlU8   = "---START-SQL-U8---"
	markerSqlW1252 = "---START-SQL-W1252---"
	markerEnd     = "---END-PAYLOADS---" // A new marker to signify the end of all payloads
)

func main() {
	// Create a temporary directory for extracted files
	tempDir, err := os.MkdirTemp("", "sql_scripts_exec")
	if err != nil {
		fmt.Printf("[ERRO] Não foi possível criar diretório temporário: %v\n", err)
		pauseAndExit(1)
	}
	// Ensure the temporary directory is cleaned up
	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("[ERRO] Recuperado de pânico: %v\n", r)
		}
		fmt.Printf("Limpando diretório temporário: %s\n", tempDir)
		if err := os.RemoveAll(tempDir); err != nil {
			fmt.Printf("[ERRO] Não foi possível remover diretório temporário: %v\n", err)
		}
	}()

	fmt.Println("Iniciando extração de scripts...")

	// Get the path to the current executable
	exePath, err := os.Executable()
	if err != nil {
		fmt.Printf("[ERRO] Não foi possível obter o caminho do executável: %v\n", err)
		pauseAndExit(1)
	}

	// Read the content of the executable
	exeContent, err := os.ReadFile(exePath)
	if err != nil {
		fmt.Printf("[ERRO] Não foi possível ler o conteúdo do executável: %v\n", err)
		pauseAndExit(1)
	}

	// Extract payloads
	batContent, sqlU8Content, sqlW1252Content, err := extractPayloads(exeContent)
	if err != nil {
		fmt.Printf("[ERRO] Falha ao extrair payloads: %v\n", err)
		pauseAndExit(1)
	}

	// Write extracted contents to temporary files
	batsFilePath := filepath.Join(tempDir, "ExecutarScript.bat")
	sqlU8FilePath := filepath.Join(tempDir, "ScriptsUnificados_utf8.sql")
	sqlW1252FilePath := filepath.Join(tempDir, "ScriptsUnificados_win1252.sql")

	if err := os.WriteFile(batFilePath, batContent, 0755); err != nil {
		fmt.Printf("[ERRO] Não foi possível escrever ExecutarScript.bat: %v\n", err)
		pauseAndExit(1)
	}
	if err := os.WriteFile(sqlU8FilePath, sqlU8Content, 0644); err != nil {
		fmt.Printf("[ERRO] Não foi possível escrever ScriptsUnificados_utf8.sql: %v\n", err)
		pauseAndExit(1)
	}
	if err := os.WriteFile(sqlW1252FilePath, sqlW1252Content, 0644); err != nil {
		fmt.Printf("[ERRO] Não foi possível escrever ScriptsUnificados_win1252.sql: %v\n", err)
		pauseAndExit(1)
	}

	fmt.Println("Scripts extraídos para o diretório temporário.")

	// Execute the batch file
	cmd := exec.Command("cmd.exe", "/c", batFilePath)
	cmd.Dir = tempDir // Set working directory for the batch file
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	fmt.Println("Executando ExecutarScript.bat...")
	if err := cmd.Run(); err != nil {
		fmt.Printf("[ERRO] Falha ao executar o script batch: %v\n", err)
		pauseAndExit(cmd.ProcessState.ExitCode())
	}

	fmt.Println("Execução do script concluída.")
	pauseAndExit(0)
}

func extractPayloads(exeContent []byte) ([]byte, []byte, []byte, error) {
	parts := bytes.SplitN(exeContent, []byte(markerBat), 2)
	if len(parts) < 2 {
		return nil, nil, nil, fmt.Errorf("marcador BAT não encontrado")
	}
	afterBat := parts[1]

	parts = bytes.SplitN(afterBat, []byte(markerSqlU8), 2)
	if len(parts) < 2 {
		return nil, nil, nil, fmt.Errorf("marcador SQL U8 não encontrado")
	}
	batsContent := parts[0]
	afterSqlU8 := parts[1]

	parts = bytes.SplitN(afterSqlU8, []byte(markerSqlW1252), 2)
	if len(parts) < 2 {
		return nil, nil, nil, fmt.Errorf("marcador SQL W1252 não encontrado")
	}
	sqlU8Content := parts[0]
	afterSqlW1252 := parts[1]

	parts = bytes.SplitN(afterSqlW1252, []byte(markerEnd), 2)
	if len(parts) < 2 {
		return nil, nil, nil, fmt.Errorf("marcador END não encontrado")
	}
	sqlW1252Content := parts[0]

	return batContent, sqlU8Content, sqlW1252Content, nil
}

func pauseAndExit(code int) {
	fmt.Println("Pressione qualquer tecla para continuar...")
	_, _ = fmt.Scanln() // Wait for user input
	os.Exit(code)
}