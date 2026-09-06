package schedules

import (
	"time"

	"gorm.io/gorm"
	"miestudio/backend/internal/features/subjects"
)

type HorarioCursada struct {
	ID           string           `gorm:"primaryKey;type:varchar(36)" json:"id"`
	MateriaID    string           `gorm:"type:varchar(36);not null;index" json:"materia_id"`
	Materia      *subjects.Materia `gorm:"foreignKey:MateriaID" json:"materia,omitempty"`
	DiaSemana    string           `gorm:"type:varchar(20);not null" json:"dia_semana"` // LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO
	HoraInicio   string           `gorm:"type:varchar(5);not null" json:"hora_inicio"` // HH:mm
	HoraFin      string           `gorm:"type:varchar(5);not null" json:"hora_fin"`    // HH:mm
	FacultadSede string           `gorm:"type:varchar(150);default:''" json:"facultad_sede"`
	Aula         string           `gorm:"type:varchar(100);default:''" json:"aula"`
	TipoClase    string           `gorm:"type:varchar(50);default:'TEORIA'" json:"tipo_clase"` // TEORIA, PRACTICA, LABORATORIO, TALLER
	Modalidad    string           `gorm:"type:varchar(50);default:'Presencial'" json:"modalidad"` // Presencial, Virtual, Híbrida
	CreatedAt    time.Time        `json:"created_at"`
	UpdatedAt    time.Time        `json:"updated_at"`
	DeletedAt    gorm.DeletedAt   `gorm:"index" json:"-"`
}

func (HorarioCursada) TableName() string {
	return "horarios_cursada"
}

type CreateHorarioDTO struct {
	MateriaID    string `json:"materia_id"`
	DiaSemana    string `json:"dia_semana"`
	HoraInicio   string `json:"hora_inicio"`
	HoraFin      string `json:"hora_fin"`
	FacultadSede string `json:"facultad_sede"`
	Aula         string `json:"aula"`
	TipoClase    string `json:"tipo_clase"`
	Modalidad    string `json:"modalidad"`
}

type UpdateHorarioDTO struct {
	MateriaID    *string `json:"materia_id"`
	DiaSemana    *string `json:"dia_semana"`
	HoraInicio   *string `json:"hora_inicio"`
	HoraFin      *string `json:"hora_fin"`
	FacultadSede *string `json:"facultad_sede"`
	Aula         *string `json:"aula"`
	TipoClase    *string `json:"tipo_clase"`
	Modalidad    *string `json:"modalidad"`
}
