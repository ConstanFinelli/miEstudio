package carreras

import (
	"time"

	"gorm.io/gorm"
)

type Carrera struct {
	ID                string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	UsuarioID         string         `gorm:"type:varchar(36);not null;index" json:"usuario_id"`
	Nombre            string         `gorm:"type:varchar(255);not null" json:"nombre"`
	FacultadSede      string         `gorm:"type:varchar(255);not null" json:"facultad_sede"`
	Legajo            string         `gorm:"type:varchar(50);not null" json:"legajo"`
	SemestreActual    string         `gorm:"type:varchar(50);default:'1° Año - 1C'" json:"semestre_actual"`
	CicloActivo       string         `gorm:"type:varchar(50);default:'1C 2026'" json:"ciclo_activo"`
	DuracionAnios     int            `gorm:"default:5" json:"duracion_anios"`
	TotalMateriasPlan int            `gorm:"default:0" json:"total_materias_plan"`
	IsActiva          bool           `gorm:"default:true;index" json:"is_activa"`
	PromedioGeneral   float64        `gorm:"default:0" json:"promedio_general"`
	MateriasAprobadas int            `gorm:"default:0" json:"materias_aprobadas"`
	FechaIngreso      *time.Time     `json:"fecha_ingreso"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Carrera) TableName() string {
	return "carreras"
}

type AprobacionHistorica struct {
	ID              string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	UsuarioID       string         `gorm:"type:varchar(36);not null;index" json:"usuario_id"`
	CarreraID       string         `gorm:"type:varchar(36);not null;index" json:"carrera_id"`
	MateriaID       string         `gorm:"type:varchar(36);not null;index" json:"materia_id"`
	NotaFinal       float64        `gorm:"type:decimal(4,2);not null" json:"nota_final"`
	FechaAprobacion time.Time      `gorm:"not null" json:"fecha_aprobacion"`
	TipoAprobacion  string         `gorm:"type:varchar(50);default:'FINAL'" json:"tipo_aprobacion"` // FINAL, PROMOCION, EQUIVALENCIA
	LibroActa       string         `gorm:"type:varchar(50);default:''" json:"libro_acta"`
	FolioActa       string         `gorm:"type:varchar(50);default:''" json:"folio_acta"`
	Observaciones   string         `gorm:"type:text" json:"observaciones"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

func (AprobacionHistorica) TableName() string {
	return "aprobaciones_historicas"
}

type CreateCarreraDTO struct {
	Nombre            string  `json:"nombre"`
	FacultadSede      string  `json:"facultad_sede"`
	Legajo            string  `json:"legajo"`
	SemestreActual    string  `json:"semestre_actual"`
	CicloActivo       string  `json:"ciclo_activo"`
	DuracionAnios     int     `json:"duracion_anios"`
	TotalMateriasPlan int     `json:"total_materias_plan"`
	FechaIngreso      *string `json:"fecha_ingreso"`
}

type UpdateCarreraDTO struct {
	Nombre            *string `json:"nombre"`
	FacultadSede      *string `json:"facultad_sede"`
	Legajo            *string `json:"legajo"`
	SemestreActual    *string `json:"semestre_actual"`
	CicloActivo       *string `json:"ciclo_activo"`
	DuracionAnios     *int    `json:"duracion_anios"`
	TotalMateriasPlan *int    `json:"total_materias_plan"`
	IsActiva          *bool   `json:"is_activa"`
}

type CreateAprobacionHistoricaDTO struct {
	CarreraID       string  `json:"carrera_id"`
	MateriaID       string  `json:"materia_id"`
	NotaFinal       float64 `json:"nota_final"`
	FechaAprobacion string  `json:"fecha_aprobacion"` // YYYY-MM-DD
	TipoAprobacion  string  `json:"tipo_aprobacion"`  // FINAL, PROMOCION, EQUIVALENCIA
	LibroActa       string  `json:"libro_acta"`
	FolioActa       string  `json:"folio_acta"`
	Observaciones   string  `json:"observaciones"`
}
