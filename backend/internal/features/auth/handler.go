package auth

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"miestudio/backend/internal/common"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(router fiber.Router, authMiddleware fiber.Handler) {
	authGroup := router.Group("/auth")

	authGroup.Post("/register", h.Register)
	authGroup.Post("/login", h.Login)
	authGroup.Post("/refresh", h.Refresh)
	authGroup.Post("/logout", h.Logout)
	authGroup.Post("/forgot-password", h.ForgotPassword)
	authGroup.Get("/verify-reset-token", h.VerifyResetToken)
	authGroup.Post("/reset-password", h.ResetPassword)
	authGroup.Get("/verify-email", h.VerifyEmail)
	authGroup.Post("/verify-email", h.VerifyEmail)
	authGroup.Post("/resend-verification", h.ResendVerification)
	authGroup.Get("/me", authMiddleware, h.GetMe)
	authGroup.Put("/me", authMiddleware, h.UpdateMe)
}

func (h *Handler) Register(c *fiber.Ctx) error {
	var req RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Los datos enviados no son válidos. Por favor, revisá el formulario.")
	}

	resp, err := h.service.Register(req)
	if err != nil {
		return common.SendError(c, fiber.StatusBadRequest, err.Error())
	}

	h.setRefreshTokenCookie(c, resp.RefreshToken)
	return common.SendCreated(c, resp)
}

func (h *Handler) Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Por favor, ingresá un correo electrónico y una contraseña válidos.")
	}

	resp, err := h.service.Login(req)
	if err != nil {
		return common.SendError(c, fiber.StatusUnauthorized, err.Error())
	}

	h.setRefreshTokenCookie(c, resp.RefreshToken)
	return common.SendSuccess(c, resp)
}

func (h *Handler) Refresh(c *fiber.Ctx) error {
	refreshToken := c.Cookies("refresh_token")
	if refreshToken == "" {
		var req RefreshRequest
		_ = c.BodyParser(&req)
		refreshToken = req.RefreshToken
	}

	if refreshToken == "" {
		return common.SendError(c, fiber.StatusUnauthorized, "Tu sesión ha expirado. Por favor, iniciá sesión nuevamente.")
	}

	resp, err := h.service.RefreshToken(refreshToken)
	if err != nil {
		return common.SendError(c, fiber.StatusUnauthorized, err.Error())
	}

	h.setRefreshTokenCookie(c, resp.RefreshToken)
	return common.SendSuccess(c, resp)
}

func (h *Handler) Logout(c *fiber.Ctx) error {
	refreshToken := c.Cookies("refresh_token")
	if refreshToken == "" {
		var req RefreshRequest
		_ = c.BodyParser(&req)
		refreshToken = req.RefreshToken
	}

	_ = h.service.Logout(refreshToken)

	// Borrar cookie
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Expires:  time.Now().Add(-1 * time.Hour),
		HTTPOnly: true,
		SameSite: "Lax",
	})

	return common.SendSuccess(c, fiber.Map{"message": "Sesión cerrada correctamente"})
}

func (h *Handler) GetMe(c *fiber.Ctx) error {
	userID := common.GetUserID(c)
	if userID == "" {
		return common.SendError(c, fiber.StatusUnauthorized, "Usuario no autenticado")
	}

	user, carrera, err := h.service.GetMe(userID)
	if err != nil {
		return common.SendError(c, fiber.StatusNotFound, err.Error())
	}

	return common.SendSuccess(c, fiber.Map{
		"user":           user.ToDTO(),
		"carrera_activa": carrera,
	})
}

func (h *Handler) UpdateMe(c *fiber.Ctx) error {
	userID := common.GetUserID(c)
	if userID == "" {
		return common.SendError(c, fiber.StatusUnauthorized, "Usuario no autenticado")
	}

	var req UpdateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Datos de usuario inválidos")
	}

	user, err := h.service.UpdateMe(userID, req)
	if err != nil {
		return common.SendError(c, fiber.StatusBadRequest, err.Error())
	}

	return common.SendSuccess(c, fiber.Map{
		"user": user.ToDTO(),
	})
}

func (h *Handler) setRefreshTokenCookie(c *fiber.Ctx, token string) {
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    token,
		Expires:  time.Now().Add(30 * 24 * time.Hour),
		HTTPOnly: true,
		Secure:   false, // Para desarrollo local. En prod habilitar con c.Secure()
		SameSite: "Lax",
		Path:     "/",
	})
}

func (h *Handler) ForgotPassword(c *fiber.Ctx) error {
	var req ForgotPasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Datos de solicitud inválidos")
	}

	if req.Email == "" {
		return common.SendError(c, fiber.StatusBadRequest, "El correo electrónico es obligatorio")
	}

	if err := h.service.ForgotPassword(req.Email); err != nil {
		return common.SendError(c, fiber.StatusInternalServerError, "Error al procesar la solicitud")
	}

	return common.SendSuccess(c, fiber.Map{
		"message": "Si el correo está registrado en miEstudio, recibirás un enlace para restablecer tu contraseña.",
	})
}

func (h *Handler) VerifyResetToken(c *fiber.Ctx) error {
	token := c.Query("token")
	if token == "" {
		return common.SendError(c, fiber.StatusBadRequest, "Token de recuperación no provisto")
	}

	valid, email, err := h.service.VerifyResetToken(token)
	if err != nil || !valid {
		return common.SendError(c, fiber.StatusBadRequest, "El enlace de recuperación es inválido o ha expirado")
	}

	return common.SendSuccess(c, fiber.Map{
		"valid": true,
		"email": email,
	})
}

func (h *Handler) ResetPassword(c *fiber.Ctx) error {
	var req ResetPasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Datos de solicitud inválidos")
	}

	if req.Token == "" || req.Password == "" {
		return common.SendError(c, fiber.StatusBadRequest, "El token y la nueva contraseña son obligatorios")
	}

	if err := h.service.ResetPassword(req.Token, req.Password); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, err.Error())
	}

	return common.SendSuccess(c, fiber.Map{
		"message": "Tu contraseña ha sido restablecida con éxito. Ya podés iniciar sesión con tu nueva clave.",
	})
}

func (h *Handler) VerifyEmail(c *fiber.Ctx) error {
	token := c.Query("token")
	if token == "" {
		var req VerifyEmailRequest
		_ = c.BodyParser(&req)
		token = req.Token
	}

	if token == "" {
		return common.SendError(c, fiber.StatusBadRequest, "Token de confirmación requerido")
	}

	if err := h.service.VerifyEmail(token); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, err.Error())
	}

	return common.SendSuccess(c, fiber.Map{
		"message": "¡Tu cuenta ha sido verificada exitosamente! Ya podés acceder a todas las funciones de miEstudio.",
	})
}

func (h *Handler) ResendVerification(c *fiber.Ctx) error {
	var req ResendVerificationRequest
	if err := c.BodyParser(&req); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Datos de solicitud inválidos")
	}

	if req.Email == "" {
		return common.SendError(c, fiber.StatusBadRequest, "El correo electrónico es obligatorio")
	}

	if err := h.service.ResendVerificationEmail(req.Email); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, err.Error())
	}

	return common.SendSuccess(c, fiber.Map{
		"message": "Si tu correo requiere confirmación, recibirás un nuevo enlace en tu casilla.",
	})
}


