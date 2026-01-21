package github

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

const (
	apiBaseURL   = "https://api.github.com"
	githubOwner  = "demariasoftware"
	githubRepo   = "doc-windows2017"
	githubBranch = "bombeiro"
	scriptsPath  = "scripts"
)

// Script represents a script file in the repository.
type Script struct {
	Name string
	Path string
	SHA  string
}

// Client is a client for interacting with the GitHub API.
type Client struct {
	httpClient *http.Client
	token      string
	repoURL    string
}

// NewClient creates a new GitHub API client.
// It requires the GITHUB_PAT environment variable for authentication.
func NewClient() (*Client, error) {
	token := os.Getenv("GITHUB_PAT")
	if token == "" {
		return nil, fmt.Errorf("required environment variable GITHUB_PAT is not set")
	}

	repoURL := fmt.Sprintf("%s/repos/%s/%s/contents/%s?ref=%s", apiBaseURL, githubOwner, githubRepo, scriptsPath, githubBranch)

	return &Client{
		httpClient: &http.Client{Timeout: 10 * time.Second},
		token:      token,
		repoURL:    repoURL,
	}, nil
}

// ListScripts fetches the list of .sql scripts from the repository.
func (c *Client) ListScripts() ([]Script, error) {
	req, err := http.NewRequest("GET", c.repoURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Accept", "application/vnd.github.v3+json")
	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("github api returned non-200 status: %s", resp.Status)
	}

	var contents []struct {
		Type string `json:"type"`
		Name string `json:"name"`
		Path string `json:"path"`
		SHA  string `json:"sha"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&contents); err != nil {
		return nil, fmt.Errorf("failed to decode json response: %w", err)
	}

	var scripts []Script
	for _, item := range contents {
		if item.Type == "file" && strings.HasSuffix(strings.ToLower(item.Name), ".sql") {
			scripts = append(scripts, Script{
				Name: item.Name,
				Path: item.Path,
				SHA:  item.SHA,
			})
		}
	}

	return scripts, nil
}

// GetScriptContent fetches the raw content of a specific script file.
func (c *Client) GetScriptContent(scriptPath string) ([]byte, error) {
	rawURL := fmt.Sprintf("https://raw.githubusercontent.com/%s/%s/%s/%s", githubOwner, githubRepo, githubBranch, scriptPath)

	req, err := http.NewRequest("GET", rawURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create raw content request: %w", err)
	}

	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to execute raw content request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("github raw content api returned non-200 status: %s", resp.Status)
	}

	content, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read raw content body: %w", err)
	}

	return content, nil
}