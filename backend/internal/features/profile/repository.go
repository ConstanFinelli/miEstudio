package profile

import (
	"context"
	"errors"

	"gorm.io/gorm"
)

type Repository interface {
	Get(ctx context.Context) (*Perfil, error)
	Save(ctx context.Context, perfil *Perfil) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Get(ctx context.Context) (*Perfil, error) {
	var p Perfil
	if err := r.db.WithContext(ctx).First(&p).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &p, nil
}

func (r *repository) Save(ctx context.Context, perfil *Perfil) error {
	return r.db.WithContext(ctx).Save(perfil).Error
}
