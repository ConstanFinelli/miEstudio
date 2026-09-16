package auth

import (
	"strings"
	"time"

	"gorm.io/gorm"
)

type Usuario struct {
	ID           string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	Email        string         `gorm:"type:varchar(255);not null;uniqueIndex" json:"email"`
	PasswordHash string         `gorm:"type:varchar(255);not null" json:"-"`
	Nombre       string         `gorm:"type:varchar(255);not null" json:"nombre"`
	AvatarURL    string         `gorm:"type:varchar(500)" json:"avatar_url"`
	GeminiAPIKey string         `gorm:"type:varchar(255);default:''" json:"-"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Usuario) TableName() string {
	return "usuarios"
}

type RefreshToken struct {
	ID        string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	UsuarioID string    `gorm:"type:varchar(36);not null;index" json:"usuario_id"`
	TokenHash string    `gorm:"type:varchar(255);not null;index" json:"token_hash"`
	ExpiresAt time.Time `gorm:"not null" json:"expires_at"`
	Revoked   bool      `gorm:"default:false" json:"revoked"`
	CreatedAt time.Time `json:"created_at"`
}

func (RefreshToken) TableName() string {
	return "refresh_tokens"
}

type UserDTO struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	Nombre       string    `json:"nombre"`
	AvatarURL    string    `json:"avatar_url"`
	HasGeminiKey bool      `json:"has_gemini_key"`
	CreatedAt    time.Time `json:"created_at"`
}

func (u *Usuario) ToDTO() UserDTO {
	return UserDTO{
		ID:           u.ID,
		Email:        u.Email,
		Nombre:       u.Nombre,
		AvatarURL:    u.AvatarURL,
		HasGeminiKey: strings.TrimSpace(u.GeminiAPIKey) != "",
		CreatedAt:    u.CreatedAt,
	}
}

type RegisterRequest struct {
	Email         string `json:"email"`
	Password      string `json:"password"`
	Nombre        string `json:"nombre"`
	CarreraNombre string `json:"carrera_nombre,omitempty"`
	FacultadSede  string `json:"facultad_sede,omitempty"`
	Legajo        string `json:"legajo,omitempty"`
	DuracionAnios int    `json:"duracion_anios,omitempty"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

type AuthResponse struct {
	AccessToken  string      `json:"access_token"`
	RefreshToken string      `json:"refresh_token"`
	User         UserDTO     `json:"user"`
	Carrera      interface{} `json:"carrera_activa,omitempty"`
}

type UpdateUserRequest struct {
	Nombre       *string `json:"nombre"`
	Email        *string `json:"email"`
	AvatarURL    *string `json:"avatar_url"`
	Password     *string `json:"password,omitempty"`
	GeminiAPIKey *string `json:"gemini_api_key,omitempty"`
}
