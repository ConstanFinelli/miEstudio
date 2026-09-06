package schedules

import (
	"context"

	"gorm.io/gorm"
)

type Repository interface {
	GetAll(ctx context.Context, materiaID, diaSemana string) ([]HorarioCursada, error)
	GetByID(ctx context.Context, id string) (*HorarioCursada, error)
	Create(ctx context.Context, horario *HorarioCursada) error
	Update(ctx context.Context, horario *HorarioCursada) error
	Delete(ctx context.Context, id string) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetAll(ctx context.Context, materiaID, diaSemana string) ([]HorarioCursada, error) {
	var list []HorarioCursada
	q := r.db.WithContext(ctx).Preload("Materia").Order("hora_inicio asc")

	if materiaID != "" {
		q = q.Where("materia_id = ?", materiaID)
	}
	if diaSemana != "" {
		q = q.Where("dia_semana = ?", diaSemana)
	}

	if err := q.Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

func (r *repository) GetByID(ctx context.Context, id string) (*HorarioCursada, error) {
	var item HorarioCursada
	if err := r.db.WithContext(ctx).Preload("Materia").First(&item, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *repository) Create(ctx context.Context, horario *HorarioCursada) error {
	return r.db.WithContext(ctx).Create(horario).Error
}

func (r *repository) Update(ctx context.Context, horario *HorarioCursada) error {
	return r.db.WithContext(ctx).Save(horario).Error
}

func (r *repository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&HorarioCursada{}, "id = ?", id).Error
}
