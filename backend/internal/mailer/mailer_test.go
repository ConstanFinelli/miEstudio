package mailer

import (
	"testing"

	"miestudio/backend/internal/config"
)

func TestDevConsoleMailerFallback(t *testing.T) {
	// With empty SMTP host and port, it should gracefully fall back to logDevConsole
	cfg := &config.Config{
		SMTPHost:    "",
		SMTPPort:    "",
		SMTPUser:    "",
		SMTPPassword: "",
		SMTPFrom:    "",
		FrontendURL: "http://localhost:5173",
	}

	m := NewMailer(cfg)

	if err := m.SendWelcomeEmail("test@example.com", "Juan Pérez"); err != nil {
		t.Fatalf("expected nil error on dev fallback, got: %v", err)
	}

	if err := m.SendVerificationEmail("test@example.com", "Juan Pérez", "http://localhost:5173/verify-email?token=xyz", 24); err != nil {
		t.Fatalf("expected nil error on dev fallback, got: %v", err)
	}

	if err := m.SendPasswordResetEmail("test@example.com", "Juan Pérez", "http://localhost:5173/reset-password?token=abc", 60); err != nil {
		t.Fatalf("expected nil error on dev fallback, got: %v", err)
	}

	if err := m.SendPasswordChangedEmail("test@example.com", "Juan Pérez"); err != nil {
		t.Fatalf("expected nil error on dev fallback, got: %v", err)
	}
}
