package auth

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"miestudio/backend/internal/common"
)

func AuthMiddleware(jwtSecret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var tokenStr string
		authHeader := c.Get("Authorization")
		if authHeader != "" {
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
				tokenStr = parts[1]
			} else {
				return common.SendError(c, fiber.StatusUnauthorized, "Formato de token inválido (debe ser Bearer <token>)")
			}
		}

		// Soporte de token vía query param (ej. visores PDF en iframe o descarga de archivos)
		if tokenStr == "" {
			tokenStr = c.Query("token")
		}

		if tokenStr == "" {
			return common.SendError(c, fiber.StatusUnauthorized, "Token de autorización requerido")
		}

		claims, err := ValidateAccessToken(tokenStr, jwtSecret)
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
		var tokenStr string
		authHeader := c.Get("Authorization")
		if authHeader != "" {
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
				tokenStr = parts[1]
			}
		}
		if tokenStr == "" {
			tokenStr = c.Query("token")
		}

		if tokenStr == "" {
			return c.Next()
		}

		claims, err := ValidateAccessToken(tokenStr, jwtSecret)
		if err == nil && claims != nil {
			c.Locals(common.LocalUserID, claims.UserID)
			c.Locals(common.LocalEmail, claims.Email)
			c.Locals(common.LocalActiveCarreraID, claims.ActiveCarreraID)
		}

		return c.Next()
	}
}
