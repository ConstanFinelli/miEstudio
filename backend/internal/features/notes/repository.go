package notes

import (
	"context"

	"gorm.io/gorm"
)

type Repository interface {
	GetAll(ctx context.Context, usuarioID, materiaID, carpeta, search string) ([]Apunte, error)
	GetByID(ctx context.Context, id string) (*Apunte, error)
	Create(ctx context.Context, apunte *Apunte) error
	Update(ctx context.Context, apunte *Apunte) error
	Delete(ctx context.Context, id string) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetAll(ctx context.Context, usuarioID, materiaID, carpeta, search string) ([]Apunte, error) {
	var notes []Apunte
	q := r.db.WithContext(ctx).Preload("Materia").Order("updated_at desc")

	if usuarioID != "" {
		q = q.Where("usuario_id = ? OR usuario_id = '' OR usuario_id IS NULL", usuarioID)
	}
	if materiaID != "" {
		q = q.Where("materia_id = ?", materiaID)
	}
	if carpeta != "" {
		q = q.Where("carpeta = ?", carpeta)
	}
	if search != "" {
		like := "%" + search + "%"
		q = q.Where("titulo LIKE ? OR contenido LIKE ? OR resumen LIKE ?", like, like, like)
	}

	if err := q.Find(&notes).Error; err != nil {
		return nil, err
	}
	return notes, nil
}

func (r *repository) GetByID(ctx context.Context, id string) (*Apunte, error) {
	var apunte Apunte
	if err := r.db.WithContext(ctx).Preload("Materia").First(&apunte, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &apunte, nil
}

func (r *repository) Create(ctx context.Context, apunte *Apunte) error {
	return r.db.WithContext(ctx).Create(apunte).Error
}

func (r *repository) Update(ctx context.Context, apunte *Apunte) error {
	return r.db.WithContext(ctx).Save(apunte).Error
}

func (r *repository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&Apunte{}, "id = ?", id).Error
}
