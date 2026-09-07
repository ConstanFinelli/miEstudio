package schedules

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

func (h *Handler) RegisterRoutes(router fiber.Router) {
	group := router.Group("/horarios")
	group.Get("/", h.GetAll)
	group.Get("/:id", h.GetByID)
	group.Post("/", h.Create)
	group.Put("/:id", h.Update)
	group.Delete("/:id", h.Delete)
}

func (h *Handler) GetAll(c *fiber.Ctx) error {
	materiaID := c.Query("materia_id")
	diaSemana := c.Query("dia_semana")
	userID := common.GetUserID(c)

	list, err := h.service.ListHorarios(c.Context(), userID, materiaID, diaSemana)
	if err != nil {
		return common.SendError(c, fiber.StatusInternalServerError, "Error al obtener horarios de cursada", err.Error())
	}
	return common.SendSuccess(c, list)
}

func (h *Handler) GetByID(c *fiber.Ctx) error {
	id := c.Params("id")
	item, err := h.service.GetHorario(c.Context(), id)
	if err != nil {
		return common.SendError(c, fiber.StatusNotFound, err.Error())
	}
	return common.SendSuccess(c, item)
}

func (h *Handler) Create(c *fiber.Ctx) error {
	var dto CreateHorarioDTO
	if err := c.BodyParser(&dto); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Datos de horario inválidos", err.Error())
	}

	userID := common.GetUserID(c)
	if dto.UsuarioID == "" {
		dto.UsuarioID = userID
	}

	created, err := h.service.CreateHorario(c.Context(), dto)
	if err != nil {
		return common.SendError(c, fiber.StatusBadRequest, err.Error())
	}
	return common.SendCreated(c, created)
}

func (h *Handler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var dto UpdateHorarioDTO
	if err := c.BodyParser(&dto); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Datos de actualización inválidos", err.Error())
	}

	updated, err := h.service.UpdateHorario(c.Context(), id, dto)
	if err != nil {
		return common.SendError(c, fiber.StatusBadRequest, err.Error())
	}
	return common.SendSuccess(c, updated)
}

func (h *Handler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.service.DeleteHorario(c.Context(), id); err != nil {
		return common.SendError(c, fiber.StatusInternalServerError, "Error al eliminar horario", err.Error())
	}
	return common.SendSuccess(c, fiber.Map{"deleted": true, "id": id})
}
