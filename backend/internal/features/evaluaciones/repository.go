package evaluaciones

import (
	"context"

	"gorm.io/gorm"
)

type Repository interface {
	GetByMateria(ctx context.Context, usuarioID string, materiaID string) ([]Evaluacion, error)
	GetProximas(ctx context.Context, usuarioID string, limit int) ([]Evaluacion, error)
	GetByID(ctx context.Context, id string) (*Evaluacion, error)
	Create(ctx context.Context, evaluacion *Evaluacion) error
	Update(ctx context.Context, evaluacion *Evaluacion) error
	Delete(ctx context.Context, id string) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetByMateria(ctx context.Context, usuarioID string, materiaID string) ([]Evaluacion, error) {
	var evaluaciones []Evaluacion
	q := r.db.WithContext(ctx).Order("fecha asc")
	if usuarioID != "" {
		q = q.Where("usuario_id = ? OR usuario_id = '' OR usuario_id IS NULL", usuarioID)
	}
	if materiaID != "" {
		q = q.Where("materia_id = ?", materiaID)
	}
	if err := q.Find(&evaluaciones).Error; err != nil {
		return nil, err
	}
	return evaluaciones, nil
}

func (r *repository) GetProximas(ctx context.Context, usuarioID string, limit int) ([]Evaluacion, error) {
	var evaluaciones []Evaluacion
	q := r.db.WithContext(ctx).Order("fecha asc")
	if usuarioID != "" {
		q = q.Where("usuario_id = ? OR usuario_id = '' OR usuario_id IS NULL", usuarioID)
	}
	if limit > 0 {
		q = q.Limit(limit)
	}
	if err := q.Find(&evaluaciones).Error; err != nil {
		return nil, err
	}
	return evaluaciones, nil
}

func (r *repository) GetByID(ctx context.Context, id string) (*Evaluacion, error) {
	var evaluacion Evaluacion
	if err := r.db.WithContext(ctx).First(&evaluacion, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &evaluacion, nil
}

func (r *repository) Create(ctx context.Context, evaluacion *Evaluacion) error {
	return r.db.WithContext(ctx).Create(evaluacion).Error
}

func (r *repository) Update(ctx context.Context, evaluacion *Evaluacion) error {
	return r.db.WithContext(ctx).Save(evaluacion).Error
}

func (r *repository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&Evaluacion{}, "id = ?", id).Error
}
