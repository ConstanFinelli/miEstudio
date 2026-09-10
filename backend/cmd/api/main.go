package main

import (
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"

	"miestudio/backend/internal/common"
	"miestudio/backend/internal/config"
	"miestudio/backend/internal/db"
	"miestudio/backend/internal/features/ai"
	"miestudio/backend/internal/features/auth"
	"miestudio/backend/internal/features/calendar"
	"miestudio/backend/internal/features/carreras"
	"miestudio/backend/internal/features/evaluaciones"
	"miestudio/backend/internal/features/materials"
	"miestudio/backend/internal/features/notes"
	"miestudio/backend/internal/features/profile"
	"miestudio/backend/internal/features/schedules"
	"miestudio/backend/internal/features/subjects"
	"miestudio/backend/internal/storage"
)

func main() {
	cfg := config.Load()

	// 1. Inicializar Base de Datos (MySQL y migraciones automáticas)
	database, err := db.Init(cfg)
	if err != nil {
		log.Fatalf("Error crítico al inicializar la base de datos: %v", err)
	}

	// 2. Inicializar Storage Local para PDFs
	storageService, err := storage.NewLocalStorage(cfg.StorageDir)
	if err != nil {
		log.Fatalf("Error crítico al inicializar el servicio de almacenamiento: %v", err)
	}

	// 3. Instanciar Servidor Fiber
	app := fiber.New(fiber.Config{
		AppName:      "miEstudio API",
		ServerHeader: "Fiber",
		BodyLimit:    50 * 1024 * 1024, // 50MB para subida de PDFs de estudio
	})

	// 4. Configurar Middlewares Globales (CORS, Logger, Recover)
	common.SetupMiddlewares(app, cfg)

	// Agrupador base /api
	api := app.Group("/api")

	// Health Check (Público)
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"service": "miEstudio Backend",
			"db":      "connected",
		})
	})

	// 5. Configurar Middleware de Autenticación Estricto (401 si no hay token válido)
	authMiddleware := auth.AuthMiddleware(cfg.JWTSecret)

	// 6. Instanciar e inyectar Vertical Slices

	// Feature: Autenticación & Usuarios (Login, Register y Refresh públicos en api, /me protegido)
	authRepo := auth.NewRepository(database)
	carrerasRepo := carreras.NewRepository(database)
	carreraAdapter := carreras.NewAuthCarreraAdapter(carrerasRepo)
	authService := auth.NewService(authRepo, carreraAdapter, cfg.JWTSecret)
	authHandler := auth.NewHandler(authService)
	authHandler.RegisterRoutes(api, authMiddleware)

	// Feature: Carreras (Protegido con authMiddleware)
	carrerasService := carreras.NewService(carrerasRepo)
	carrerasHandler := carreras.NewHandler(carrerasService)
	carrerasHandler.RegisterRoutes(api, authMiddleware)

	// Feature: Materias (Protegido con authMiddleware)
	subjectsRepo := subjects.NewRepository(database)
	subjectsService := subjects.NewService(subjectsRepo)
	subjectsHandler := subjects.NewHandler(subjectsService)
	subjectsHandler.RegisterRoutes(api, authMiddleware)

	// Feature: Evaluaciones (Protegido con authMiddleware)
	evalRepo := evaluaciones.NewRepository(database)
	evalService := evaluaciones.NewService(evalRepo)
	evalHandler := evaluaciones.NewHandler(evalService)
	evalHandler.RegisterRoutes(api, authMiddleware)

	// Feature: Apuntes (Protegido con authMiddleware)
	notesRepo := notes.NewRepository(database)
	notesService := notes.NewService(notesRepo)
	notesHandler := notes.NewHandler(notesService)
	notesHandler.RegisterRoutes(api, authMiddleware)

	// Feature: Calendario (Protegido con authMiddleware)
	calendarRepo := calendar.NewRepository(database)
	calendarService := calendar.NewService(calendarRepo)
	calendarHandler := calendar.NewHandler(calendarService)
	calendarHandler.RegisterRoutes(api, authMiddleware)

	// Feature: Materiales & PDFs (Protegido con authMiddleware)
	materialsRepo := materials.NewRepository(database)
	materialsService := materials.NewService(materialsRepo, storageService)
	materialsHandler := materials.NewHandler(materialsService)
	materialsHandler.RegisterRoutes(api, authMiddleware)

	// Feature: Perfil (Protegido con authMiddleware)
	profileRepo := profile.NewRepository(database)
	profileService := profile.NewService(profileRepo)
	profileHandler := profile.NewHandler(profileService)
	profileHandler.RegisterRoutes(api, authMiddleware)

	// Feature: Horarios de Cursada (Protegido con authMiddleware)
	schedulesRepo := schedules.NewRepository(database)
	schedulesService := schedules.NewService(schedulesRepo)
	schedulesHandler := schedules.NewHandler(schedulesService)
	schedulesHandler.RegisterRoutes(api, authMiddleware)

	// Feature: Inteligencia Asistida & Estudio (Gemini AI - Protegido con authMiddleware)
	if cfg.GeminiAPIKey == "" {
		log.Println("⚠️  GEMINI_API_KEY no detectada en .env. Las funciones de IA responderán con error.")
	} else {
		log.Printf("🤖 Gemini AI configurado y listo (Modelo primario: %s con fallback automático).", cfg.GeminiModel)
	}
	geminiClient := ai.NewGeminiClient(cfg.GeminiAPIKey, cfg.GeminiModel)
	aiService := ai.NewService(geminiClient, materialsRepo, storageService)
	aiHandler := ai.NewHandler(aiService)
	aiHandler.RegisterRoutes(api, authMiddleware)

	// 7. Iniciar Servidor
	listenAddr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("🚀 miEstudio API ejecutándose en http://localhost%s/api", listenAddr)
	if err := app.Listen(listenAddr); err != nil {
		log.Fatalf("Error al escuchar en %s: %v", listenAddr, err)
	}
}
