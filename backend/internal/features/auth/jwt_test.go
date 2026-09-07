package auth

import (
	"testing"
	"time"
)

func TestHashAndCheckPassword(t *testing.T) {
	pass := "superSecret123"
	hash, err := HashPassword(pass)
	if err != nil {
		t.Fatalf("error hashing password: %v", err)
	}

	if !CheckPasswordHash(pass, hash) {
		t.Errorf("password verification failed for matching password")
	}

	if CheckPasswordHash("wrongPass", hash) {
		t.Errorf("password verification succeeded for incorrect password")
	}
}

func TestGenerateAndValidateAccessToken(t *testing.T) {
	user := &Usuario{
		ID:     "usr-12345",
		Email:  "student@test.com",
		Nombre: "Test Student",
	}
	secret := "test-secret-key-32-bytes-minimum"
	activeCarreraID := "car-999"

	token, err := GenerateAccessToken(user, activeCarreraID, secret, 1*time.Hour)
	if err != nil {
		t.Fatalf("error generating token: %v", err)
	}

	claims, err := ValidateAccessToken(token, secret)
	if err != nil {
		t.Fatalf("error validating token: %v", err)
	}

	if claims.UserID != user.ID {
		t.Errorf("expected UserID %s, got %s", user.ID, claims.UserID)
	}
	if claims.Email != user.Email {
		t.Errorf("expected Email %s, got %s", user.Email, claims.Email)
	}
	if claims.ActiveCarreraID != activeCarreraID {
		t.Errorf("expected ActiveCarreraID %s, got %s", activeCarreraID, claims.ActiveCarreraID)
	}

	// Test invalid secret
	_, err = ValidateAccessToken(token, "wrong-secret")
	if err == nil {
		t.Errorf("expected error when validating with wrong secret, got nil")
	}
}

func TestGenerateRefreshToken(t *testing.T) {
	token, hash, err := GenerateRefreshToken()
	if err != nil {
		t.Fatalf("error generating refresh token: %v", err)
	}

	if token == "" || hash == "" {
		t.Fatalf("expected non-empty token and hash")
	}

	computedHash := HashRefreshToken(token)
	if computedHash != hash {
		t.Errorf("expected computed hash %s to match generated hash %s", computedHash, hash)
	}
}
