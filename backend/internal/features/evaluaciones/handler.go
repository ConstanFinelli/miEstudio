package evaluaciones

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"miestudio/backend/internal/common"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(router fiber.Router) {
	group := router.Group("/evaluaciones")
	group.Get("/", h.GetAll)
	group.Get("/proximas", h.GetProximas)
	group.Get("/:id", h.GetByID)
	group.Post("/", h.Create)
	group.Patch("/:id/nota", h.UpdateNota)
	group.Delete("/:id", h.Delete)
}

func (h *Handler) GetAll(c *fiber.Ctx) error {
	materiaID := c.Query("materia_id")
	evaluaciones, err := h.service.ListEvaluaciones(c.Context(), materiaID)
	if err != nil {
		return common.SendError(c, fiber.StatusInternalServerError, "Error al obtener evaluaciones", err.Error())
	}
	return common.SendSuccess(c, ToResponseDTOList(evaluaciones))
}

func (h *Handler) GetProximas(c *fiber.Ctx) error {
	limitStr := c.Query("limit")
	limit := 10
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	proximas, err := h.service.ListProximas(c.Context(), limit)
	if err != nil {
		return common.SendError(c, fiber.StatusInternalServerError, "Error al obtener próximas evaluaciones", err.Error())
	}
	return common.SendSuccess(c, ToResponseDTOList(proximas))
}

func (h *Handler) GetByID(c *fiber.Ctx) error {
	id := c.Params("id")
	ev, err := h.service.GetEvaluacion(c.Context(), id)
	if err != nil {
		return common.SendError(c, fiber.StatusNotFound, err.Error())
	}
	return common.SendSuccess(c, ToResponseDTO(*ev))
}

func (h *Handler) Create(c *fiber.Ctx) error {
	var dto CreateEvaluacionDTO
	if err := c.BodyParser(&dto); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Datos de evaluación inválidos", err.Error())
	}

	created, err := h.service.CreateEvaluacion(c.Context(), dto)
	if err != nil {
		return common.SendError(c, fiber.StatusBadRequest, err.Error())
	}
	return common.SendCreated(c, ToResponseDTO(*created))
}

func (h *Handler) UpdateNota(c *fiber.Ctx) error {
	id := c.Params("id")
	var dto UpdateNotaDTO
	if err := c.BodyParser(&dto); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Nota inválida", err.Error())
	}

	updated, err := h.service.UpdateNota(c.Context(), id, dto.Nota)
	if err != nil {
		return common.SendError(c, fiber.StatusBadRequest, err.Error())
	}
	return common.SendSuccess(c, ToResponseDTO(*updated))
}

func (h *Handler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.service.DeleteEvaluacion(c.Context(), id); err != nil {
		return common.SendError(c, fiber.StatusInternalServerError, "Error al eliminar evaluación", err.Error())
	}
	return common.SendSuccess(c, fiber.Map{"deleted": true, "id": id})
}
