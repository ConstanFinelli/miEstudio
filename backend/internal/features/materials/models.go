package materials

import (
	"time"

	"gorm.io/gorm"
)

type Material struct {
	ID                    string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	UsuarioID             string         `gorm:"type:varchar(36);index" json:"usuario_id"`
	MateriaID             string         `gorm:"type:varchar(36);not null;index" json:"materia_id"`
	Titulo                string         `gorm:"type:varchar(255);not null" json:"titulo"`
	Categoria             string         `gorm:"type:varchar(50);not null;default:'TEORIA'" json:"categoria"`
	Unidad                string         `gorm:"type:varchar(100);default:''" json:"unidad"`
	ArchivoNombreOriginal string         `gorm:"type:varchar(255);not null" json:"archivo_nombre_original"`
	ArchivoKey            string         `gorm:"type:varchar(255);not null" json:"archivo_path"`
	MimeType              string         `gorm:"type:varchar(100);default:'application/pdf'" json:"mime_type"`
	TamanioBytes          int64          `gorm:"not null" json:"tamanio_bytes"`
	CantPaginas           *int           `json:"cant_paginas"`
	CreatedAt             time.Time      `json:"created_at"`
	UpdatedAt             time.Time      `json:"updated_at"`
	DeletedAt             gorm.DeletedAt `gorm:"index" json:"-"`
}

type UpdateMaterialDTO struct {
	Titulo    *string `json:"titulo"`
	Categoria *string `json:"categoria"`
	Unidad    *string `json:"unidad"`
}
