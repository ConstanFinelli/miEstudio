package materials

import (
	"context"
	"errors"
	"io"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"miestudio/backend/internal/storage"
)

type Service interface {
	ListMateriales(ctx context.Context, usuarioID, materiaID, categoria string) ([]Material, error)
	GetMaterial(ctx context.Context, id string) (*Material, error)
	GetFilePath(ctx context.Context, id string) (string, *Material, error)
	UploadMaterial(ctx context.Context, usuarioID, materiaID, titulo, categoria, unidad string, file io.Reader, filename string, mimeType string) (*Material, error)
	UpdateMaterial(ctx context.Context, id string, dto UpdateMaterialDTO) (*Material, error)
	DeleteMaterial(ctx context.Context, id string) error
	DeleteMaterialesByMateria(ctx context.Context, usuarioID, materiaID string) (int, error)
	SincronizarPaginasMateriales(ctx context.Context) error
}

type service struct {
	repo    Repository
	storage storage.StorageService
}

func NewService(repo Repository, storage storage.StorageService) Service {
	return &service{repo: repo, storage: storage}
}

func (s *service) ListMateriales(ctx context.Context, usuarioID, materiaID, categoria string) ([]Material, error) {
	materials, err := s.repo.GetByMateria(ctx, usuarioID, materiaID, categoria)
	if err != nil {
		return nil, err
	}

	for i := range materials {
		if materials[i].CantPaginas == nil && isPDF(materials[i].ArchivoNombreOriginal, materials[i].MimeType) {
			filePath := s.storage.GetFilePath(materials[i].ArchivoKey)
			if count, err := CountPDFPages(filePath); err == nil && count > 0 {
				materials[i].CantPaginas = &count
				_ = s.repo.Update(ctx, &materials[i])
			}
		}
	}

	return materials, nil
}

func (s *service) GetMaterial(ctx context.Context, id string) (*Material, error) {
	mat, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("material no encontrado")
		}
		return nil, err
	}

	if mat.CantPaginas == nil && isPDF(mat.ArchivoNombreOriginal, mat.MimeType) {
		filePath := s.storage.GetFilePath(mat.ArchivoKey)
		if count, err := CountPDFPages(filePath); err == nil && count > 0 {
			mat.CantPaginas = &count
			_ = s.repo.Update(ctx, mat)
		}
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

func (s *service) UploadMaterial(ctx context.Context, usuarioID, materiaID, titulo, categoria, unidad string, file io.Reader, filename string, mimeType string) (*Material, error) {
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

	var cantPaginas *int
	if isPDF(filename, mimeType) {
		filePath := s.storage.GetFilePath(key)
		if count, err := CountPDFPages(filePath); err == nil && count > 0 {
			cantPaginas = &count
		}
	}

	material := &Material{
		ID:                    uuid.New().String(),
		UsuarioID:             usuarioID,
		MateriaID:             materiaID,
		Titulo:                titulo,
		Categoria:             categoria,
		Unidad:                unidad,
		ArchivoNombreOriginal: filename,
		ArchivoKey:            key,
		MimeType:              mimeType,
		TamanioBytes:          size,
		CantPaginas:           cantPaginas,
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
	if dto.Unidad != nil {
		mat.Unidad = *dto.Unidad
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

func (s *service) SincronizarPaginasMateriales(ctx context.Context) error {
	pending, err := s.repo.GetPendingPageCount(ctx)
	if err != nil {
		return err
	}

	for i := range pending {
		mat := &pending[i]
		if !isPDF(mat.ArchivoNombreOriginal, mat.MimeType) {
			continue
		}
		filePath := s.storage.GetFilePath(mat.ArchivoKey)
		if count, err := CountPDFPages(filePath); err == nil && count > 0 {
			mat.CantPaginas = &count
			_ = s.repo.Update(ctx, mat)
		}
	}
	return nil
}

func isPDF(filename, mimeType string) bool {
	return strings.EqualFold(filepath.Ext(filename), ".pdf") || mimeType == "application/pdf"
}
