package types

import (
	"fmt"
	"regexp"
	"strings"
)

type TypeKind string

const (
	NumberKind     TypeKind = "number"
	StringKind     TypeKind = "string"
	BooleanKind    TypeKind = "boolean"
	ArrayKind      TypeKind = "array"
	MatrixKind     TypeKind = "matrix"
	TreeKind       TypeKind = "tree"
	LinkedListKind TypeKind = "linkedlist"
	GraphKind      TypeKind = "graph"
	VoidKind       TypeKind = "void" // For functions that return nothing, if needed
)

type ParsedType struct {
	Kind    TypeKind
	Element *ParsedType // For array<T>, matrix<T>, tree<T>, linkedlist<T>, graph<T>
}

func (t ParsedType) String() string {
	if t.Element == nil {
		return string(t.Kind)
	}
	return fmt.Sprintf("%s<%s>", t.Kind, t.Element.String())
}

var typeRegex = regexp.MustCompile(`^([a-z]+)(?:<(.+)>)?$`)

// ParseType parses a type string like "array<number>" or "matrix<string>"
func ParseType(s string) (ParsedType, error) {
	s = strings.TrimSpace(s)
	if s == "" {
		return ParsedType{}, fmt.Errorf("empty type string")
	}

	matches := typeRegex.FindStringSubmatch(s)
	if matches == nil {
		return ParsedType{}, fmt.Errorf("invalid type format: %s", s)
	}

	kind := TypeKind(matches[1])
	inner := matches[2]

	switch kind {
	case NumberKind, StringKind, BooleanKind, VoidKind:
		if inner != "" {
			return ParsedType{}, fmt.Errorf("primitive type %s cannot have generic parameters", kind)
		}
		return ParsedType{Kind: kind}, nil

	case ArrayKind, MatrixKind, TreeKind, LinkedListKind, GraphKind:
		if inner == "" {
			return ParsedType{}, fmt.Errorf("type %s requires a generic parameter (e.g., %s<number>)", kind, kind)
		}
		innerType, err := ParseType(inner)
		if err != nil {
			return ParsedType{}, fmt.Errorf("invalid inner type for %s: %w", kind, err)
		}
		return ParsedType{
			Kind:    kind,
			Element: &innerType,
		}, nil

	default:
		return ParsedType{}, fmt.Errorf("unknown type kind: %s", kind)
	}
}

// IsValid checks if a type string is valid according to our grammar
func IsValid(s string) bool {
	_, err := ParseType(s)
	return err == nil
}
