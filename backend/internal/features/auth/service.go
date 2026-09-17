package auth

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"miestudio/backend/internal/mailer"
)

type CarreraProvider interface {
	GetActiveCarrera(usuarioID string) (id string, data interface{}, err error)
	CreateInitialCarrera(usuarioID, nombre, facultadSede, legajo string, duracionAnios int) (id string, data interface{}, err error)
}

type Service interface {
	Register(req RegisterRequest) (*AuthResponse, error)
	Login(req LoginRequest) (*AuthResponse, error)
	RefreshToken(refreshTokenStr string) (*AuthResponse, error)
	Logout(refreshTokenStr string) error
	GetMe(userID string) (*Usuario, interface{}, error)
	UpdateMe(userID string, req UpdateUserRequest) (*Usuario, error)
	ForgotPassword(email string) error
	VerifyResetToken(token string) (bool, string, error)
	ResetPassword(token, newPassword string) error
	VerifyEmail(tokenStr string) error
	ResendVerificationEmail(email string) error
}

type service struct {
	repo            Repository
	carreraProvider CarreraProvider
	jwtSecret       string
	mailer          mailer.Mailer
	frontendURL     string
}

func NewService(repo Repository, carreraProvider CarreraProvider, jwtSecret string, mailer mailer.Mailer, frontendURL string) Service {
	return &service{
		repo:            repo,
		carreraProvider: carreraProvider,
		jwtSecret:       jwtSecret,
		mailer:          mailer,
		frontendURL:     strings.TrimRight(frontendURL, "/"),
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
		activeID, activeData, _ = s.carreraProvider.CreateInitialCarrera(newUser.ID, carreraNombre, req.FacultadSede, req.Legajo, req.DuracionAnios)
	}

	// Generar token de verificación de cuenta
	rawVerifBytes := make([]byte, 32)
	if _, err := rand.Read(rawVerifBytes); err == nil {
		rawVerifToken := hex.EncodeToString(rawVerifBytes)
		verifHash := HashResetToken(rawVerifToken)
		verifRecord := &EmailVerificationToken{
			ID:        uuid.New().String(),
			UsuarioID: newUser.ID,
			TokenHash: verifHash,
			ExpiresAt: time.Now().Add(24 * time.Hour),
			Used:      false,
			CreatedAt: time.Now(),
		}
		_ = s.repo.SaveEmailVerificationToken(verifRecord)

		if s.mailer != nil {
			verifyURL := fmt.Sprintf("%s/verify-email?token=%s", s.frontendURL, rawVerifToken)
			go func(toEmail, userName, url string) {
				_ = s.mailer.SendVerificationEmail(toEmail, userName, url, 24)
			}(newUser.Email, newUser.Nombre, verifyURL)
		}
	} else if s.mailer != nil {
		go func(toEmail, userName string) {
			_ = s.mailer.SendWelcomeEmail(toEmail, userName)
		}(newUser.Email, newUser.Nombre)
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

func (s *service) UpdateMe(userID string, req UpdateUserRequest) (*Usuario, error) {
	user, err := s.repo.FindByID(userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("usuario no encontrado")
	}

	if req.Nombre != nil && strings.TrimSpace(*req.Nombre) != "" {
		user.Nombre = strings.TrimSpace(*req.Nombre)
	}

	if req.Email != nil && strings.TrimSpace(*req.Email) != "" {
		newEmail := strings.TrimSpace(strings.ToLower(*req.Email))
		if newEmail != user.Email {
			existing, err := s.repo.FindByEmail(newEmail)
			if err != nil {
				return nil, err
			}
			if existing != nil && existing.ID != user.ID {
				return nil, errors.New("el correo electrónico ya está en uso")
			}
			user.Email = newEmail
		}
	}

	if req.AvatarURL != nil {
		user.AvatarURL = strings.TrimSpace(*req.AvatarURL)
	}

	if req.Password != nil && len(*req.Password) > 0 {
		if len(*req.Password) < 6 {
			return nil, errors.New("la contraseña debe contener al menos 6 caracteres")
		}
		hash, err := HashPassword(*req.Password)
		if err != nil {
			return nil, errors.New("error al encriptar la contraseña")
		}
		user.PasswordHash = hash
	}

	if req.GeminiAPIKey != nil {
		user.GeminiAPIKey = strings.TrimSpace(*req.GeminiAPIKey)
	}

	if err := s.repo.UpdateUser(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *service) ForgotPassword(email string) error {
	cleanEmail := strings.TrimSpace(strings.ToLower(email))
	if cleanEmail == "" {
		return errors.New("el correo electrónico es obligatorio")
	}

	user, err := s.repo.FindByEmail(cleanEmail)
	if err != nil {
		return err
	}

	// Prevención de enumeración de cuentas: si el usuario no existe, retornamos nil
	if user == nil {
		return nil
	}

	// Revocar tokens previos no utilizados para este usuario
	_ = s.repo.RevokeAllUserResetTokens(user.ID)

	// Generar token criptográficamente seguro de 32 bytes (64 caracteres hex)
	rawBytes := make([]byte, 32)
	if _, err := rand.Read(rawBytes); err != nil {
		return errors.New("error al generar token de seguridad")
	}
	rawToken := hex.EncodeToString(rawBytes)

	// Almacenar el hash SHA-256 en base de datos
	tokenHash := HashResetToken(rawToken)
	expireMinutes := 60
	resetRecord := &PasswordResetToken{
		ID:        uuid.New().String(),
		UsuarioID: user.ID,
		TokenHash: tokenHash,
		ExpiresAt: time.Now().Add(time.Duration(expireMinutes) * time.Minute),
		Used:      false,
		CreatedAt: time.Now(),
	}

	if err := s.repo.SavePasswordResetToken(resetRecord); err != nil {
		return err
	}

	// Enviar correo de restablecimiento con enlace temporal
	resetURL := fmt.Sprintf("%s/reset-password?token=%s", s.frontendURL, rawToken)
	if s.mailer != nil {
		go func(toEmail, userName, url string, exp int) {
			_ = s.mailer.SendPasswordResetEmail(toEmail, userName, url, exp)
		}(user.Email, user.Nombre, resetURL, expireMinutes)
	}

	return nil
}

func (s *service) VerifyResetToken(tokenStr string) (bool, string, error) {
	tokenStr = strings.TrimSpace(tokenStr)
	if tokenStr == "" {
		return false, "", errors.New("token no provisto")
	}

	tokenHash := HashResetToken(tokenStr)
	record, err := s.repo.FindPasswordResetToken(tokenHash)
	if err != nil || record == nil {
		return false, "", errors.New("el enlace de recuperación es inválido o ha expirado")
	}

	user, err := s.repo.FindByID(record.UsuarioID)
	if err != nil || user == nil {
		return false, "", errors.New("usuario asociado no encontrado")
	}

	return true, user.Email, nil
}

func (s *service) ResetPassword(tokenStr, newPassword string) error {
	tokenStr = strings.TrimSpace(tokenStr)
	if tokenStr == "" {
		return errors.New("token de recuperación requerido")
	}

	if len(newPassword) < 6 {
		return errors.New("la nueva contraseña debe contener al menos 6 caracteres")
	}

	tokenHash := HashResetToken(tokenStr)
	record, err := s.repo.FindPasswordResetToken(tokenHash)
	if err != nil || record == nil {
		return errors.New("el enlace de recuperación es inválido o ha expirado")
	}

	user, err := s.repo.FindByID(record.UsuarioID)
	if err != nil || user == nil {
		return errors.New("usuario asociado no encontrado")
	}

	hashedPassword, err := HashPassword(newPassword)
	if err != nil {
		return errors.New("error al encriptar la nueva contraseña")
	}

	if err := s.repo.UpdatePassword(user.ID, hashedPassword); err != nil {
		return errors.New("error al actualizar la contraseña")
	}

	// Marcar token como utilizado
	_ = s.repo.MarkPasswordResetTokenUsed(record.ID)

	// Por seguridad: revocar todas las sesiones previas (refresh tokens)
	_ = s.repo.RevokeAllUserTokens(user.ID)

	// Notificar por correo que la contraseña fue actualizada
	if s.mailer != nil {
		go func(toEmail, userName string) {
			_ = s.mailer.SendPasswordChangedEmail(toEmail, userName)
		}(user.Email, user.Nombre)
	}

	return nil
}

func (s *service) VerifyEmail(tokenStr string) error {
	tokenStr = strings.TrimSpace(tokenStr)
	if tokenStr == "" {
		return errors.New("token de verificación no provisto")
	}

	tokenHash := HashResetToken(tokenStr)
	record, err := s.repo.FindEmailVerificationToken(tokenHash)
	if err != nil || record == nil {
		return errors.New("el enlace de confirmación es inválido o ha expirado")
	}

	user, err := s.repo.FindByID(record.UsuarioID)
	if err != nil || user == nil {
		return errors.New("usuario asociado no encontrado")
	}

	if err := s.repo.SetUserEmailVerified(user.ID, true); err != nil {
		return errors.New("error al confirmar el correo electrónico")
	}

	_ = s.repo.MarkEmailVerificationTokenUsed(record.ID)
	return nil
}

func (s *service) ResendVerificationEmail(email string) error {
	cleanEmail := strings.TrimSpace(strings.ToLower(email))
	if cleanEmail == "" {
		return errors.New("el correo electrónico es obligatorio")
	}

	user, err := s.repo.FindByEmail(cleanEmail)
	if err != nil || user == nil {
		// Prevención de enumeración: retorno exitoso silencioso
		return nil
	}

	if user.EmailVerified {
		return errors.New("la cuenta ya se encuentra verificada")
	}

	_ = s.repo.RevokeAllUserVerificationTokens(user.ID)

	rawBytes := make([]byte, 32)
	if _, err := rand.Read(rawBytes); err != nil {
		return errors.New("error al generar token de confirmación")
	}
	rawToken := hex.EncodeToString(rawBytes)
	tokenHash := HashResetToken(rawToken)

	verifRecord := &EmailVerificationToken{
		ID:        uuid.New().String(),
		UsuarioID: user.ID,
		TokenHash: tokenHash,
		ExpiresAt: time.Now().Add(24 * time.Hour),
		Used:      false,
		CreatedAt: time.Now(),
	}

	if err := s.repo.SaveEmailVerificationToken(verifRecord); err != nil {
		return err
	}

	if s.mailer != nil {
		verifyURL := fmt.Sprintf("%s/verify-email?token=%s", s.frontendURL, rawToken)
		go func(toEmail, userName, url string) {
			_ = s.mailer.SendVerificationEmail(toEmail, userName, url, 24)
		}(user.Email, user.Nombre, verifyURL)
	}

	return nil
}


