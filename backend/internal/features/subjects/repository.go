package subjects

import (
	"context"

	"gorm.io/gorm"
)

type Repository interface {
	GetAll(ctx context.Context, estado string, anio int) ([]Materia, error)
	GetByID(ctx context.Context, id string) (*Materia, error)
	Create(ctx context.Context, materia *Materia) error
	Update(ctx context.Context, materia *Materia) error
	Delete(ctx context.Context, id string) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetAll(ctx context.Context, estado string, anio int) ([]Materia, error) {
	var materias []Materia
	q := r.db.WithContext(ctx).Order("anio desc, nombre asc")
	if estado != "" {
		q = q.Where("estado = ?", estado)
	}
	if anio > 0 {
		q = q.Where("anio = ?", anio)
	}
	if err := q.Find(&materias).Error; err != nil {
		return nil, err
	}
	return materias, nil
}

func (r *repository) GetByID(ctx context.Context, id string) (*Materia, error) {
	var materia Materia
	if err := r.db.WithContext(ctx).First(&materia, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &materia, nil
}

func (r *repository) Create(ctx context.Context, materia *Materia) error {
	return r.db.WithContext(ctx).Create(materia).Error
}

func (r *repository) Update(ctx context.Context, materia *Materia) error {
	return r.db.WithContext(ctx).Save(materia).Error
}

func (r *repository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&Materia{}, "id = ?", id).Error
}
