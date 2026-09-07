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
	authGroup.Get("/me", authMiddleware, h.GetMe)
}

func (h *Handler) Register(c *fiber.Ctx) error {
	var req RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Datos de registro inválidos")
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
		return common.SendError(c, fiber.StatusBadRequest, "Datos de login inválidos")
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
		return common.SendError(c, fiber.StatusUnauthorized, "Refresh token no provisto")
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
