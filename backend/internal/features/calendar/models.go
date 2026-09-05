package calendar

import (
	"time"

	"gorm.io/gorm"
)

type EventoCalendario struct {
	ID               string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	MateriaID        *string        `gorm:"type:varchar(36);index" json:"materia_id"`
	Titulo           string         `gorm:"type:varchar(255);not null" json:"titulo"`
	FechaInicio      time.Time      `gorm:"not null" json:"fecha_inicio"`
	FechaFin         time.Time      `gorm:"not null" json:"fecha_fin"`
	Tipo             string         `gorm:"type:varchar(30);default:'ESTUDIO'" json:"tipo"`
	Aula             string         `gorm:"type:varchar(100)" json:"aula"`
	Modalidad        string         `gorm:"type:varchar(50);default:'Presencial'" json:"modalidad"`
	ImpactoAcademico string         `gorm:"type:varchar(255)" json:"impacto_academico"`
	EsCritico        bool           `gorm:"default:false" json:"es_critico"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}

type CreateEventoDTO struct {
	MateriaID        *string `json:"materia_id"`
	Titulo           string  `json:"titulo"`
	FechaInicio      string  `json:"fecha_inicio"`
	FechaFin         string  `json:"fecha_fin"`
	Tipo             string  `json:"tipo"`
	Aula             string  `json:"aula"`
	Modalidad        string  `json:"modalidad"`
	ImpactoAcademico string  `json:"impacto_academico"`
	EsCritico        bool    `json:"es_critico"`
}
