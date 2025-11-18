package encoding

import (
	"fmt"
	"strings"

	"github.com/saintfish/chardet"
)

// DetectEncoding detects the character encoding of the provided byte slice.
// It returns the detected encoding name (e.g., "UTF-8", "windows-1252") or an error.
// If detection is uncertain, it defaults to "UTF-8".
func DetectEncoding(data []byte) (string, error) {
	detector := chardet.NewTextDetector()
	result, err := detector.DetectBest(data)
	if err != nil {
		// If detection fails, try to decode as UTF-8. If it's valid UTF-8, it's likely UTF-8.
		// This is a heuristic, but better than nothing.
		if strings.Contains(err.Error(), "invalid UTF-8") {
			return "windows-1252", nil // Heuristic: if not valid UTF-8, assume windows-1252
		}
		return "UTF-8", fmt.Errorf("failed to detect encoding: %w", err)
	}

	// chardet might return various names for windows-1252 or ISO-8859-1.
	// Normalize to "windows-1252" for consistency with TextDecoder in JS.
	// TextDecoder in Go (golang.org/x/text/encoding) also understands "windows-1252".
	if strings.Contains(strings.ToLower(result.Charset), "iso-8859") || strings.Contains(strings.ToLower(result.Charset), "windows-1252") {
		return "windows-1252", nil
	}

	// Default to UTF-8 if detection is not strong or for other common encodings
	// that are often compatible with UTF-8 for basic ASCII.
	if result.Confidence < 80 { // If confidence is low, default to UTF-8
		return "UTF-8", nil
	}

	return result.Charset, nil
}
