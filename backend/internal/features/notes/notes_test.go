package notes

import (
	"bytes"
	"context"
	"io"
	"os"
	"testing"

	"miestudio/backend/internal/storage"
)

type mockNotesRepo struct {
	notes map[string]*Apunte
}

func newMockNotesRepo() *mockNotesRepo {
	return &mockNotesRepo{notes: make(map[string]*Apunte)}
}

func (m *mockNotesRepo) GetAll(ctx context.Context, usuarioID, materiaID, carpeta, search string) ([]Apunte, error) {
	var list []Apunte
	for _, n := range m.notes {
		list = append(list, *n)
	}
	return list, nil
}

func (m *mockNotesRepo) GetByID(ctx context.Context, id string) (*Apunte, error) {
	n, ok := m.notes[id]
	if !ok {
		return nil, os.ErrNotExist
	}
	return n, nil
}

func (m *mockNotesRepo) Create(ctx context.Context, apunte *Apunte) error {
	m.notes[apunte.ID] = apunte
	return nil
}

func (m *mockNotesRepo) Update(ctx context.Context, apunte *Apunte) error {
	m.notes[apunte.ID] = apunte
	return nil
}

func (m *mockNotesRepo) Delete(ctx context.Context, id string) error {
	delete(m.notes, id)
	return nil
}

func TestNotesService_ImageUploadAndGet(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "notes_storage_test_*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	localStorage, err := storage.NewLocalStorage(tempDir)
	if err != nil {
		t.Fatalf("failed to init LocalStorage: %v", err)
	}

	repo := newMockNotesRepo()
	service := NewService(repo, localStorage)
	ctx := context.Background()

	// 1. Upload valid image
	imgData := []byte("\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDRfake_png_data")
	key, err := service.UploadImage(ctx, bytes.NewReader(imgData), "grafico_circuito.png", "image/png")
	if err != nil {
		t.Fatalf("UploadImage failed: %v", err)
	}
	if key == "" {
		t.Fatal("expected non-empty key")
	}

	// 2. Retrieve image
	stream, size, mimeType, err := service.GetImage(ctx, key)
	if err != nil {
		t.Fatalf("GetImage failed: %v", err)
	}
	defer stream.Close()

	if mimeType != "image/png" {
		t.Errorf("expected mimeType image/png, got %s", mimeType)
	}
	if size != int64(len(imgData)) {
		t.Errorf("expected size %d, got %d", len(imgData), size)
	}

	readBytes, err := io.ReadAll(stream)
	if err != nil {
		t.Fatalf("failed to read stream: %v", err)
	}
	if !bytes.Equal(readBytes, imgData) {
		t.Errorf("content mismatch")
	}

	// 3. Reject invalid non-image file
	textData := []byte("Not an image")
	_, err = service.UploadImage(ctx, bytes.NewReader(textData), "malicioso.exe", "application/x-msdownload")
	if err == nil {
		t.Errorf("expected error for non-image file upload, got nil")
	}
}
