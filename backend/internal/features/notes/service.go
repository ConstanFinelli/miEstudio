package notes

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"miestudio/backend/internal/storage"
)

type Service interface {
	ListApuntes(ctx context.Context, usuarioID, materiaID, carpeta, search string) ([]Apunte, error)
	GetApunte(ctx context.Context, id string) (*Apunte, error)
	CreateApunte(ctx context.Context, dto CreateApunteDTO) (*Apunte, error)
	UpdateApunte(ctx context.Context, id string, dto UpdateApunteDTO) (*Apunte, error)
	DeleteApunte(ctx context.Context, id string) error
	UploadImage(ctx context.Context, file io.Reader, filename, mimeType string) (string, error)
	GetImage(ctx context.Context, key string) (io.ReadSeekCloser, int64, string, error)
}

type service struct {
	repo    Repository
	storage storage.StorageService
}

func NewService(repo Repository, storage storage.StorageService) Service {
	return &service{
		repo:    repo,
		storage: storage,
	}
}

func (s *service) ListApuntes(ctx context.Context, usuarioID, materiaID, carpeta, search string) ([]Apunte, error) {
	notes, err := s.repo.GetAll(ctx, usuarioID, materiaID, carpeta, search)
	if err != nil {
		return nil, err
	}

	for i := range notes {
		if notes[i].Materia != nil {
			notes[i].MateriaNombre = notes[i].Materia.Nombre
		}
		if notes[i].Etiquetas != "" {
			var tags []string
			if err := json.Unmarshal([]byte(notes[i].Etiquetas), &tags); err == nil {
				notes[i].Tags = tags
			}
		}
		if notes[i].Tags == nil {
			notes[i].Tags = []string{}
		}
	}

	return notes, nil
}

func (s *service) GetApunte(ctx context.Context, id string) (*Apunte, error) {
	note, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("apunte no encontrado")
		}
		return nil, err
	}

	if note.Materia != nil {
		note.MateriaNombre = note.Materia.Nombre
	}
	if note.Etiquetas != "" {
		var tags []string
		if err := json.Unmarshal([]byte(note.Etiquetas), &tags); err == nil {
			note.Tags = tags
		}
	}
	if note.Tags == nil {
		note.Tags = []string{}
	}

	return note, nil
}

func (s *service) CreateApunte(ctx context.Context, dto CreateApunteDTO) (*Apunte, error) {
	if dto.MateriaID == "" {
		return nil, errors.New("materia_id es requerido")
	}
	if dto.Titulo == "" {
		dto.Titulo = "Nuevo Apunte"
	}
	if dto.Carpeta == "" {
		dto.Carpeta = "General"
	}

	tagsJSON := "[]"
	if len(dto.Etiquetas) > 0 {
		if bytes, err := json.Marshal(dto.Etiquetas); err == nil {
			tagsJSON = string(bytes)
		}
	}

	apunte := &Apunte{
		ID:        uuid.New().String(),
		UsuarioID: dto.UsuarioID,
		MateriaID: dto.MateriaID,
		Titulo:    dto.Titulo,
		Contenido: dto.Contenido,
		Carpeta:   dto.Carpeta,
		Resumen:   dto.Resumen,
		Etiquetas: tagsJSON,
		Tags:      dto.Etiquetas,
	}
	if apunte.Tags == nil {
		apunte.Tags = []string{}
	}

	if err := s.repo.Create(ctx, apunte); err != nil {
		return nil, err
	}

	created, err := s.repo.GetByID(ctx, apunte.ID)
	if err == nil && created != nil {
		if created.Materia != nil {
			created.MateriaNombre = created.Materia.Nombre
		}
		if created.Tags == nil {
			created.Tags = []string{}
		}
		return created, nil
	}

	return apunte, nil
}

func (s *service) UpdateApunte(ctx context.Context, id string, dto UpdateApunteDTO) (*Apunte, error) {
	apunte, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if dto.Titulo != nil {
		apunte.Titulo = *dto.Titulo
	}
	if dto.Contenido != nil {
		apunte.Contenido = *dto.Contenido
	}
	if dto.Carpeta != nil {
		apunte.Carpeta = *dto.Carpeta
	}
	if dto.Resumen != nil {
		apunte.Resumen = *dto.Resumen
	}
	if dto.Etiquetas != nil {
		apunte.Tags = *dto.Etiquetas
		if bytes, err := json.Marshal(*dto.Etiquetas); err == nil {
			apunte.Etiquetas = string(bytes)
		}
	}

	if err := s.repo.Update(ctx, apunte); err != nil {
		return nil, err
	}

	updated, err := s.repo.GetByID(ctx, id)
	if err == nil && updated != nil {
		if updated.Materia != nil {
			updated.MateriaNombre = updated.Materia.Nombre
		}
		if updated.Tags == nil {
			updated.Tags = []string{}
		}
		return updated, nil
	}

	if apunte.Tags == nil {
		apunte.Tags = []string{}
	}

	return apunte, nil
}

func (s *service) DeleteApunte(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func (s *service) UploadImage(ctx context.Context, file io.Reader, filename, mimeType string) (string, error) {
	if s.storage == nil {
		return "", errors.New("servicio de almacenamiento no disponible")
	}

	// Normalizar tipo MIME si viene genérico o vacío
	ext := strings.ToLower(filepath.Ext(filename))
	if mimeType == "" || mimeType == "application/octet-stream" {
		switch ext {
		case ".png":
			mimeType = "image/png"
		case ".jpg", ".jpeg":
			mimeType = "image/jpeg"
		case ".webp":
			mimeType = "image/webp"
		case ".gif":
			mimeType = "image/gif"
		case ".svg":
			mimeType = "image/svg+xml"
		default:
			mimeType = "image/jpeg"
		}
	}

	// Validar que sea un formato de imagen permitido
	if !strings.HasPrefix(mimeType, "image/") {
		return "", errors.New("solo se permiten archivos de imagen válidos (PNG, JPG, WEBP, GIF, SVG)")
	}

	key, _, err := s.storage.Save(ctx, file, filename, mimeType)
	if err != nil {
		return "", fmt.Errorf("error al guardar imagen: %w", err)
	}

	return key, nil
}

func (s *service) GetImage(ctx context.Context, key string) (io.ReadSeekCloser, int64, string, error) {
	if s.storage == nil {
		return nil, 0, "", errors.New("servicio de almacenamiento no disponible")
	}

	cleanKey := filepath.Base(key)
	ext := strings.ToLower(filepath.Ext(cleanKey))
	mimeType := "image/jpeg"
	switch ext {
	case ".png":
		mimeType = "image/png"
	case ".jpg", ".jpeg":
		mimeType = "image/jpeg"
	case ".webp":
		mimeType = "image/webp"
	case ".gif":
		mimeType = "image/gif"
	case ".svg":
		mimeType = "image/svg+xml"
	}

	stream, size, err := s.storage.Get(ctx, cleanKey)
	if err != nil {
		return nil, 0, "", fmt.Errorf("imagen no encontrada: %w", err)
	}

	return stream, size, mimeType, nil
}
