package auth

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"miestudio/backend/internal/common"
)

func AuthMiddleware(jwtSecret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return common.SendError(c, fiber.StatusUnauthorized, "Token de autorización requerido")
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			return common.SendError(c, fiber.StatusUnauthorized, "Formato de token inválido (debe ser Bearer <token>)")
		}

		claims, err := ValidateAccessToken(parts[1], jwtSecret)
		if err != nil {
			return common.SendError(c, fiber.StatusUnauthorized, "Token inválido o expirado", err.Error())
		}

		c.Locals(common.LocalUserID, claims.UserID)
		c.Locals(common.LocalEmail, claims.Email)
		c.Locals(common.LocalActiveCarreraID, claims.ActiveCarreraID)

		return c.Next()
	}
}

// OptionalAuthMiddleware inspecciona el header Authorization si existe y puebla
// los locals de usuario sin rechazar requests anónimas.
func OptionalAuthMiddleware(jwtSecret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Next()
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			return c.Next()
		}

		claims, err := ValidateAccessToken(parts[1], jwtSecret)
		if err == nil && claims != nil {
			c.Locals(common.LocalUserID, claims.UserID)
			c.Locals(common.LocalEmail, claims.Email)
			c.Locals(common.LocalActiveCarreraID, claims.ActiveCarreraID)
		}

		return c.Next()
	}
}
