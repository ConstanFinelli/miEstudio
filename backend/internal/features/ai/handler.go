package ai

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/valyala/fasthttp"
	"miestudio/backend/internal/common"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(router fiber.Router, authMiddleware fiber.Handler) {
	// Rate limiting de seguridad para IA: máximo 15 consultas por minuto por usuario
	aiLimiter := limiter.New(limiter.Config{
		Max:        15,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			userID := common.GetUserID(c)
			if userID != "" {
				return "ai_usr_" + userID
			}
			return "ai_ip_" + c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return common.SendError(
				c,
				fiber.StatusTooManyRequests,
				"Has superado el límite de 15 consultas de IA por minuto. Por favor, aguarda un momento antes de volver a consultar para proteger la cuota del servicio.",
			)
		},
	})

	aiGroup := router.Group("/ai", authMiddleware, aiLimiter)

	aiGroup.Post("/chat", h.Chat)
	aiGroup.Post("/chat/stream", h.StreamChat)
	aiGroup.Post("/resumir", h.Resumir)
	aiGroup.Post("/flashcards", h.GenerarFlashcards)
	aiGroup.Post("/quiz", h.GenerarQuiz)
	aiGroup.Post("/explicar-seleccion", h.ExplicarSeleccion)
	aiGroup.Post("/validate-key", h.ValidateKey)
	aiGroup.Post("/parse-study-plan", h.ParseStudyPlan)
}

func (h *Handler) Chat(c *fiber.Ctx) error {
	userID := common.GetUserID(c)
	var req ChatRequest
	if err := c.BodyParser(&req); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Payload inválido para consulta IA", err.Error())
	}

	if req.Mensaje == "" {
		return common.SendError(c, fiber.StatusBadRequest, "El mensaje no puede estar vacío")
	}

	resp, err := h.service.Chat(c.UserContext(), userID, req)
	if err != nil {
		if strings.Contains(err.Error(), "GEMINI_KEY_REQUIRED") {
			return common.SendError(c, fiber.StatusUnauthorized, "Clave de Gemini requerida", err.Error())
		}
		return common.SendError(c, fiber.StatusInternalServerError, "Error al generar respuesta de IA", err.Error())
	}

	return common.SendSuccess(c, resp)
}

func (h *Handler) StreamChat(c *fiber.Ctx) error {
	userID := common.GetUserID(c)
	var req ChatRequest
	if err := c.BodyParser(&req); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Payload inválido para streaming IA", err.Error())
	}

	if req.Mensaje == "" {
		return common.SendError(c, fiber.StatusBadRequest, "El mensaje no puede estar vacío")
	}

	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache")
	c.Set("Connection", "keep-alive")
	c.Set("Transfer-Encoding", "chunked")

	c.Context().SetBodyStreamWriter(fasthttp.StreamWriter(func(w *bufio.Writer) {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Minute)
		defer cancel()

		err := h.service.StreamChat(ctx, userID, req, func(chunk string) error {
			payload, _ := json.Marshal(map[string]string{"chunk": chunk})
			_, writeErr := fmt.Fprintf(w, "data: %s\n\n", payload)
			if writeErr != nil {
				return writeErr
			}
			return w.Flush()
		})

		if err != nil {
			errPayload, _ := json.Marshal(map[string]string{"error": err.Error()})
			_, _ = fmt.Fprintf(w, "data: %s\n\n", errPayload)
			_ = w.Flush()
		}

		// Enviar señal de fin de stream
		_, _ = fmt.Fprintf(w, "data: [DONE]\n\n")
		_ = w.Flush()
	}))

	return nil
}

func (h *Handler) Resumir(c *fiber.Ctx) error {
	userID := common.GetUserID(c)
	var req ResumenRequest
	if err := c.BodyParser(&req); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Payload inválido para resumen", err.Error())
	}

	resp, err := h.service.Resumir(c.UserContext(), userID, req)
	if err != nil {
		if strings.Contains(err.Error(), "GEMINI_KEY_REQUIRED") {
			return common.SendError(c, fiber.StatusUnauthorized, "Clave de Gemini requerida", err.Error())
		}
		return common.SendError(c, fiber.StatusInternalServerError, "Error al generar resumen", err.Error())
	}

	return common.SendSuccess(c, resp)
}

