package profile

import (
	"time"

	"gorm.io/gorm"
)

type Perfil struct {
	ID                string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	Nombre            string         `gorm:"type:varchar(255);not null" json:"nombre"`
	Legajo            string         `gorm:"type:varchar(50);not null" json:"legajo"`
	Carrera           string         `gorm:"type:varchar(255);not null" json:"carrera"`
	SemestreActual    string         `gorm:"type:varchar(50);not null" json:"semestre_actual"`
	CicloActivo       string         `gorm:"type:varchar(50);default:'1C 2026'" json:"ciclo_activo"`
	PromedioGeneral   float64        `gorm:"default:0" json:"promedio_general"`
	DeltaPromedio     float64        `gorm:"default:0" json:"delta_promedio"`
	PuestoCohorte     int            `gorm:"default:1" json:"puesto_cohorte"`
	Percentil         int            `gorm:"default:95" json:"percentil"`
	MateriasAprobadas int            `gorm:"default:0" json:"materias_aprobadas"`
	MateriasTotales   int            `gorm:"default:36" json:"materias_totales"`
	CreditosAprobados int            `gorm:"default:0" json:"creditos_aprobados"`
	CreditosTotales   int            `gorm:"default:240" json:"creditos_totales"`
	PromedioHistorico string         `gorm:"type:text" json:"-"` // JSON string en DB
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`
}

type PromedioHistoricoItem struct {
	Cuatrimestre string  `json:"cuatrimestre"`
	Promedio     float64 `json:"promedio"`
}

type PerfilDTO struct {
	ID                string                  `json:"id"`
	Nombre            string                  `json:"nombre"`
	Legajo            string                  `json:"legajo"`
	Carrera           string                  `json:"carrera"`
	SemestreActual    string                  `json:"semestre_actual"`
	CicloActivo       string                  `json:"ciclo_activo"`
	PromedioGeneral   float64                 `json:"promedio_general"`
	DeltaPromedio     float64                 `json:"delta_promedio"`
	PuestoCohorte     int                     `json:"puesto_cohorte"`
	Percentil         int                     `json:"percentil"`
	MateriasAprobadas int                     `json:"materias_aprobadas"`
	MateriasTotales   int                     `json:"materias_totales"`
	CreditosAprobados int                     `json:"creditos_aprobados"`
	CreditosTotales   int                     `json:"creditos_totales"`
	PromedioHistorico []PromedioHistoricoItem `json:"promedio_historico"`
}

type UpdatePerfilDTO struct {
	Nombre            *string                  `json:"nombre"`
	Legajo            *string                  `json:"legajo"`
	Carrera           *string                  `json:"carrera"`
	SemestreActual    *string                  `json:"semestre_actual"`
	CicloActivo       *string                  `json:"ciclo_activo"`
	PromedioGeneral   *float64                 `json:"promedio_general"`
	DeltaPromedio     *float64                 `json:"delta_promedio"`
	PuestoCohorte     *int                     `json:"puesto_cohorte"`
	Percentil         *int                     `json:"percentil"`
	MateriasAprobadas *int                     `json:"materias_aprobadas"`
	MateriasTotales   *int                     `json:"materias_totales"`
	CreditosAprobados *int                     `json:"creditos_aprobados"`
	CreditosTotales   *int                     `json:"creditos_totales"`
	PromedioHistorico *[]PromedioHistoricoItem `json:"promedio_historico"`
}
