package auth

import (
	"testing"
	"time"

	"github.com/google/uuid"
)

type mockRepo struct {
	users              map[string]*Usuario
	resetTokens        map[string]*PasswordResetToken
	refreshTokens      map[string]*RefreshToken
	verificationTokens map[string]*EmailVerificationToken
}

func newMockRepo() *mockRepo {
	return &mockRepo{
		users:              make(map[string]*Usuario),
		resetTokens:        make(map[string]*PasswordResetToken),
		refreshTokens:      make(map[string]*RefreshToken),
		verificationTokens: make(map[string]*EmailVerificationToken),
	}
}

func (m *mockRepo) CreateUser(user *Usuario) error {
	m.users[user.ID] = user
	return nil
}

func (m *mockRepo) FindByEmail(email string) (*Usuario, error) {
	for _, u := range m.users {
		if u.Email == email {
			return u, nil
		}
	}
	return nil, nil
}

func (m *mockRepo) FindByID(id string) (*Usuario, error) {
	if u, ok := m.users[id]; ok {
		return u, nil
	}
	return nil, nil
}

func (m *mockRepo) SaveRefreshToken(token *RefreshToken) error {
	m.refreshTokens[token.ID] = token
	return nil
}

func (m *mockRepo) FindRefreshToken(tokenHash string) (*RefreshToken, error) {
	for _, t := range m.refreshTokens {
		if t.TokenHash == tokenHash && !t.Revoked && t.ExpiresAt.After(time.Now()) {
			return t, nil
		}
	}
	return nil, nil
}

func (m *mockRepo) RevokeRefreshToken(id string) error {
	if t, ok := m.refreshTokens[id]; ok {
		t.Revoked = true
	}
	return nil
}

func (m *mockRepo) RevokeAllUserTokens(userID string) error {
	for _, t := range m.refreshTokens {
		if t.UsuarioID == userID {
			t.Revoked = true
		}
	}
	return nil
}

func (m *mockRepo) UpdateUser(user *Usuario) error {
	m.users[user.ID] = user
	return nil
}

func (m *mockRepo) SavePasswordResetToken(token *PasswordResetToken) error {
	m.resetTokens[token.ID] = token
	return nil
}

func (m *mockRepo) FindPasswordResetToken(tokenHash string) (*PasswordResetToken, error) {
	for _, t := range m.resetTokens {
		if t.TokenHash == tokenHash && !t.Used && t.ExpiresAt.After(time.Now()) {
			return t, nil
		}
	}
	return nil, nil
}

func (m *mockRepo) MarkPasswordResetTokenUsed(id string) error {
	if t, ok := m.resetTokens[id]; ok {
		t.Used = true
	}
	return nil
}

func (m *mockRepo) RevokeAllUserResetTokens(userID string) error {
	for _, t := range m.resetTokens {
		if t.UsuarioID == userID {
			t.Used = true
		}
	}
	return nil
}

func (m *mockRepo) UpdatePassword(userID string, passwordHash string) error {
	if u, ok := m.users[userID]; ok {
		u.PasswordHash = passwordHash
	}
	return nil
}

func (m *mockRepo) SaveEmailVerificationToken(token *EmailVerificationToken) error {
	m.verificationTokens[token.ID] = token
	return nil
}

func (m *mockRepo) FindEmailVerificationToken(tokenHash string) (*EmailVerificationToken, error) {
	for _, t := range m.verificationTokens {
		if t.TokenHash == tokenHash && !t.Used && t.ExpiresAt.After(time.Now()) {
			return t, nil
		}
	}
	return nil, nil
}

func (m *mockRepo) MarkEmailVerificationTokenUsed(id string) error {
	if t, ok := m.verificationTokens[id]; ok {
		t.Used = true
	}
	return nil
}

func (m *mockRepo) RevokeAllUserVerificationTokens(userID string) error {
	for _, t := range m.verificationTokens {
		if t.UsuarioID == userID {
			t.Used = true
		}
	}
	return nil
}

func (m *mockRepo) SetUserEmailVerified(userID string, verified bool) error {
	if u, ok := m.users[userID]; ok {
		u.EmailVerified = verified
	}
	return nil
}

type mockMailer struct {
	sentWelcome        int
	sentVerification   int
	sentPasswordReset  int
	sentPasswordChanged int
	lastResetURL       string
	lastVerifyURL      string
}

func (mm *mockMailer) SendWelcomeEmail(toEmail, userName string) error {
	mm.sentWelcome++
	return nil
}

func (mm *mockMailer) SendVerificationEmail(toEmail, userName, verifyURL string, expireHours int) error {
	mm.sentVerification++
	mm.lastVerifyURL = verifyURL
	return nil
}

func (mm *mockMailer) SendPasswordResetEmail(toEmail, userName, resetURL string, expireMinutes int) error {
	mm.sentPasswordReset++
	mm.lastResetURL = resetURL
	return nil
}

func (mm *mockMailer) SendPasswordChangedEmail(toEmail, userName string) error {
	mm.sentPasswordChanged++
	return nil
}

func TestHashResetToken(t *testing.T) {
	token := "sample-secure-token-12345"
	hash1 := HashResetToken(token)
	hash2 := HashResetToken(token)

	if hash1 == "" {
		t.Fatalf("expected non-empty hash")
	}
	if hash1 != hash2 {
		t.Errorf("expected deterministic hash output, got %s vs %s", hash1, hash2)
	}
}

