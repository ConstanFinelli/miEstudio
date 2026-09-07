package materials

import (
	"context"

	"gorm.io/gorm"
)

type Repository interface {
	GetByMateria(ctx context.Context, usuarioID, materiaID, categoria string) ([]Material, error)
	GetByID(ctx context.Context, id string) (*Material, error)
	Create(ctx context.Context, material *Material) error
	Update(ctx context.Context, material *Material) error
	Delete(ctx context.Context, id string) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetByMateria(ctx context.Context, usuarioID, materiaID, categoria string) ([]Material, error) {
	var materials []Material
	q := r.db.WithContext(ctx).Order("created_at desc")
	if usuarioID != "" {
		q = q.Where("usuario_id = ? OR usuario_id = '' OR usuario_id IS NULL", usuarioID)
	}
	if materiaID != "" {
		q = q.Where("materia_id = ?", materiaID)
	}
	if categoria != "" {
		q = q.Where("categoria = ?", categoria)
	}
	if err := q.Find(&materials).Error; err != nil {
		return nil, err
	}
	return materials, nil
}

func (r *repository) GetByID(ctx context.Context, id string) (*Material, error) {
	var material Material
	if err := r.db.WithContext(ctx).First(&material, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &material, nil
}

func (r *repository) Create(ctx context.Context, material *Material) error {
	return r.db.WithContext(ctx).Create(material).Error
}

func (r *repository) Update(ctx context.Context, material *Material) error {
	return r.db.WithContext(ctx).Save(material).Error
}

func (r *repository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&Material{}, "id = ?", id).Error
}
