package profile

import (
	"context"
	"errors"

	"gorm.io/gorm"
)

type Repository interface {
	GetByUserID(ctx context.Context, userID string) (*Perfil, error)
	Save(ctx context.Context, perfil *Perfil) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetByUserID(ctx context.Context, userID string) (*Perfil, error) {
	var p Perfil
	if err := r.db.WithContext(ctx).Where("usuario_id = ?", userID).First(&p).Error; err != nil {
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
