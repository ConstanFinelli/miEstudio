package materials

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
	// Rutas por materia
	router.Get("/materias/:materia_id/materiales", authMiddleware, h.GetByMateria)
	router.Post("/materias/:materia_id/materiales", authMiddleware, h.Upload)
	router.Delete("/materias/:materia_id/materiales", authMiddleware, h.DeleteByMateria)

	// Stream de archivo para visores de PDF en iframe o apertura en nueva pestaña
	router.Get("/materiales/:id/archivo", h.StreamFile)

	// Rutas por material protegidas con autenticación
	materialsGroup := router.Group("/materiales", authMiddleware)
	materialsGroup.Get("/:id", h.GetByID)
	materialsGroup.Put("/:id", h.Update)
	materialsGroup.Delete("/:id", h.Delete)
}

func (h *Handler) GetByMateria(c *fiber.Ctx) error {
	materiaID := c.Params("materia_id")
	categoria := c.Query("categoria")
	userID := common.GetUserID(c)

	materials, err := h.service.ListMateriales(c.Context(), userID, materiaID, categoria)
	if err != nil {
		return common.SendError(c, fiber.StatusInternalServerError, "Error al obtener materiales", err.Error())
	}
	return common.SendSuccess(c, materials)
}

func (h *Handler) GetByID(c *fiber.Ctx) error {
	id := c.Params("id")
	mat, err := h.service.GetMaterial(c.Context(), id)
	if err != nil {
		return common.SendError(c, fiber.StatusNotFound, err.Error())
	}
	return common.SendSuccess(c, mat)
}

func (h *Handler) Upload(c *fiber.Ctx) error {
	materiaID := c.Params("materia_id")
	fileHeader, err := c.FormFile("file")
	if err != nil {
		var err2 error
		fileHeader, err2 = c.FormFile("archivo")
		if err2 != nil {
			return common.SendError(c, fiber.StatusBadRequest, "No se adjuntó ningún archivo (campo 'file' o 'archivo')", err.Error())
		}
	}

	file, err := fileHeader.Open()
	if err != nil {
		return common.SendError(c, fiber.StatusInternalServerError, "Error al leer archivo", err.Error())
	}
	defer file.Close()

	userID := common.GetUserID(c)
	titulo := c.FormValue("titulo", fileHeader.Filename)
	categoria := c.FormValue("categoria", "TEORIA")
	mimeType := fileHeader.Header.Get("Content-Type")
	if mimeType == "" {
		mimeType = "application/pdf"
	}

	material, err := h.service.UploadMaterial(c.Context(), userID, materiaID, titulo, categoria, file, fileHeader.Filename, mimeType)
	if err != nil {
		return common.SendError(c, fiber.StatusInternalServerError, "Error al guardar material", err.Error())
	}

	return common.SendCreated(c, material)
}

func (h *Handler) StreamFile(c *fiber.Ctx) error {
	id := c.Params("id")
	filePath, mat, err := h.service.GetFilePath(c.Context(), id)
	if err != nil {
		return common.SendError(c, fiber.StatusNotFound, "Material no encontrado")
	}

	// Encabezados para visualización óptima en visor web y soporte HTTP Range streaming
	c.Set("Content-Type", mat.MimeType)
	c.Set("Content-Disposition", fmt.Sprintf("inline; filename=\"%s\"", mat.ArchivoNombreOriginal))
	c.Set("Accept-Ranges", "bytes")

	return c.SendFile(filePath)
}

func (h *Handler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var dto UpdateMaterialDTO
	if err := c.BodyParser(&dto); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Datos inválidos", err.Error())
	}

	updated, err := h.service.UpdateMaterial(c.Context(), id, dto)
	if err != nil {
		return common.SendError(c, fiber.StatusBadRequest, err.Error())
	}
	return common.SendSuccess(c, updated)
}

func (h *Handler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.service.DeleteMaterial(c.Context(), id); err != nil {
		return common.SendError(c, fiber.StatusInternalServerError, "Error al eliminar material", err.Error())
	}
	return common.SendSuccess(c, fiber.Map{"deleted": true, "id": id})
}

func (h *Handler) DeleteByMateria(c *fiber.Ctx) error {
	materiaID := c.Params("materia_id")
	userID := common.GetUserID(c)

	count, err := h.service.DeleteMaterialesByMateria(c.Context(), userID, materiaID)
	if err != nil {
		return common.SendError(c, fiber.StatusInternalServerError, "Error al eliminar materiales de la materia", err.Error())
	}
	return common.SendSuccess(c, fiber.Map{
		"deleted": count,
		"message": fmt.Sprintf("Se eliminaron %d materiales correctamente", count),
	})
}
