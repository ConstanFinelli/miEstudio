package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port         string
	DBDriver     string
	DBUser       string
	DBPassword   string
	DBHost       string
	DBPort       string
	DBName       string
	StorageDir   string
	CORSOrigins  []string
	JWTSecret    string
	GeminiAPIKey string
	GeminiModel  string
}

func Load() *Config {
	// Intentar cargar .env desde distintas rutas relativas comunes según desde dónde se lance la app
	candidatePaths := []string{
		".env",
		"../.env",
		"../../.env",
		"backend/.env",
	}
	for _, envPath := range candidatePaths {
		if _, err := os.Stat(envPath); err == nil {
			_ = godotenv.Load(envPath)
			break
		}
	}

	port := getEnv("PORT", "8080")
	dbDriver := getEnv("DB_DRIVER", "mysql")
	dbUser := getEnv("DB_USER", "miestudio")
	dbPassword := getEnv("DB_PASSWORD", "miestudio123")
	dbHost := getEnv("DB_HOST", "127.0.0.1")
	dbPort := getEnv("DB_PORT", "3306")
	dbName := getEnv("DB_NAME", "miestudio")
	storageDir := getEnv("STORAGE_DIR", "./uploads")
	jwtSecret := getEnv("JWT_SECRET", "miestudio-super-secret-jwt-key-change-in-production-32bytes")
	geminiAPIKey := getEnv("GEMINI_API_KEY", "")
	geminiModel := getEnv("GEMINI_MODEL", "gemini-3.8-flash")

	corsStr := getEnv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
	corsOrigins := strings.Split(corsStr, ",")

	return &Config{
		Port:         port,
		DBDriver:     dbDriver,
		DBUser:       dbUser,
		DBPassword:   dbPassword,
		DBHost:       dbHost,
		DBPort:       dbPort,
		DBName:       dbName,
		StorageDir:   storageDir,
		CORSOrigins:  corsOrigins,
		JWTSecret:    jwtSecret,
		GeminiAPIKey: geminiAPIKey,
		GeminiModel:  geminiModel,
	}
}

func (c *Config) GetMySQLDSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		c.DBUser, c.DBPassword, c.DBHost, c.DBPort, c.DBName)
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
