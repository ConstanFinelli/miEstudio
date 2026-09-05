package calendar

import (
	"context"

	"gorm.io/gorm"
)

type Repository interface {
	GetAll(ctx context.Context) ([]EventoCalendario, error)
	GetByID(ctx context.Context, id string) (*EventoCalendario, error)
	Create(ctx context.Context, evento *EventoCalendario) error
	Delete(ctx context.Context, id string) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetAll(ctx context.Context) ([]EventoCalendario, error) {
	var eventos []EventoCalendario
	if err := r.db.WithContext(ctx).Order("fecha_inicio asc").Find(&eventos).Error; err != nil {
		return nil, err
	}
	return eventos, nil
}

func (r *repository) GetByID(ctx context.Context, id string) (*EventoCalendario, error) {
	var evento EventoCalendario
	if err := r.db.WithContext(ctx).First(&evento, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &evento, nil
}

func (r *repository) Create(ctx context.Context, evento *EventoCalendario) error {
	return r.db.WithContext(ctx).Create(evento).Error
}

func (r *repository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&EventoCalendario{}, "id = ?", id).Error
}
