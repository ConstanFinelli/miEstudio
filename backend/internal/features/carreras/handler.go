package carreras

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
	carrerasGroup := router.Group("/carreras", authMiddleware)

	carrerasGroup.Get("/", h.GetCarreras)
	carrerasGroup.Post("/", h.CreateCarrera)
	carrerasGroup.Get("/activa", h.GetActiveCarrera)
	carrerasGroup.Get("/:id", h.GetCarrera)
	carrerasGroup.Patch("/:id", h.UpdateCarrera)
	carrerasGroup.Post("/:id/activar", h.SetActiveCarrera)
	carrerasGroup.Delete("/:id", h.DeleteCarrera)

	// Aprobaciones Históricas (materias cursadas previamente / finales)
	carrerasGroup.Post("/aprobaciones/crear", h.RegistrarAprobacion)
	carrerasGroup.Get("/:id/aprobaciones", h.GetAprobaciones)
	carrerasGroup.Delete("/aprobaciones/:id", h.DeleteAprobacion)
}

func (h *Handler) CreateCarrera(c *fiber.Ctx) error {
	userID := common.GetUserID(c)
	var dto CreateCarreraDTO
	if err := c.BodyParser(&dto); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Datos de carrera inválidos")
	}

	carrera, err := h.service.CreateCarrera(userID, dto)
	if err != nil {
		return common.SendError(c, fiber.StatusBadRequest, err.Error())
	}

	return common.SendCreated(c, carrera)
}

func (h *Handler) GetCarreras(c *fiber.Ctx) error {
	userID := common.GetUserID(c)
	list, err := h.service.GetCarreras(userID)
	if err != nil {
		return common.SendError(c, fiber.StatusInternalServerError, err.Error())
	}
	return common.SendSuccess(c, list)
}

func (h *Handler) GetActiveCarrera(c *fiber.Ctx) error {
	userID := common.GetUserID(c)
	carrera, err := h.service.GetActiveCarrera(userID)
	if err != nil {
		return common.SendError(c, fiber.StatusInternalServerError, err.Error())
	}
	if carrera == nil {
		return common.SendError(c, fiber.StatusNotFound, "No se encontró carrera activa")
	}
	return common.SendSuccess(c, carrera)
}

func (h *Handler) GetCarrera(c *fiber.Ctx) error {
	userID := common.GetUserID(c)
	id := c.Params("id")

	carrera, err := h.service.GetCarrera(id, userID)
	if err != nil {
		return common.SendError(c, fiber.StatusNotFound, err.Error())
	}
	return common.SendSuccess(c, carrera)
}

func (h *Handler) UpdateCarrera(c *fiber.Ctx) error {
	userID := common.GetUserID(c)
	id := c.Params("id")

	var dto UpdateCarreraDTO
	if err := c.BodyParser(&dto); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Datos de actualización inválidos")
	}

	carrera, err := h.service.UpdateCarrera(id, userID, dto)
	if err != nil {
		return common.SendError(c, fiber.StatusBadRequest, err.Error())
	}
	return common.SendSuccess(c, carrera)
}

func (h *Handler) SetActiveCarrera(c *fiber.Ctx) error {
	userID := common.GetUserID(c)
	id := c.Params("id")

	if err := h.service.SetActiveCarrera(id, userID); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, err.Error())
	}
	return common.SendSuccess(c, fiber.Map{"message": "Carrera activada con éxito"})
}

func (h *Handler) DeleteCarrera(c *fiber.Ctx) error {
	userID := common.GetUserID(c)
	id := c.Params("id")

	if err := h.service.DeleteCarrera(id, userID); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, err.Error())
	}
	return common.SendSuccess(c, fiber.Map{"message": "Carrera eliminada"})
}

func (h *Handler) RegistrarAprobacion(c *fiber.Ctx) error {
	userID := common.GetUserID(c)
	var dto CreateAprobacionHistoricaDTO
	if err := c.BodyParser(&dto); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Datos de aprobación inválidos")
	}

	aprob, err := h.service.RegistrarAprobacion(userID, dto)
	if err != nil {
		return common.SendError(c, fiber.StatusBadRequest, err.Error())
	}
	return common.SendCreated(c, aprob)
}

func (h *Handler) GetAprobaciones(c *fiber.Ctx) error {
	userID := common.GetUserID(c)
	carreraID := c.Params("id")

	list, err := h.service.GetAprobaciones(carreraID, userID)
	if err != nil {
		return common.SendError(c, fiber.StatusInternalServerError, err.Error())
	}
	return common.SendSuccess(c, list)
}

func (h *Handler) DeleteAprobacion(c *fiber.Ctx) error {
	userID := common.GetUserID(c)
	id := c.Params("id")

	if err := h.service.DeleteAprobacion(id, userID); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, err.Error())
	}
	return common.SendSuccess(c, fiber.Map{"message": "Aprobación eliminada con éxito"})
}
