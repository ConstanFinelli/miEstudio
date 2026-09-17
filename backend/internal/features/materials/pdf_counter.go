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
func CountPDFPages(filePath string) (int, error) {
	f, err := os.Open(filePath)
	if err != nil {
		return 0, err
	}
	defer f.Close()

	return CountPDFPagesFromReader(f)
}

// CountPDFPagesFromReader determines the number of pages in a PDF from an io.ReadSeeker stream.
// It first attempts to use pdfcpu (robust ISO 32000 parser).
// If that fails, it rewinds the stream and falls back to a fast byte scanner.
func CountPDFPagesFromReader(rs io.ReadSeeker) (int, error) {
	if rs == nil {
		return 0, io.ErrUnexpectedEOF
	}

	conf := model.NewDefaultConfiguration()
	conf.ValidationMode = model.ValidationRelaxed
	count, pErr := api.PageCount(rs, conf)
	if pErr == nil && count > 0 {
		return count, nil
	}

	// Rewind to start before running regex fallback
	if _, err := rs.Seek(0, io.SeekStart); err != nil {
		return count, pErr
	}

	fallbackCount, fallbackErr := countPagesFallbackFromReader(rs)
	if fallbackErr == nil && fallbackCount > 0 {
		return fallbackCount, nil
	}

	if pErr != nil {
		return 0, pErr
	}
	return fallbackCount, fallbackErr
}


func countPagesFallback(filePath string) (int, error) {
	f, err := os.Open(filePath)
	if err != nil {
		return 0, err
	}
	defer f.Close()

	return countPagesFallbackFromReader(f)
}

func countPagesFallbackFromReader(r io.Reader) (int, error) {
	reader := bufio.NewReader(r)

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
