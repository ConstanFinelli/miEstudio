package notes

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
	group := router.Group("/apuntes")
	group.Get("/", h.GetAll)
	group.Get("/:id", h.GetByID)
	group.Post("/", h.Create)
	group.Put("/:id", h.Update)
	group.Delete("/:id", h.Delete)
}

func (h *Handler) GetAll(c *fiber.Ctx) error {
	materiaID := c.Query("materia_id")
	carpeta := c.Query("carpeta")
	search := c.Query("search")

	apuntes, err := h.service.ListApuntes(c.Context(), materiaID, carpeta, search)
	if err != nil {
		return common.SendError(c, fiber.StatusInternalServerError, "Error al obtener apuntes", err.Error())
	}
	return common.SendSuccess(c, apuntes)
}

func (h *Handler) GetByID(c *fiber.Ctx) error {
	id := c.Params("id")
	apunte, err := h.service.GetApunte(c.Context(), id)
	if err != nil {
		return common.SendError(c, fiber.StatusNotFound, err.Error())
	}
	return common.SendSuccess(c, apunte)
}

func (h *Handler) Create(c *fiber.Ctx) error {
	var dto CreateApunteDTO
	if err := c.BodyParser(&dto); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Datos de apunte inválidos", err.Error())
	}

	created, err := h.service.CreateApunte(c.Context(), dto)
	if err != nil {
		return common.SendError(c, fiber.StatusBadRequest, err.Error())
	}
	return common.SendCreated(c, created)
}

func (h *Handler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var dto UpdateApunteDTO
	if err := c.BodyParser(&dto); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Datos de actualización inválidos", err.Error())
	}

	updated, err := h.service.UpdateApunte(c.Context(), id, dto)
	if err != nil {
		return common.SendError(c, fiber.StatusBadRequest, err.Error())
	}
	return common.SendSuccess(c, updated)
}

func (h *Handler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.service.DeleteApunte(c.Context(), id); err != nil {
		return common.SendError(c, fiber.StatusInternalServerError, "Error al eliminar apunte", err.Error())
	}
	return common.SendSuccess(c, fiber.Map{"deleted": true, "id": id})
}
