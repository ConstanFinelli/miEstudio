package auth

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

type Repository interface {
	CreateUser(user *Usuario) error
	FindByEmail(email string) (*Usuario, error)
	FindByID(id string) (*Usuario, error)
	SaveRefreshToken(token *RefreshToken) error
	FindRefreshToken(tokenHash string) (*RefreshToken, error)
	RevokeRefreshToken(id string) error
	RevokeAllUserTokens(userID string) error
	UpdateUser(user *Usuario) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) CreateUser(user *Usuario) error {
	return r.db.Create(user).Error
}

func (r *repository) FindByEmail(email string) (*Usuario, error) {
	var user Usuario
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *repository) FindByID(id string) (*Usuario, error) {
	var user Usuario
	err := r.db.First(&user, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *repository) SaveRefreshToken(token *RefreshToken) error {
	return r.db.Create(token).Error
}

func (r *repository) FindRefreshToken(tokenHash string) (*RefreshToken, error) {
	var token RefreshToken
	err := r.db.Where("token_hash = ? AND revoked = ? AND expires_at > ?", tokenHash, false, time.Now()).First(&token).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &token, nil
}

func (r *repository) RevokeRefreshToken(id string) error {
	return r.db.Model(&RefreshToken{}).Where("id = ?", id).Update("revoked", true).Error
}

func (r *repository) RevokeAllUserTokens(userID string) error {
	return r.db.Model(&RefreshToken{}).Where("usuario_id = ?", userID).Update("revoked", true).Error
}

func (r *repository) UpdateUser(user *Usuario) error {
	return r.db.Save(user).Error
}
