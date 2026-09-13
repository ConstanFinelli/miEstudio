package materials

import (
	"bufio"
	"io"
	"os"
	"regexp"
	"strconv"

	"github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu/model"
)

var (
	// Regex fallback for PDF page count if standard parser fails
	countRegex = regexp.MustCompile(`/Count\s+(\d+)`)
	pageTypeRegex = regexp.MustCompile(`/Type\s*/Page\b`)
)

// CountPDFPages determines the number of pages in a PDF file at filePath.
// It first attempts to use pdfcpu (robust ISO 32000 parser).
// If that fails (e.g. slight syntax irregularity or encrypted metadata),
// it falls back to a fast byte scanner.
func CountPDFPages(filePath string) (int, error) {
	if f, err := os.Open(filePath); err == nil {
		defer f.Close()
		conf := model.NewDefaultConfiguration()
		conf.ValidationMode = model.ValidationRelaxed
		count, pErr := api.PageCount(f, conf)
		if pErr == nil && count > 0 {
			return count, nil
		}
	}

	// Fallback: fast scan of the PDF file
	fallbackCount, fallbackErr := countPagesFallback(filePath)
	if fallbackErr == nil && fallbackCount > 0 {
		return fallbackCount, nil
	}

	return fallbackCount, fallbackErr
}

func countPagesFallback(filePath string) (int, error) {
	f, err := os.Open(filePath)
	if err != nil {
		return 0, err
	}
	defer f.Close()

	reader := bufio.NewReader(f)
	var maxCount int
	var pageTypesCount int

	buf := make([]byte, 64*1024)
	for {
		n, rErr := reader.Read(buf)
		if n > 0 {
			chunk := string(buf[:n])

			// Look for /Count N
			matches := countRegex.FindAllStringSubmatch(chunk, -1)
			for _, m := range matches {
				if len(m) > 1 {
					if c, err := strconv.Atoi(m[1]); err == nil && c > maxCount {
						maxCount = c
					}
				}
			}

			// Look for /Type /Page
			typeMatches := pageTypeRegex.FindAllStringIndex(chunk, -1)
			pageTypesCount += len(typeMatches)
		}

		if rErr != nil {
			if rErr == io.EOF {
				break
			}
			return 0, rErr
		}
	}

	if maxCount > 0 {
		return maxCount, nil
	}
	if pageTypesCount > 0 {
		return pageTypesCount, nil
	}

	return 0, nil
}
