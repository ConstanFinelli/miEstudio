package materials

import (
	"context"
	"errors"
	"io"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"miestudio/backend/internal/storage"
)

type Service interface {
	ListMateriales(ctx context.Context, usuarioID, materiaID, categoria string) ([]Material, error)
	GetMaterial(ctx context.Context, id string) (*Material, error)
	GetFilePath(ctx context.Context, id string) (string, *Material, error)
	UploadMaterial(ctx context.Context, usuarioID, materiaID, titulo, categoria string, file io.Reader, filename string, mimeType string) (*Material, error)
	UpdateMaterial(ctx context.Context, id string, dto UpdateMaterialDTO) (*Material, error)
	DeleteMaterial(ctx context.Context, id string) error
	DeleteMaterialesByMateria(ctx context.Context, usuarioID, materiaID string) (int, error)
}

type service struct {
	repo    Repository
	storage storage.StorageService
}

func NewService(repo Repository, storage storage.StorageService) Service {
	return &service{repo: repo, storage: storage}
}

func (s *service) ListMateriales(ctx context.Context, usuarioID, materiaID, categoria string) ([]Material, error) {
	return s.repo.GetByMateria(ctx, usuarioID, materiaID, categoria)
}

func (s *service) GetMaterial(ctx context.Context, id string) (*Material, error) {
	mat, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("material no encontrado")
		}
		return nil, err
	}
	return mat, nil
}

func (s *service) GetFilePath(ctx context.Context, id string) (string, *Material, error) {
	mat, err := s.GetMaterial(ctx, id)
	if err != nil {
		return "", nil, err
	}
	filePath := s.storage.GetFilePath(mat.ArchivoKey)
	return filePath, mat, nil
}

func (s *service) UploadMaterial(ctx context.Context, usuarioID, materiaID, titulo, categoria string, file io.Reader, filename string, mimeType string) (*Material, error) {
	if materiaID == "" {
		return nil, errors.New("materia_id es requerido")
	}
	if titulo == "" {
		titulo = filename
	}
	if categoria == "" {
		categoria = "TEORIA"
	}
	if mimeType == "" {
		mimeType = "application/pdf"
	}

	key, size, err := s.storage.Save(ctx, file, filename)
	if err != nil {
		return nil, err
	}

	material := &Material{
		ID:                    uuid.New().String(),
		UsuarioID:             usuarioID,
		MateriaID:             materiaID,
		Titulo:                titulo,
		Categoria:             categoria,
		ArchivoNombreOriginal: filename,
		ArchivoKey:            key,
		MimeType:              mimeType,
		TamanioBytes:          size,
	}

	if err := s.repo.Create(ctx, material); err != nil {
		_ = s.storage.Delete(ctx, key)
		return nil, err
	}

	return material, nil
}

func (s *service) UpdateMaterial(ctx context.Context, id string, dto UpdateMaterialDTO) (*Material, error) {
	mat, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if dto.Titulo != nil {
		mat.Titulo = *dto.Titulo
	}
	if dto.Categoria != nil {
		mat.Categoria = *dto.Categoria
	}

	if err := s.repo.Update(ctx, mat); err != nil {
		return nil, err
	}

	return mat, nil
}

func (s *service) DeleteMaterial(ctx context.Context, id string) error {
	mat, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	_ = s.storage.Delete(ctx, mat.ArchivoKey)
	return s.repo.Delete(ctx, id)
}

func (s *service) DeleteMaterialesByMateria(ctx context.Context, usuarioID, materiaID string) (int, error) {
	materials, err := s.repo.DeleteByMateria(ctx, usuarioID, materiaID)
	if err != nil {
		return 0, err
	}

	for _, mat := range materials {
		_ = s.storage.Delete(ctx, mat.ArchivoKey)
	}

	return len(materials), nil
}
