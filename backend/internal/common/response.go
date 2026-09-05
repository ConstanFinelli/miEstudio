package common

import (
	"github.com/gofiber/fiber/v2"
)

type ErrorResponse struct {
	Error   string `json:"error"`
	Details string `json:"details,omitempty"`
}

func SendError(c *fiber.Ctx, status int, message string, details ...string) error {
	resp := ErrorResponse{Error: message}
	if len(details) > 0 {
		resp.Details = details[0]
	}
	return c.Status(status).JSON(resp)
}

func SendSuccess(c *fiber.Ctx, data interface{}) error {
	return c.Status(fiber.StatusOK).JSON(data)
}

func SendCreated(c *fiber.Ctx, data interface{}) error {
	return c.Status(fiber.StatusCreated).JSON(data)
}
