package ui

import (
	"fmt"
	"sort"
	"strconv"
	"strings"

	"github.com/cassracp/script-packager/internal/github"
)

// DisplayScripts shows a numbered list of scripts to the user.
func DisplayScripts(scripts []github.Script) {
	if len(scripts) == 0 {
		fmt.Println("No scripts available.")
		return
	}

	// Sort scripts by name for consistent display
	sort.Slice(scripts, func(i, j int) bool {
		return scripts[i].Name < scripts[j].Name
	})

	fmt.Println("\nAvailable Scripts:")
	for i, script := range scripts {
		fmt.Printf("%d. %s\n", i+1, script.Name)
	}
}

// ParseSelection takes a selection string (e.g., "1,3,5" or "all") and returns the selected scripts.
func ParseSelection(selection string, allScripts []github.Script) ([]github.Script, error) {
	if len(allScripts) == 0 {
		return nil, fmt.Errorf("no scripts available for selection")
	}

	// Sort scripts by name for consistent indexing
	sort.Slice(allScripts, func(i, j int) bool {
		return allScripts[i].Name < allScripts[j].Name
	})

	if strings.ToLower(selection) == "all" {
		return allScripts, nil
	}

	var selectedScripts []github.Script
	selectedIndices := make(map[int]bool) // To prevent duplicate selections

	parts := strings.Split(selection, ",")
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}

		idx, err := strconv.Atoi(p)
		if err != nil {
			return nil, fmt.Errorf("invalid input '%s': please enter numbers separated by commas", p)
		}

		if idx < 1 || idx > len(allScripts) {
			return nil, fmt.Errorf("invalid script number: %d. Please enter numbers between 1 and %d", idx, len(allScripts))
		}

		if !selectedIndices[idx-1] { // Check if already selected
			selectedScripts = append(selectedScripts, allScripts[idx-1])
			selectedIndices[idx-1] = true
		}
	}

	if len(selectedScripts) == 0 {
		return nil, fmt.Errorf("no valid scripts selected from '%s'", selection)
	}

	return selectedScripts, nil
}
