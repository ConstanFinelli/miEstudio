package storage

import (
	"bytes"
	"context"
	"io"
	"os"
	"testing"

	"miestudio/backend/internal/config"
)

func TestLocalStorage_CRUD(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "miestudio_test_storage_*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	s, err := NewLocalStorage(tempDir)
	if err != nil {
		t.Fatalf("failed to init LocalStorage: %v", err)
	}

	ctx := context.Background()
	content := []byte("PDF test content for academic materials")
	key, size, err := s.Save(ctx, bytes.NewReader(content), "apunte.pdf", "application/pdf")
	if err != nil {
		t.Fatalf("failed to save: %v", err)
	}
	if size != int64(len(content)) {
		t.Errorf("expected size %d, got %d", len(content), size)
	}

	// Verify Get
	rsc, readSize, err := s.Get(ctx, key)
	if err != nil {
		t.Fatalf("failed to get file: %v", err)
	}
	defer rsc.Close()

	if readSize != size {
		t.Errorf("expected readSize %d, got %d", size, readSize)
	}

	readBytes, err := io.ReadAll(rsc)
	if err != nil {
		t.Fatalf("failed to read stream: %v", err)
	}
	if string(readBytes) != string(content) {
		t.Errorf("expected content %s, got %s", content, readBytes)
	}

	// Verify Delete
	if err := s.Delete(ctx, key); err != nil {
		t.Fatalf("failed to delete file: %v", err)
	}

	// Verify Get after delete
	_, _, err = s.Get(ctx, key)
	if err == nil {
		t.Fatal("expected error getting deleted file, got nil")
	}
}

func TestByteReadSeekCloser(t *testing.T) {
	sample := []byte("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ")
	rsc := NewByteReadSeekCloser(sample)
	defer rsc.Close()

	// Read first 5
	buf := make([]byte, 5)
	n, err := rsc.Read(buf)
	if err != nil || n != 5 || string(buf) != "01234" {
		t.Fatalf("read mismatch: %s, err: %v", string(buf), err)
	}

	// Seek to offset 10
	off, err := rsc.Seek(10, io.SeekStart)
	if err != nil || off != 10 {
		t.Fatalf("seek failed: %d, err: %v", off, err)
	}

	// Read next 5
	n, err = rsc.Read(buf)
	if err != nil || n != 5 || string(buf) != "ABCDE" {
		t.Fatalf("read after seek mismatch: %s, err: %v", string(buf), err)
	}
}

func TestNewR2Storage_Validation(t *testing.T) {
	// Missing bucket name
	cfg1 := &config.Config{}
	_, err := NewR2Storage(cfg1)
	if err == nil {
		t.Fatal("expected error on missing bucket, got nil")
	}

	// Missing credentials
	cfg2 := &config.Config{R2BucketName: "test-bucket"}
	_, err = NewR2Storage(cfg2)
	if err == nil {
		t.Fatal("expected error on missing credentials, got nil")
	}

	// Missing endpoint
	cfg3 := &config.Config{
		R2BucketName:      "test-bucket",
		R2AccessKeyID:     "test-key",
		R2SecretAccessKey: "test-secret",
	}
	_, err = NewR2Storage(cfg3)
	if err == nil {
		t.Fatal("expected error on missing endpoint, got nil")
	}

	// Valid config
	cfg4 := &config.Config{
		R2BucketName:      "test-bucket",
		R2AccessKeyID:     "test-key",
		R2SecretAccessKey: "test-secret",
		R2Endpoint:        "https://test.r2.cloudflarestorage.com",
	}
	r2, err := NewR2Storage(cfg4)
	if err != nil {
		t.Fatalf("expected successful init of R2 client, got: %v", err)
	}
	if r2.GetFilePath("any-key") != "" {
		t.Errorf("expected empty GetFilePath for R2, got %s", r2.GetFilePath("any-key"))
	}
}

