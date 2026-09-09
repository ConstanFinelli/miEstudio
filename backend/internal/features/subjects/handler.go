package subjects

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

func (h *Handler) RegisterRoutes(router fiber.Router, authMiddleware fiber.Handler) {
	group := router.Group("/materias", authMiddleware)
	group.Get("/", h.GetAll)
	group.Get("/:id", h.GetByID)
	group.Post("/", h.Create)
	group.Put("/:id", h.Update)
	group.Delete("/:id", h.Delete)
}

func (h *Handler) GetAll(c *fiber.Ctx) error {
	estado := c.Query("estado")
	anioStr := c.Query("anio")
	var anio int
	if anioStr != "" {
		anio, _ = strconv.Atoi(anioStr)
	}

	userID := common.GetUserID(c)
	carreraID := c.Query("carrera_id")
	if carreraID == "" {
		carreraID = common.GetActiveCarreraID(c)
	}

	materias, err := h.service.ListMaterias(c.Context(), userID, carreraID, estado, anio)
	if err != nil {
		return common.SendError(c, fiber.StatusInternalServerError, "Error al obtener materias", err.Error())
	}
	return common.SendSuccess(c, materias)
}

func (h *Handler) GetByID(c *fiber.Ctx) error {
	id := c.Params("id")
	materia, err := h.service.GetMateria(c.Context(), id)
	if err != nil {
		return common.SendError(c, fiber.StatusNotFound, err.Error())
	}
	return common.SendSuccess(c, materia)
}

func (h *Handler) Create(c *fiber.Ctx) error {
	var dto CreateMateriaDTO
	if err := c.BodyParser(&dto); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Datos de materia inválidos", err.Error())
	}

	userID := common.GetUserID(c)
	if dto.UsuarioID == "" {
		dto.UsuarioID = userID
	}
	if dto.CarreraID == "" {
		dto.CarreraID = common.GetActiveCarreraID(c)
	}

	created, err := h.service.CreateMateria(c.Context(), dto)
	if err != nil {
		return common.SendError(c, fiber.StatusBadRequest, err.Error())
	}
	return common.SendCreated(c, created)
}

func (h *Handler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var dto UpdateMateriaDTO
	if err := c.BodyParser(&dto); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Datos de actualización inválidos", err.Error())
	}

	updated, err := h.service.UpdateMateria(c.Context(), id, dto)
	if err != nil {
		return common.SendError(c, fiber.StatusBadRequest, err.Error())
	}
	return common.SendSuccess(c, updated)
}

func (h *Handler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.service.DeleteMateria(c.Context(), id); err != nil {
		return common.SendError(c, fiber.StatusInternalServerError, "Error al eliminar materia", err.Error())
	}
	return common.SendSuccess(c, fiber.Map{"deleted": true, "id": id})
}
