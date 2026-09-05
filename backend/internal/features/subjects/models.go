package subjects

import (
	"time"

	"gorm.io/gorm"
)

type Materia struct {
	ID           string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	Codigo       string         `gorm:"type:varchar(50)" json:"codigo"`
	Nombre       string         `gorm:"type:varchar(255);not null" json:"nombre"`
	Anio         int            `gorm:"not null" json:"anio"`
	Cuatrimestre string         `gorm:"type:varchar(20);not null" json:"cuatrimestre"`
	Estado       string         `gorm:"type:varchar(30);not null;default:'CURSANDO'" json:"estado"`
	Color        string         `gorm:"type:varchar(30);default:'#3b82f6'" json:"color"`
	Creditos     int            `gorm:"default:4" json:"creditos"`
	Comision     string         `gorm:"type:varchar(50)" json:"comision"`
	Modalidad    string         `gorm:"type:varchar(50);default:'Presencial'" json:"modalidad"`
	Promedio     float64        `gorm:"default:0" json:"promedio"`
	Asistencia   int            `gorm:"default:100" json:"asistencia"`
	Ponderado    int            `gorm:"default:0" json:"ponderado"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

type CreateMateriaDTO struct {
	Codigo       string  `json:"codigo"`
	Nombre       string  `json:"nombre"`
	Anio         int     `json:"anio"`
	Cuatrimestre string  `json:"cuatrimestre"`
	Estado       string  `json:"estado"`
	Color        string  `json:"color"`
	Creditos     int     `json:"creditos"`
	Comision     string  `json:"comision"`
	Modalidad    string  `json:"modalidad"`
	Promedio     float64 `json:"promedio"`
	Asistencia   int     `json:"asistencia"`
	Ponderado    int     `json:"ponderado"`
}

type UpdateMateriaDTO struct {
	Codigo       *string  `json:"codigo"`
	Nombre       *string  `json:"nombre"`
	Anio         *int     `json:"anio"`
	Cuatrimestre *string  `json:"cuatrimestre"`
	Estado       *string  `json:"estado"`
	Color        *string  `json:"color"`
	Creditos     *int     `json:"creditos"`
	Comision     *string  `json:"comision"`
	Modalidad    *string  `json:"modalidad"`
	Promedio     *float64 `json:"promedio"`
	Asistencia   *int     `json:"asistencia"`
	Ponderado    *int     `json:"ponderado"`
}
