package common

import (
	"github.com/gofiber/fiber/v2"
)

const (
	LocalUserID          = "user_id"
	LocalEmail           = "email"
	LocalActiveCarreraID = "active_carrera_id"
)

func GetUserID(c *fiber.Ctx) string {
	val, ok := c.Locals(LocalUserID).(string)
	if !ok {
		return ""
	}
	return val
}

func GetActiveCarreraID(c *fiber.Ctx) string {
	if h := c.Get("X-Active-Carrera-ID"); h != "" {
		return h
	}
	if q := c.Query("carrera_id"); q != "" {
		return q
	}
	val, ok := c.Locals(LocalActiveCarreraID).(string)
	if !ok {
		return ""
	}
	return val
}
