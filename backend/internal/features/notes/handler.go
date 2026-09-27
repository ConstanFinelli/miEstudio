package notes

import (
	"fmt"

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
	// Ruta pública para servir imágenes referenciadas en Markdown y exports
	router.Get("/apuntes/imagenes/:key", h.StreamImage)

	group := router.Group("/apuntes", authMiddleware)
	group.Get("/", h.GetAll)
	group.Post("/imagenes", h.UploadImage)
	group.Get("/:id", h.GetByID)
	group.Post("/", h.Create)
	group.Put("/:id", h.Update)
	group.Delete("/:id", h.Delete)
}

func (h *Handler) GetAll(c *fiber.Ctx) error {
	materiaID := c.Query("materia_id")
	carpeta := c.Query("carpeta")
	search := c.Query("search")
	userID := common.GetUserID(c)

	apuntes, err := h.service.ListApuntes(c.Context(), userID, materiaID, carpeta, search)
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

	userID := common.GetUserID(c)
	if dto.UsuarioID == "" {
		dto.UsuarioID = userID
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

func (h *Handler) UploadImage(c *fiber.Ctx) error {
	fileHeader, err := c.FormFile("image")
	if err != nil {
		fileHeader, err = c.FormFile("file")
		if err != nil {
			return common.SendError(c, fiber.StatusBadRequest, "Por favor, seleccioná una imagen para subir.", err.Error())
		}
	}

	// Limitar a 15MB
	if fileHeader.Size > 15*1024*1024 {
		return common.SendError(c, fiber.StatusBadRequest, "La imagen supera el tamaño máximo permitido (15 MB).")
	}

	file, err := fileHeader.Open()
	if err != nil {
		return common.SendError(c, fiber.StatusInternalServerError, "No se pudo leer la imagen seleccionada.", err.Error())
	}
	defer file.Close()

	mimeType := fileHeader.Header.Get("Content-Type")
	key, err := h.service.UploadImage(c.Context(), file, fileHeader.Filename, mimeType)
	if err != nil {
		return common.SendError(c, fiber.StatusBadRequest, err.Error())
	}

	url := fmt.Sprintf("/api/apuntes/imagenes/%s", key)
	return common.SendCreated(c, fiber.Map{
		"url":      url,
		"key":      key,
		"filename": fileHeader.Filename,
	})
}

func (h *Handler) StreamImage(c *fiber.Ctx) error {
	key := c.Params("key")
	stream, size, mimeType, err := h.service.GetImage(c.Context(), key)
	if err != nil {
		return common.SendError(c, fiber.StatusNotFound, "Imagen no encontrada", err.Error())
	}

	c.Set("Content-Type", mimeType)
	c.Set("Cache-Control", "public, max-age=31536000, immutable")
	c.Set("Accept-Ranges", "bytes")

	return c.SendStream(stream, int(size))
}

