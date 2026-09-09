package profile

import (
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
	group := router.Group("/perfil", authMiddleware)
	group.Get("/", h.Get)
	group.Put("/", h.Update)
}

func (h *Handler) Get(c *fiber.Ctx) error {
	p, err := h.service.GetPerfil(c.Context())
	if err != nil {
		return common.SendError(c, fiber.StatusInternalServerError, "Error al obtener perfil", err.Error())
	}
	return common.SendSuccess(c, p)
}

func (h *Handler) Update(c *fiber.Ctx) error {
	var dto UpdatePerfilDTO
	if err := c.BodyParser(&dto); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Datos de perfil inválidos", err.Error())
	}

	updated, err := h.service.UpdatePerfil(c.Context(), dto)
	if err != nil {
		return common.SendError(c, fiber.StatusBadRequest, err.Error())
	}
	return common.SendSuccess(c, updated)
}
