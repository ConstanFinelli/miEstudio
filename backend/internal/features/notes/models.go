package notes

import (
	"time"

	"gorm.io/gorm"
	"miestudio/backend/internal/features/subjects"
)

type Apunte struct {
	ID            string            `gorm:"primaryKey;type:varchar(36)" json:"id"`
	UsuarioID     string            `gorm:"type:varchar(36);index" json:"usuario_id"`
	MateriaID     string            `gorm:"type:varchar(36);not null;index" json:"materia_id"`
	Materia       *subjects.Materia `gorm:"foreignKey:MateriaID;references:ID;constraint:false" json:"materia,omitempty"`
	MateriaNombre string            `gorm:"-" json:"materia_nombre,omitempty"`
	Titulo        string            `gorm:"type:varchar(255);not null" json:"titulo"`
	Contenido     string            `gorm:"type:longtext" json:"contenido"`
	Carpeta       string            `gorm:"type:varchar(100);default:'General'" json:"carpeta"`
	Resumen       string            `gorm:"type:text" json:"resumen"`
	Etiquetas     string            `gorm:"type:text" json:"-"` // Almacenado como JSON string en DB
	Tags          []string          `gorm:"-" json:"etiquetas"` // Serializado hacia el frontend
	CreatedAt     time.Time         `json:"created_at"`
	UpdatedAt     time.Time         `json:"updated_at"`
	DeletedAt     gorm.DeletedAt    `gorm:"index" json:"-"`
}

type CreateApunteDTO struct {
	UsuarioID string   `json:"usuario_id"`
	MateriaID string   `json:"materia_id"`
	Titulo    string   `json:"titulo"`
	Contenido string   `json:"contenido"`
	Carpeta   string   `json:"carpeta"`
	Resumen   string   `json:"resumen"`
	Etiquetas []string `json:"etiquetas"`
}

type UpdateApunteDTO struct {
	Titulo    *string   `json:"titulo"`
	Contenido *string   `json:"contenido"`
	Carpeta   *string   `json:"carpeta"`
	Resumen   *string   `json:"resumen"`
	Etiquetas *[]string `json:"etiquetas"`
}
