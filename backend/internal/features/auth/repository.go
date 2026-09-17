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
	SavePasswordResetToken(token *PasswordResetToken) error
	FindPasswordResetToken(tokenHash string) (*PasswordResetToken, error)
	MarkPasswordResetTokenUsed(id string) error
	RevokeAllUserResetTokens(userID string) error
	UpdatePassword(userID string, passwordHash string) error
	SaveEmailVerificationToken(token *EmailVerificationToken) error
	FindEmailVerificationToken(tokenHash string) (*EmailVerificationToken, error)
	MarkEmailVerificationTokenUsed(id string) error
	RevokeAllUserVerificationTokens(userID string) error
	SetUserEmailVerified(userID string, verified bool) error
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

func (r *repository) SavePasswordResetToken(token *PasswordResetToken) error {
	return r.db.Create(token).Error
}

func (r *repository) FindPasswordResetToken(tokenHash string) (*PasswordResetToken, error) {
	var token PasswordResetToken
	err := r.db.Where("token_hash = ? AND used = ? AND expires_at > ?", tokenHash, false, time.Now()).First(&token).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &token, nil
}

func (r *repository) MarkPasswordResetTokenUsed(id string) error {
	return r.db.Model(&PasswordResetToken{}).Where("id = ?", id).Update("used", true).Error
}

func (r *repository) RevokeAllUserResetTokens(userID string) error {
	return r.db.Model(&PasswordResetToken{}).Where("usuario_id = ?", userID).Update("used", true).Error
}

func (r *repository) UpdatePassword(userID string, passwordHash string) error {
	return r.db.Model(&Usuario{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"password_hash": passwordHash,
		"updated_at":    time.Now(),
	}).Error
}

func (r *repository) SaveEmailVerificationToken(token *EmailVerificationToken) error {
	return r.db.Create(token).Error
}

func (r *repository) FindEmailVerificationToken(tokenHash string) (*EmailVerificationToken, error) {
	var token EmailVerificationToken
	err := r.db.Where("token_hash = ? AND used = ? AND expires_at > ?", tokenHash, false, time.Now()).First(&token).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &token, nil
}

func (r *repository) MarkEmailVerificationTokenUsed(id string) error {
	return r.db.Model(&EmailVerificationToken{}).Where("id = ?", id).Update("used", true).Error
}

func (r *repository) RevokeAllUserVerificationTokens(userID string) error {
	return r.db.Model(&EmailVerificationToken{}).Where("usuario_id = ?", userID).Update("used", true).Error
}

func (r *repository) SetUserEmailVerified(userID string, verified bool) error {
	return r.db.Model(&Usuario{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"email_verified": verified,
		"updated_at":     time.Now(),
	}).Error
}


