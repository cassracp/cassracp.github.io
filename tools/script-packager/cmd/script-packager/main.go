package main

import (
	"flag"
	"fmt"
	"log"

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

	// Define os flags para a seleção de scripts e os parâmetros de conexão com o banco de dados
	selection := flag.String("s", "", "Comma-separated numbers of scripts to select (e.g., '1,3,5') or 'all'")
	dbHost := flag.String("dbhost", "localhost", "Database host")
	dbPort := flag.String("dbport", "5432", "Database port")
	dbUser := flag.String("dbuser", "postgres", "Database user")
	dbPass := flag.String("dbpass", "", "Database password")
	dbName := flag.String("dbname", "docwin", "Database name")
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

	// Create packager instance with DB connection details
	pkg := packager.NewPackager(ghClient, *dbHost, *dbPort, *dbUser, *dbPass, *dbName)

	err = pkg.ExecuteUnifiedScript(selectedScripts)
	if err != nil {
		log.Fatalf("Failed to execute unified script: %v", err)
	}

	fmt.Println("Unified script execution completed successfully.")
}