func (h *Handler) GenerarFlashcards(c *fiber.Ctx) error {
	userID := common.GetUserID(c)
	var req FlashcardsRequest
	if err := c.BodyParser(&req); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Payload inválido para flashcards", err.Error())
	}

	resp, err := h.service.GenerarFlashcards(c.UserContext(), userID, req)
	if err != nil {
		if strings.Contains(err.Error(), "GEMINI_KEY_REQUIRED") {
			return common.SendError(c, fiber.StatusUnauthorized, "Clave de Gemini requerida", err.Error())
		}
		return common.SendError(c, fiber.StatusInternalServerError, "Error al generar flashcards", err.Error())
	}

	return common.SendSuccess(c, resp)
}

func (h *Handler) GenerarQuiz(c *fiber.Ctx) error {
	userID := common.GetUserID(c)
	var req QuizRequest
	if err := c.BodyParser(&req); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Payload inválido para quiz", err.Error())
	}

	resp, err := h.service.GenerarQuiz(c.UserContext(), userID, req)
	if err != nil {
		if strings.Contains(err.Error(), "GEMINI_KEY_REQUIRED") {
			return common.SendError(c, fiber.StatusUnauthorized, "Clave de Gemini requerida", err.Error())
		}
		return common.SendError(c, fiber.StatusInternalServerError, "Error al generar cuestionario", err.Error())
	}

	return common.SendSuccess(c, resp)
}

func (h *Handler) ExplicarSeleccion(c *fiber.Ctx) error {
	userID := common.GetUserID(c)
	var req ExplicarRequest
	if err := c.BodyParser(&req); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Payload inválido para explicación", err.Error())
	}

	if req.Texto == "" {
		return common.SendError(c, fiber.StatusBadRequest, "El texto a explicar es obligatorio")
	}

	resp, err := h.service.ExplicarSeleccion(c.UserContext(), userID, req)
	if err != nil {
		if strings.Contains(err.Error(), "GEMINI_KEY_REQUIRED") {
			return common.SendError(c, fiber.StatusUnauthorized, "Clave de Gemini requerida", err.Error())
		}
		return common.SendError(c, fiber.StatusInternalServerError, "Error al explicar selección", err.Error())
	}

	return common.SendSuccess(c, resp)
}

func (h *Handler) ValidateKey(c *fiber.Ctx) error {
	var req ValidateKeyRequest
	if err := c.BodyParser(&req); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Payload inválido", err.Error())
	}

	if req.APIKey == "" {
		return common.SendError(c, fiber.StatusBadRequest, "La clave de API no puede estar vacía")
	}

	if err := h.service.ValidateKey(c.UserContext(), req.APIKey); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Clave de API inválida o sin acceso a los modelos de Gemini", err.Error())
	}

	return common.SendSuccess(c, fiber.Map{
		"valido":  true,
		"mensaje": "API Key validada con éxito",
	})
}

func (h *Handler) ParseStudyPlan(c *fiber.Ctx) error {
	userID := common.GetUserID(c)
	var fileBytes []byte
	var mimeType string
	var textContent string
	var customKey string

	contentType := c.Get("Content-Type")
	if strings.Contains(contentType, "multipart/form-data") {
		fileHeader, err := c.FormFile("file")
		if err != nil || fileHeader == nil {
			fileHeader, _ = c.FormFile("archivo")
		}
		if fileHeader != nil {
			mimeType = fileHeader.Header.Get("Content-Type")
			f, err := fileHeader.Open()
			if err == nil {
				defer f.Close()
				fileBytes, _ = io.ReadAll(f)
			}
		}
		textContent = c.FormValue("texto")
		customKey = c.FormValue("custom_key")
	} else {
		var body struct {
			Texto     string `json:"texto"`
			CustomKey string `json:"custom_key"`
		}
		_ = c.BodyParser(&body)
		textContent = body.Texto
		customKey = body.CustomKey
	}

	if len(fileBytes) == 0 && strings.TrimSpace(textContent) == "" {
		return common.SendError(c, fiber.StatusBadRequest, "Debes subir un archivo PDF/imagen o ingresar el texto del plan de estudios")
	}

	var customKeys []string
	if customKey != "" {
		customKeys = append(customKeys, customKey)
	}

	resp, err := h.service.ParseStudyPlan(c.UserContext(), userID, fileBytes, mimeType, textContent, customKeys...)
	if err != nil {
		if strings.Contains(err.Error(), "GEMINI_KEY_REQUIRED") {
			return common.SendError(c, fiber.StatusUnauthorized, "Clave de Gemini requerida", err.Error())
		}
		return common.SendError(c, fiber.StatusInternalServerError, "Error al extraer plan de estudios con IA", err.Error())
	}

	return common.SendSuccess(c, resp)
}
