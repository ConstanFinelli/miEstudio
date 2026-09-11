package evaluaciones

import (
	"encoding/json"
	"time"

	"gorm.io/gorm"
	"miestudio/backend/internal/features/subjects"
)

type Evaluacion struct {
	ID            string            `gorm:"primaryKey;type:varchar(36)" json:"id"`
	UsuarioID     string            `gorm:"type:varchar(36);index" json:"usuario_id"`
	MateriaID     string            `gorm:"type:varchar(36);not null;index" json:"materia_id"`
	Materia       *subjects.Materia `gorm:"foreignKey:MateriaID;references:ID;constraint:false" json:"materia,omitempty"`
	Titulo        string            `gorm:"type:varchar(255);not null" json:"titulo"`
	Tipo          string            `gorm:"type:varchar(30);not null;default:'PARCIAL'" json:"tipo"`
	Fecha         time.Time         `gorm:"not null" json:"fecha"`
	Horario       string            `gorm:"type:varchar(20);default:'09:00'" json:"horario"`
	Nota          *float64          `json:"nota"`
	Peso          int               `gorm:"default:100" json:"peso"`
	EsAprobatorio bool              `gorm:"default:true" json:"es_aprobatorio"`
	Aula          string            `gorm:"type:varchar(100)" json:"aula"`
	Modalidad     string            `gorm:"type:varchar(50);default:'Presencial'" json:"modalidad"`
	Temario       string            `gorm:"type:text" json:"temario"` // JSON string
	CreatedAt     time.Time         `json:"created_at"`
	UpdatedAt     time.Time         `json:"updated_at"`
	DeletedAt     gorm.DeletedAt    `gorm:"index" json:"-"`
}

type EvaluacionResponseDTO struct {
	ID            string    `json:"id"`
	UsuarioID     string    `json:"usuario_id"`
	MateriaID     string    `json:"materia_id"`
	MateriaNombre string    `json:"materia_nombre,omitempty"`
	MateriaCodigo string    `json:"materia_codigo,omitempty"`
	Titulo        string    `json:"titulo"`
	Tipo          string    `json:"tipo"`
	Fecha         time.Time `json:"fecha"`
	Horario       string    `json:"horario"`
	Nota          *float64  `json:"nota"`
	Peso          int       `json:"peso"`
	EsAprobatorio bool      `json:"es_aprobatorio"`
	Aula          string    `json:"aula"`
	Modalidad     string    `json:"modalidad"`
	Temario       []string  `json:"temario"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func ToResponseDTO(e Evaluacion) EvaluacionResponseDTO {
	var temario []string
	if e.Temario != "" {
		_ = json.Unmarshal([]byte(e.Temario), &temario)
	}
	if temario == nil {
		temario = []string{}
	}
	materiaNombre := ""
	materiaCodigo := ""
	if e.Materia != nil {
		materiaNombre = e.Materia.Nombre
		materiaCodigo = e.Materia.Codigo
	}
	return EvaluacionResponseDTO{
		ID:            e.ID,
		UsuarioID:     e.UsuarioID,
		MateriaID:     e.MateriaID,
		MateriaNombre: materiaNombre,
		MateriaCodigo: materiaCodigo,
		Titulo:        e.Titulo,
		Tipo:          e.Tipo,
		Fecha:         e.Fecha,
		Horario:       e.Horario,
		Nota:          e.Nota,
		Peso:          e.Peso,
		EsAprobatorio: e.EsAprobatorio,
		Aula:          e.Aula,
		Modalidad:     e.Modalidad,
		Temario:       temario,
		CreatedAt:     e.CreatedAt,
		UpdatedAt:     e.UpdatedAt,
	}
}

func ToResponseDTOList(evals []Evaluacion) []EvaluacionResponseDTO {
	res := make([]EvaluacionResponseDTO, len(evals))
	for i, e := range evals {
		res[i] = ToResponseDTO(e)
	}
	return res
}

type CreateEvaluacionDTO struct {
	UsuarioID     string   `json:"usuario_id"`
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

type UpdateEvaluacionDTO struct {
	UsuarioID     string    `json:"usuario_id"`
	MateriaID     *string   `json:"materia_id"`
	Titulo        *string   `json:"titulo"`
	Tipo          *string   `json:"tipo"`
	Fecha         *string   `json:"fecha"`
	Horario       *string   `json:"horario"`
	Nota          *float64  `json:"nota"`
	ClearNota     bool      `json:"clear_nota"`
	Peso          *int      `json:"peso"`
	EsAprobatorio *bool     `json:"es_aprobatorio"`
	Aula          *string   `json:"aula"`
	Modalidad     *string   `json:"modalidad"`
	Temario       *[]string `json:"temario"`
}
