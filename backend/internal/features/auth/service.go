package auth

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
)

type CarreraProvider interface {
	GetActiveCarrera(usuarioID string) (id string, data interface{}, err error)
	CreateInitialCarrera(usuarioID, nombre, facultadSede, legajo string) (id string, data interface{}, err error)
}

type Service interface {
	Register(req RegisterRequest) (*AuthResponse, error)
	Login(req LoginRequest) (*AuthResponse, error)
	RefreshToken(refreshTokenStr string) (*AuthResponse, error)
	Logout(refreshTokenStr string) error
	GetMe(userID string) (*Usuario, interface{}, error)
}

type service struct {
	repo            Repository
	carreraProvider CarreraProvider
	jwtSecret       string
}

func NewService(repo Repository, carreraProvider CarreraProvider, jwtSecret string) Service {
	return &service{
		repo:            repo,
		carreraProvider: carreraProvider,
		jwtSecret:       jwtSecret,
	}
}

func (s *service) Register(req RegisterRequest) (*AuthResponse, error) {
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Nombre = strings.TrimSpace(req.Nombre)

	if req.Email == "" || req.Password == "" || req.Nombre == "" {
		return nil, errors.New("nombre, email y contraseña son campos obligatorios")
	}

	if len(req.Password) < 6 {
		return nil, errors.New("la contraseña debe contener al menos 6 caracteres")
	}

	existingUser, err := s.repo.FindByEmail(req.Email)
	if err != nil {
		return nil, err
	}
	if existingUser != nil {
		return nil, errors.New("el correo electrónico ya está registrado")
	}

	hashedPassword, err := HashPassword(req.Password)
	if err != nil {
		return nil, errors.New("error al encriptar la contraseña")
	}

	newUser := &Usuario{
		ID:           uuid.New().String(),
		Email:        req.Email,
		PasswordHash: hashedPassword,
		Nombre:       req.Nombre,
		AvatarURL:    "",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := s.repo.CreateUser(newUser); err != nil {
		return nil, err
	}

	activeID := ""
	var activeData interface{}
	if s.carreraProvider != nil {
		carreraNombre := req.CarreraNombre
		if carreraNombre == "" {
			carreraNombre = "Mi Carrera"
		}
		activeID, activeData, _ = s.carreraProvider.CreateInitialCarrera(newUser.ID, carreraNombre, req.FacultadSede, req.Legajo)
	}

	return s.generateAuthResponse(newUser, activeID, activeData)
}

func (s *service) Login(req LoginRequest) (*AuthResponse, error) {
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" || req.Password == "" {
		return nil, errors.New("email y contraseña son obligatorios")
	}

	user, err := s.repo.FindByEmail(req.Email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("credenciales inválidas")
	}

	if !CheckPasswordHash(req.Password, user.PasswordHash) {
		return nil, errors.New("credenciales inválidas")
	}

	activeID := ""
	var activeData interface{}
	if s.carreraProvider != nil {
		activeID, activeData, _ = s.carreraProvider.GetActiveCarrera(user.ID)
	}

	return s.generateAuthResponse(user, activeID, activeData)
}

func (s *service) RefreshToken(refreshTokenStr string) (*AuthResponse, error) {
	if refreshTokenStr == "" {
		return nil, errors.New("refresh token requerido")
	}

	tokenHash := HashRefreshToken(refreshTokenStr)
	storedToken, err := s.repo.FindRefreshToken(tokenHash)
	if err != nil || storedToken == nil {
		return nil, errors.New("refresh token inválido o expirado")
	}

	user, err := s.repo.FindByID(storedToken.UsuarioID)
	if err != nil || user == nil {
		return nil, errors.New("usuario no encontrado")
	}

	// Rotación de refresh token: revocar el usado
	_ = s.repo.RevokeRefreshToken(storedToken.ID)

	activeID := ""
	var activeData interface{}
	if s.carreraProvider != nil {
		activeID, activeData, _ = s.carreraProvider.GetActiveCarrera(user.ID)
	}

	return s.generateAuthResponse(user, activeID, activeData)
}

func (s *service) Logout(refreshTokenStr string) error {
	if refreshTokenStr == "" {
		return nil
	}
	tokenHash := HashRefreshToken(refreshTokenStr)
	storedToken, err := s.repo.FindRefreshToken(tokenHash)
	if err == nil && storedToken != nil {
		return s.repo.RevokeRefreshToken(storedToken.ID)
	}
	return nil
}

func (s *service) GetMe(userID string) (*Usuario, interface{}, error) {
	user, err := s.repo.FindByID(userID)
	if err != nil {
		return nil, nil, err
	}
	if user == nil {
		return nil, nil, errors.New("usuario no encontrado")
	}

	var activeData interface{}
	if s.carreraProvider != nil {
		_, activeData, _ = s.carreraProvider.GetActiveCarrera(userID)
	}
	return user, activeData, nil
}

func (s *service) generateAuthResponse(user *Usuario, activeCarreraID string, activeCarreraData interface{}) (*AuthResponse, error) {
	accessToken, err := GenerateAccessToken(user, activeCarreraID, s.jwtSecret, 24*time.Hour)
	if err != nil {
		return nil, err
	}

	rawRefreshToken, tokenHash, err := GenerateRefreshToken()
	if err != nil {
		return nil, err
	}

	refreshTokenRecord := &RefreshToken{
		ID:        uuid.New().String(),
		UsuarioID: user.ID,
		TokenHash: tokenHash,
		ExpiresAt: time.Now().Add(30 * 24 * time.Hour),
		Revoked:   false,
		CreatedAt: time.Now(),
	}

	if err := s.repo.SaveRefreshToken(refreshTokenRecord); err != nil {
		return nil, err
	}

	return &AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: rawRefreshToken,
		User:         user.ToDTO(),
		Carrera:      activeCarreraData,
	}, nil
}
