package utils

import (
	"regexp"
	"strings"
)

func Slugify(text string) string {
	text = strings.ToLower(text)

	re := regexp.MustCompile(`\s+`)
	text = re.ReplaceAllString(text, "-")

	re = regexp.MustCompile(`[^\w-]`)
	text = re.ReplaceAllString(text, "")

	return text
}