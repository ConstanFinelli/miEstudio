package storage

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"

	"miestudio/backend/internal/config"
)

// R2Storage implementa StorageService utilizando Cloudflare R2 (o cualquier servicio compatible con Amazon S3)
type R2Storage struct {
	client    *s3.Client
	presign   *s3.PresignClient
	bucket    string
	publicURL string
}

// NewR2Storage inicializa la conexión con el bucket de Cloudflare R2
func NewR2Storage(cfg *config.Config) (*R2Storage, error) {
	if strings.TrimSpace(cfg.R2BucketName) == "" {
		return nil, errors.New("R2_BUCKET_NAME es requerido para usar el storage R2")
	}
	if strings.TrimSpace(cfg.R2AccessKeyID) == "" || strings.TrimSpace(cfg.R2SecretAccessKey) == "" {
		return nil, errors.New("R2_ACCESS_KEY_ID y R2_SECRET_ACCESS_KEY son requeridos para usar el storage R2")
	}
	if strings.TrimSpace(cfg.R2Endpoint) == "" {
		return nil, errors.New("R2_ENDPOINT o R2_ACCOUNT_ID es requerido para usar el storage R2")
	}

	creds := credentials.NewStaticCredentialsProvider(
		strings.TrimSpace(cfg.R2AccessKeyID),
		strings.TrimSpace(cfg.R2SecretAccessKey),
		"",
	)

	// Cargar configuración de AWS SDK v2 con credenciales estáticas y región "auto" (estándar de Cloudflare R2)
	awsCfg, err := awsconfig.LoadDefaultConfig(
		context.Background(),
		awsconfig.WithCredentialsProvider(creds),
		awsconfig.WithRegion("auto"),
	)
	if err != nil {
		return nil, fmt.Errorf("error al inicializar configuración de AWS SDK para R2: %w", err)
	}

	endpoint := strings.TrimRight(cfg.R2Endpoint, "/")

	// Crear cliente S3 apuntando explícitamente al endpoint de R2
	s3Client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
		o.Region = "auto"
		// Cloudflare R2 no utiliza virtual-host addressing por defecto a menos que se configure custom domain
		o.UsePathStyle = true
	})

	presignClient := s3.NewPresignClient(s3Client)

	return &R2Storage{
		client:    s3Client,
		presign:   presignClient,
		bucket:    strings.TrimSpace(cfg.R2BucketName),
		publicURL: strings.TrimRight(strings.TrimSpace(cfg.R2PublicURL), "/"),
	}, nil
}

// Save almacena un archivo en el bucket de Cloudflare R2
func (r *R2Storage) Save(ctx context.Context, file io.Reader, originalFilename string, mimeType string) (string, int64, error) {
	data, err := io.ReadAll(file)
	if err != nil {
		return "", 0, fmt.Errorf("error al leer el contenido del archivo: %w", err)
	}

	size := int64(len(data))
	ext := filepath.Ext(originalFilename)
	key := fmt.Sprintf("%s%s", uuid.New().String(), ext)

	if mimeType == "" {
		mimeType = "application/octet-stream"
	}

	input := &s3.PutObjectInput{
		Bucket:        aws.String(r.bucket),
		Key:           aws.String(key),
		Body:          bytes.NewReader(data),
		ContentLength: aws.Int64(size),
		ContentType:   aws.String(mimeType),
	}

	_, err = r.client.PutObject(ctx, input)
	if err != nil {
		return "", 0, fmt.Errorf("error al subir objeto a Cloudflare R2: %w", err)
	}

	return key, size, nil
}

// Get obtiene el archivo desde Cloudflare R2 en un lector con capacidad de Seek para streaming y análisis de PDFs
func (r *R2Storage) Get(ctx context.Context, key string) (io.ReadSeekCloser, int64, error) {
	input := &s3.GetObjectInput{
		Bucket: aws.String(r.bucket),
		Key:    aws.String(key),
	}

	resp, err := r.client.GetObject(ctx, input)
	if err != nil {
		return nil, 0, fmt.Errorf("error al obtener objeto de Cloudflare R2 (%s): %w", key, err)
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, 0, fmt.Errorf("error al leer stream de Cloudflare R2: %w", err)
	}

	size := int64(len(data))
	return NewByteReadSeekCloser(data), size, nil
}

// GetFilePath devuelve "" en almacenamiento en la nube ya que no reside en disco local
func (r *R2Storage) GetFilePath(key string) string {
	return ""
}

// GetURL obtiene una URL pública (si fue configurada) o genera una URL prefirmada temporal (60 minutos)
func (r *R2Storage) GetURL(ctx context.Context, key string) (string, error) {
	if r.publicURL != "" {
		return fmt.Sprintf("%s/%s", r.publicURL, key), nil
	}

	req, err := r.presign.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(r.bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(60*time.Minute))
	if err != nil {
		return "", fmt.Errorf("error al generar URL prefirmada de R2: %w", err)
	}

	return req.URL, nil
}

// Delete elimina un objeto del bucket de Cloudflare R2
func (r *R2Storage) Delete(ctx context.Context, key string) error {
	input := &s3.DeleteObjectInput{
		Bucket: aws.String(r.bucket),
		Key:    aws.String(key),
	}

	_, err := r.client.DeleteObject(ctx, input)
	if err != nil {
		return fmt.Errorf("error al eliminar objeto de Cloudflare R2 (%s): %w", key, err)
	}

	return nil
}
