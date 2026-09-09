package ai

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
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
		// Crear contexto independiente para la goroutine de streaming
		// para evitar nil pointer dereference al reciclar RequestCtx en fasthttp
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
		return common.SendError(c, fiber.StatusInternalServerError, "Error al generar cuestionario", err.Error())
	}

	return common.SendSuccess(c, resp)
}

func (h *Handler) ExplicarSeleccion(c *fiber.Ctx) error {
	var req ExplicarRequest
	if err := c.BodyParser(&req); err != nil {
		return common.SendError(c, fiber.StatusBadRequest, "Payload inválido para explicación", err.Error())
	}

	if req.Texto == "" {
		return common.SendError(c, fiber.StatusBadRequest, "El texto a explicar es obligatorio")
	}

	resp, err := h.service.ExplicarSeleccion(c.UserContext(), req)
	if err != nil {
		return common.SendError(c, fiber.StatusInternalServerError, "Error al explicar selección", err.Error())
	}

	return common.SendSuccess(c, resp)
}
