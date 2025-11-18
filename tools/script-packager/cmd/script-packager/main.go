package main

import (
	"flag"
	"fmt"
	"log"
	"path/filepath"

	"github.com/cassracp/script-packager/internal/github"
	"github.com/cassracp/script-packager/internal/packager"
	"github.com/cassracp/script-packager/internal/ui"
	"github.com/joho/godotenv"
)

func main() {
	// Carrega as variáveis de ambiente do arquivo .env no diretório do executável
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("Warning: .env file not found, relying on system environment variables")
	}

	// Define os flags para a seleção de scripts e o nome do arquivo de saída
	selection := flag.String("s", "", "Comma-separated numbers of scripts to select (e.g., '1,3,5') or 'all'")
	outputFile := flag.String("o", "ScriptsUnificados.zip", "Output zip file name")
	flag.Parse()

	fmt.Println("Script Packager Initializing...")

	ghClient, err := github.NewClient()
	if err != nil {
		log.Fatalf("Failed to create GitHub client: %v", err)
	}

	allScripts, err := ghClient.ListScripts()
	if err != nil {
		log.Fatalf("Failed to list scripts: %v", err)
	}

	if len(allScripts) == 0 {
		fmt.Println("No scripts found in the repository.")
		return
	}

	ui.DisplayScripts(allScripts) // Display all available scripts

	if *selection == "" {
		log.Fatal("No scripts selected. Please use the -s flag (e.g., -s '1,3,5' or -s 'all').")
	}

	selectedScripts, err := ui.ParseSelection(*selection, allScripts)
	if err != nil {
		log.Fatalf("Failed to parse script selection: %v", err)
	}

	// Create packager instance
	pkg := packager.NewPackager(ghClient)

	// Ensure output path is absolute or relative to current working directory
	absOutputPath, err := filepath.Abs(*outputFile)
	if err != nil {
		log.Fatalf("Failed to get absolute path for output file: %v", err)
	}

	err = pkg.CreateUnifiedPackage(selectedScripts, absOutputPath)
	if err != nil {
		log.Fatalf("Failed to create unified package: %v", err)
	}

	fmt.Printf("Unified package successfully created at %s\n", absOutputPath)
}
