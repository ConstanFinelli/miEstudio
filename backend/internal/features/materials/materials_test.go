package materials

import (
	"bytes"
	"context"
	"io"
	"os"
	"testing"

	"miestudio/backend/internal/storage"
)

type mockRepository struct {
	items map[string]*Material
}

func newMockRepository() *mockRepository {
	return &mockRepository{items: make(map[string]*Material)}
}

func (m *mockRepository) Create(ctx context.Context, material *Material) error {
	m.items[material.ID] = material
	return nil
}

func (m *mockRepository) GetByID(ctx context.Context, id string) (*Material, error) {
	mat, ok := m.items[id]
	if !ok {
		return nil, os.ErrNotExist
	}
	return mat, nil
}

func (m *mockRepository) GetByMateria(ctx context.Context, usuarioID, materiaID, categoria string) ([]Material, error) {
	var list []Material
	for _, item := range m.items {
		if item.MateriaID == materiaID {
			list = append(list, *item)
		}
	}
	return list, nil
}

func (m *mockRepository) Update(ctx context.Context, material *Material) error {
	m.items[material.ID] = material
	return nil
}

func (m *mockRepository) Delete(ctx context.Context, id string) error {
	delete(m.items, id)
	return nil
}

func (m *mockRepository) DeleteByMateria(ctx context.Context, usuarioID, materiaID string) ([]Material, error) {
	var deleted []Material
	for id, item := range m.items {
		if item.MateriaID == materiaID {
			deleted = append(deleted, *item)
			delete(m.items, id)
		}
	}
	return deleted, nil
}

func (m *mockRepository) GetPendingPageCount(ctx context.Context) ([]Material, error) {
	var pending []Material
	for _, item := range m.items {
		if item.CantPaginas == nil {
			pending = append(pending, *item)
		}
	}
	return pending, nil
}

func TestUploadAndStreamMaterial(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "miestudio_mat_test_*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	store, err := storage.NewLocalStorage(tempDir)
	if err != nil {
		t.Fatalf("failed to init storage: %v", err)
	}

	repo := newMockRepository()
	svc := NewService(repo, store)
	ctx := context.Background()

	pdfContent := []byte("%PDF-1.4 mock content with academic units")
	uploaded, err := svc.UploadMaterial(
		ctx,
		"user-1",
		"materia-101",
		"Guía de Trabajos Prácticos 1",
		"PRACTICA",
		"Unidad 1",
		bytes.NewReader(pdfContent),
		"guia1.pdf",
		"application/pdf",
	)
	if err != nil {
		t.Fatalf("failed to upload material: %v", err)
	}

	if uploaded.ID == "" || uploaded.ArchivoKey == "" {
		t.Fatalf("invalid uploaded material: %+v", uploaded)
	}
	if uploaded.Titulo != "Guía de Trabajos Prácticos 1" {
		t.Errorf("expected title 'Guía de Trabajos Prácticos 1', got '%s'", uploaded.Titulo)
	}

	// Test GetFileStream
	stream, size, mat, err := svc.GetFileStream(ctx, uploaded.ID)
	if err != nil {
		t.Fatalf("failed to get file stream: %v", err)
	}
	defer stream.Close()

	if size != int64(len(pdfContent)) {
		t.Errorf("expected size %d, got %d", len(pdfContent), size)
	}
	if mat.ID != uploaded.ID {
		t.Errorf("expected mat ID %s, got %s", uploaded.ID, mat.ID)
	}

	downloaded, err := io.ReadAll(stream)
	if err != nil {
		t.Fatalf("failed to read from stream: %v", err)
	}
	if string(downloaded) != string(pdfContent) {
		t.Errorf("expected content %s, got %s", string(pdfContent), string(downloaded))
	}

	// Test DeleteMaterial
	if err := svc.DeleteMaterial(ctx, uploaded.ID); err != nil {
		t.Fatalf("failed to delete material: %v", err)
	}

	_, _, _, err = svc.GetFileStream(ctx, uploaded.ID)
	if err == nil {
		t.Fatal("expected error after delete, got nil")
	}
}
