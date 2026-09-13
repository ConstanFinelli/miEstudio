package materials

import (
	"os"
	"path/filepath"
	"testing"
)

func TestCountPDFPages(t *testing.T) {
	files := []string{
		"../../../uploads/01cbbfc5-d0f5-4a67-9ffb-0882ddfeabba.pdf",
		"../../../uploads/05757489-13aa-4740-8802-8e9d9a95efb3.pdf",
		"../../../uploads/b57a58a2-b758-4722-8004-c1df6dc09413.pdf",
	}

	for _, relPath := range files {
		absPath, err := filepath.Abs(relPath)
		if err != nil {
			t.Fatalf("Abs error: %v", err)
		}

		if _, err := os.Stat(absPath); os.IsNotExist(err) {
			t.Logf("Skipping non-existent test file: %s", absPath)
			continue
		}

		count, err := CountPDFPages(absPath)
		if err != nil {
			t.Errorf("Error counting pages for %s: %v", absPath, err)
		} else {
			t.Logf("File: %s -> %d pages", filepath.Base(absPath), count)
			if count <= 0 {
				t.Errorf("Expected count > 0 for %s, got %d", absPath, count)
			}
		}
	}
}
