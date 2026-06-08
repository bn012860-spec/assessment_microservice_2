package util

import "strings"

// UnescapeCode converts common escaped sequences (\\n, \\t, \\r, \\\\) into their
// actual characters. This helps when user-submitted code arrives with literal
// backslash-escaped sequences and needs to be written as source files.
func UnescapeCode(s string) string {
	if s == "" {
		return s
	}
	// First unescape escaped backslashes so we don't end up with double-escapes
	s = strings.ReplaceAll(s, "\\\\", "\\")
	// Now unescape common sequences
	s = strings.ReplaceAll(s, "\\r\\n", "\n")
	s = strings.ReplaceAll(s, "\\n", "\n")
	s = strings.ReplaceAll(s, "\\t", "\t")
	return s
}