func TestForgotPasswordAndResetFlow(t *testing.T) {
	repo := newMockRepo()
	mailer := &mockMailer{}

	initialPassHash, _ := HashPassword("oldPassword123")
	testUser := &Usuario{
		ID:           uuid.New().String(),
		Email:        "estudiante@test.edu.ar",
		PasswordHash: initialPassHash,
		Nombre:       "Estudiante Test",
	}
	_ = repo.CreateUser(testUser)

	// Refresh token activo que deberá revocarse al cambiar contraseña
	refreshToken := &RefreshToken{
		ID:        "rf-1",
		UsuarioID: testUser.ID,
		TokenHash: "hash-rf-1",
		ExpiresAt: time.Now().Add(24 * time.Hour),
		Revoked:   false,
	}
	_ = repo.SaveRefreshToken(refreshToken)

	svc := NewService(repo, nil, "jwtsecret1234567890123456789012", mailer, "http://localhost:5173")

	// 1. Solicitar restablecimiento
	err := svc.ForgotPassword(testUser.Email)
	if err != nil {
		t.Fatalf("unexpected error on ForgotPassword: %v", err)
	}

	if len(repo.resetTokens) != 1 {
		t.Fatalf("expected 1 reset token in repo, got %d", len(repo.resetTokens))
	}

	var savedToken *PasswordResetToken
	for _, tok := range repo.resetTokens {
		savedToken = tok
		break
	}

	if savedToken.Used {
		t.Errorf("expected reset token to be unused")
	}

	// 2. Probar verificación con token inválido
	valid, _, _ := svc.VerifyResetToken("token-invalido")
	if valid {
		t.Errorf("expected invalid token to return false")
	}

	// 3. Crear token con hash conocido para probar el reseteo
	rawTestToken := "token-de-prueba-valido-12345678"
	tokenHash := HashResetToken(rawTestToken)
	customReset := &PasswordResetToken{
		ID:        uuid.New().String(),
		UsuarioID: testUser.ID,
		TokenHash: tokenHash,
		ExpiresAt: time.Now().Add(1 * time.Hour),
		Used:      false,
	}
	_ = repo.SavePasswordResetToken(customReset)

	// Verificar token válido
	valid, email, err := svc.VerifyResetToken(rawTestToken)
	if err != nil || !valid || email != testUser.Email {
		t.Fatalf("expected valid token verification for %s, got valid=%v, email=%s, err=%v", testUser.Email, valid, email, err)
	}

	// 4. Restablecer contraseña
	newPassword := "newSecurePassword456"
	err = svc.ResetPassword(rawTestToken, newPassword)
	if err != nil {
		t.Fatalf("unexpected error resetting password: %v", err)
	}

	// Verificar que el token quedó marcado como usado
	if !customReset.Used {
		t.Errorf("expected reset token to be marked as used")
	}

	// Verificar que la nueva contraseña funciona y la vieja no
	updatedUser, _ := repo.FindByID(testUser.ID)
	if !CheckPasswordHash(newPassword, updatedUser.PasswordHash) {
		t.Errorf("new password hash check failed")
	}
	if CheckPasswordHash("oldPassword123", updatedUser.PasswordHash) {
		t.Errorf("old password should not match anymore")
	}

	// Verificar que el refresh token activo fue revocado
	if !refreshToken.Revoked {
		t.Errorf("expected user refresh tokens to be revoked on password reset")
	}
}

func TestEmailVerificationFlow(t *testing.T) {
	repo := newMockRepo()
	mailer := &mockMailer{}

	svc := NewService(repo, nil, "jwtsecret1234567890123456789012", mailer, "http://localhost:5173")

	// 1. Registro de nuevo usuario
	regResp, err := svc.Register(RegisterRequest{
		Email:    "nuevo@estudiante.edu.ar",
		Password: "password123",
		Nombre:   "Nuevo Estudiante",
	})
	if err != nil {
		t.Fatalf("unexpected error registering: %v", err)
	}

	if regResp.User.EmailVerified {
		t.Errorf("expected new user to have email_verified = false")
	}

	// Verificar que se guardó token de verificación
	if len(repo.verificationTokens) != 1 {
		t.Fatalf("expected 1 verification token in repo, got %d", len(repo.verificationTokens))
	}

	var savedToken *EmailVerificationToken
	for _, tok := range repo.verificationTokens {
		savedToken = tok
		break
	}

	if savedToken.Used {
		t.Errorf("expected verification token to be unused")
	}

	// 2. Probar verificación con token inválido
	err = svc.VerifyEmail("token-invalido")
	if err == nil {
		t.Errorf("expected error with invalid verification token")
	}

	// 3. Crear token con hash conocido
	rawTestToken := "verif-token-1234567890abcdef"
	verifHash := HashResetToken(rawTestToken)
	customVerif := &EmailVerificationToken{
		ID:        uuid.New().String(),
		UsuarioID: regResp.User.ID,
		TokenHash: verifHash,
		ExpiresAt: time.Now().Add(24 * time.Hour),
		Used:      false,
	}
	_ = repo.SaveEmailVerificationToken(customVerif)

	// 4. Confirmar cuenta
	err = svc.VerifyEmail(rawTestToken)
	if err != nil {
		t.Fatalf("unexpected error on VerifyEmail: %v", err)
	}

	// Verificar que quedó verificado
	user, _ := repo.FindByID(regResp.User.ID)
	if !user.EmailVerified {
		t.Errorf("expected user email_verified to be true")
	}

	if !customVerif.Used {
		t.Errorf("expected verification token to be marked as used")
	}

	// 5. Reenviar confirmación cuando ya está verificado debe dar error
	err = svc.ResendVerificationEmail(user.Email)
	if err == nil {
		t.Errorf("expected error resending verification to already verified user")
	}
}

