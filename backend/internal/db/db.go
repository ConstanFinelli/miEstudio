package db

import (
	"fmt"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"miestudio/backend/internal/config"
	"miestudio/backend/internal/features/auth"
	"miestudio/backend/internal/features/calendar"
	"miestudio/backend/internal/features/carreras"
	"miestudio/backend/internal/features/evaluaciones"
	"miestudio/backend/internal/features/materials"
	"miestudio/backend/internal/features/notes"
	"miestudio/backend/internal/features/profile"
	"miestudio/backend/internal/features/schedules"
	"miestudio/backend/internal/features/subjects"
)

func Init(cfg *config.Config) (*gorm.DB, error) {
	dsn := cfg.GetMySQLDSN()
	log.Printf("[DB] Conectando a MySQL en %s:%s/%s...", cfg.DBHost, cfg.DBPort, cfg.DBName)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		return nil, fmt.Errorf("falló conexión a MySQL: %w", err)
	}

	log.Println("[DB] Conexión establecida. Ejecutando migraciones automáticas...")
	err = db.AutoMigrate(
		&auth.Usuario{},
		&auth.RefreshToken{},
		&carreras.Carrera{},
		&carreras.AprobacionHistorica{},
		&subjects.Materia{},
		&evaluaciones.Evaluacion{},
		&notes.Apunte{},
		&calendar.EventoCalendario{},
		&materials.Material{},
		&profile.Perfil{},
		&schedules.HorarioCursada{},
	)
	if err != nil {
		return nil, fmt.Errorf("error durante migraciones: %w", err)
	}

	log.Println("[DB] Migraciones ejecutadas con éxito.")
	return db, nil
}
