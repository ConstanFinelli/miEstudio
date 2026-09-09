package calendar

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
	group := router.Group("/calendario", authMiddleware)
	group.Get("/eventos", h.GetAll)
	group.Post("/eventos", h.Create)
	group.Delete("/eventos/:id", h.Delete)
}

func (h *Handler) GetAll(c *fiber.Ctx) error {
	userID := common.GetUserID(c)
	eventos, err := h.service.ListEventos(c.Context(), userID)
	if err != nil {
		return common.SendError(c, fiber.StatusInternalServerError, "Error al obtener eventos de calendario", err.Error())
	}
	return common.SendSuccess(c, eventos)
}

func (h *Handler) Create(c *fiber.Ctx) error {
	var dto CreateEventoDTO
	if err := c.BodyParser(&dto); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Datos de evento inválidos", err.Error())
	}

	userID := common.GetUserID(c)
	if dto.UsuarioID == "" {
		dto.UsuarioID = userID
	}

	created, err := h.service.CreateEvento(c.Context(), dto)
	if err != nil {
		return common.SendError(c, fiber.StatusBadRequest, err.Error())
	}
	return common.SendCreated(c, created)
}

func (h *Handler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.service.DeleteEvento(c.Context(), id); err != nil {
		return common.SendError(c, fiber.StatusInternalServerError, "Error al eliminar evento", err.Error())
	}
	return common.SendSuccess(c, fiber.Map{"deleted": true, "id": id})
}
