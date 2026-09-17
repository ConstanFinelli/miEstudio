package storage

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/google/uuid"
)

type StorageService interface {
	Save(ctx context.Context, file io.Reader, originalFilename string, mimeType string) (key string, size int64, err error)
	Get(ctx context.Context, key string) (io.ReadSeekCloser, int64, error)
	GetFilePath(key string) string
	GetURL(ctx context.Context, key string) (string, error)
	Delete(ctx context.Context, key string) error
}

type LocalStorage struct {
	baseDir string
}

func NewLocalStorage(baseDir string) (*LocalStorage, error) {
	if err := os.MkdirAll(baseDir, 0755); err != nil {
		return nil, fmt.Errorf("no se pudo inicializar directorio de storage: %w", err)
	}
	return &LocalStorage{baseDir: baseDir}, nil
}

func (s *LocalStorage) Save(ctx context.Context, file io.Reader, originalFilename string, mimeType string) (string, int64, error) {
	ext := filepath.Ext(originalFilename)
	key := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	dstPath := filepath.Join(s.baseDir, key)

	out, err := os.Create(dstPath)
	if err != nil {
		return "", 0, fmt.Errorf("error al crear archivo local: %w", err)
	}
	defer out.Close()

	size, err := io.Copy(out, file)
	if err != nil {
		_ = os.Remove(dstPath)
		return "", 0, fmt.Errorf("error al escribir archivo: %w", err)
	}

	return key, size, nil
}

func (s *LocalStorage) Get(ctx context.Context, key string) (io.ReadSeekCloser, int64, error) {
	filePath := s.GetFilePath(key)
	f, err := os.Open(filePath)
	if err != nil {
		return nil, 0, fmt.Errorf("archivo no encontrado: %w", err)
	}

	stat, err := f.Stat()
	if err != nil {
		_ = f.Close()
		return nil, 0, err
	}

	return f, stat.Size(), nil
}

func (s *LocalStorage) GetFilePath(key string) string {
	return filepath.Join(s.baseDir, key)
}

func (s *LocalStorage) GetURL(ctx context.Context, key string) (string, error) {
	return "", nil
}

func (s *LocalStorage) Delete(ctx context.Context, key string) error {
	filePath := s.GetFilePath(key)
	if err := os.Remove(filePath); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("error al eliminar archivo físico: %w", err)
	}
	return nil
}

// ByteReadSeekCloser adapta un buffer en memoria a io.ReadSeekCloser
type ByteReadSeekCloser struct {
	*io.SectionReader
}

func NewByteReadSeekCloser(b []byte) *ByteReadSeekCloser {
	return &ByteReadSeekCloser{
		SectionReader: io.NewSectionReader(bytesReader(b), 0, int64(len(b))),
	}
}

func (b *ByteReadSeekCloser) Close() error {
	return nil
}

type bytesReader []byte

func (b bytesReader) ReadAt(p []byte, off int64) (n int, err error) {
	if off < 0 || off >= int64(len(b)) {
		return 0, io.EOF
	}
	n = copy(p, b[off:])
	if n < len(p) {
		err = io.EOF
	}
	return n, err
}

