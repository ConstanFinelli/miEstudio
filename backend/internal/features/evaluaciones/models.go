package evaluaciones

import (
	"time"

	"gorm.io/gorm"
)

type Evaluacion struct {
	ID            string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	MateriaID     string         `gorm:"type:varchar(36);not null;index" json:"materia_id"`
	Titulo        string         `gorm:"type:varchar(255);not null" json:"titulo"`
	Tipo          string         `gorm:"type:varchar(30);not null;default:'PARCIAL'" json:"tipo"`
	Fecha         time.Time      `gorm:"not null" json:"fecha"`
	Horario       string         `gorm:"type:varchar(20);default:'09:00'" json:"horario"`
	Nota          *float64       `json:"nota"`
	Peso          int            `gorm:"default:25" json:"peso"`
	EsAprobatorio bool           `gorm:"default:true" json:"es_aprobatorio"`
	Aula          string         `gorm:"type:varchar(100)" json:"aula"`
	Modalidad     string         `gorm:"type:varchar(50);default:'Presencial'" json:"modalidad"`
	Temario       string         `gorm:"type:text" json:"temario"` // JSON string
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

type CreateEvaluacionDTO struct {
	MateriaID     string   `json:"materia_id"`
	Titulo        string   `json:"titulo"`
	Tipo          string   `json:"tipo"`
	Fecha         string   `json:"fecha"` // ISO or YYYY-MM-DD
	Horario       string   `json:"horario"`
	Nota          *float64 `json:"nota"`
	Peso          int      `json:"peso"`
	EsAprobatorio *bool    `json:"es_aprobatorio"`
	Aula          string   `json:"aula"`
	Modalidad     string   `json:"modalidad"`
	Temario       []string `json:"temario"`
}

type UpdateNotaDTO struct {
	Nota float64 `json:"nota"`
}
