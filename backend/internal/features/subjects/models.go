package subjects

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

type ReglaPromocionDTO struct {
	PermitePromocion     bool    `json:"permite_promocion"`
	MinPromedio          float64 `json:"min_promedio"`
	MinParcial           float64 `json:"min_parcial"`
	PermiteRecuperatorio bool    `json:"permite_recuperatorio"`
	MinAsistencia        int     `json:"min_asistencia"`
	Descripcion          string  `json:"descripcion"`
}

type ReglaRegularidadDTO struct {
	MinNota              float64 `json:"min_nota"`
	MinAsistencia        int     `json:"min_asistencia"`
	PermiteRecuperatorio bool    `json:"permite_recuperatorio"`
	Descripcion          string  `json:"descripcion"`
}

type ReglasAcreditacionDTO struct {
	Promocion   ReglaPromocionDTO   `json:"promocion"`
	Regularidad ReglaRegularidadDTO `json:"regularidad"`
}

func DefaultReglasAcreditacion() ReglasAcreditacionDTO {
	return ReglasAcreditacionDTO{
		Promocion: ReglaPromocionDTO{
			PermitePromocion:     true,
			MinPromedio:          8.0,
			MinParcial:           7.0,
			PermiteRecuperatorio: false,
			MinAsistencia:        80,
			Descripcion:          "Promedio ≥ 8.0, parciales ≥ 7.0, sin recuperatorio y 80% de asistencia mínima.",
		},
		Regularidad: ReglaRegularidadDTO{
			MinNota:              4.0,
			MinAsistencia:        75,
			PermiteRecuperatorio: true,
			Descripcion:          "Todas las evaluaciones ≥ 4.0 (permite recuperatorio) y 75% de asistencia mínima.",
		},
	}
}

// Value implementa driver.Valuer para almacenar en MySQL como JSON string
func (r ReglasAcreditacionDTO) Value() (driver.Value, error) {
	return json.Marshal(r)
}

// Scan implementa sql.Scanner para deserializar desde MySQL
func (r *ReglasAcreditacionDTO) Scan(value interface{}) error {
	if value == nil {
		*r = DefaultReglasAcreditacion()
		return nil
	}
	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("tipo no soportado para ReglasAcreditacion")
	}
	if len(bytes) == 0 {
		*r = DefaultReglasAcreditacion()
		return nil
	}
	return json.Unmarshal(bytes, r)
}

type Materia struct {
	ID                 string                 `gorm:"primaryKey;type:varchar(36)" json:"id"`
	Codigo             string                 `gorm:"type:varchar(50)" json:"codigo"`
	Nombre             string                 `gorm:"type:varchar(255);not null" json:"nombre"`
	Anio               int                    `gorm:"not null" json:"anio"`
	Cuatrimestre       string                 `gorm:"type:varchar(20);not null" json:"cuatrimestre"`
	Estado             string                 `gorm:"type:varchar(30);not null;default:'CURSANDO'" json:"estado"`
	Color              string                 `gorm:"type:varchar(30);default:'#3b82f6'" json:"color"`
	Comision           string                 `gorm:"type:varchar(50)" json:"comision"`
	Modalidad          string                 `gorm:"type:varchar(50);default:'Presencial'" json:"modalidad"`
	Promedio           float64                `gorm:"default:0" json:"promedio"`
	ProfesorTitular    string                 `gorm:"type:varchar(255);default:''" json:"profesor_titular"`
	ProfesorJTP        string                 `gorm:"type:varchar(255);default:''" json:"profesor_jtp"`
	ReglasAcreditacion *ReglasAcreditacionDTO `gorm:"type:text" json:"reglas_acreditacion"`
	CreatedAt          time.Time              `json:"created_at"`
	UpdatedAt          time.Time              `json:"updated_at"`
	DeletedAt          gorm.DeletedAt         `gorm:"index" json:"-"`
}

type CreateMateriaDTO struct {
	Codigo             string                 `json:"codigo"`
	Nombre             string                 `json:"nombre"`
	Anio               int                    `json:"anio"`
	Cuatrimestre       string                 `json:"cuatrimestre"`
	Estado             string                 `json:"estado"`
	Color              string                 `json:"color"`
	Comision           string                 `json:"comision"`
	Modalidad          string                 `json:"modalidad"`
	Promedio           float64                `json:"promedio"`
	ProfesorTitular    string                 `json:"profesor_titular"`
	ProfesorJTP        string                 `json:"profesor_jtp"`
	ReglasAcreditacion *ReglasAcreditacionDTO `json:"reglas_acreditacion"`
}

type UpdateMateriaDTO struct {
	Codigo             *string                `json:"codigo"`
	Nombre             *string                `json:"nombre"`
	Anio               *int                   `json:"anio"`
	Cuatrimestre       *string                `json:"cuatrimestre"`
	Estado             *string                `json:"estado"`
	Color              *string                `json:"color"`
	Comision           *string                `json:"comision"`
	Modalidad          *string                `json:"modalidad"`
	Promedio           *float64               `json:"promedio"`
	ProfesorTitular    *string                `json:"profesor_titular"`
	ProfesorJTP        *string                `json:"profesor_jtp"`
	ReglasAcreditacion *ReglasAcreditacionDTO `json:"reglas_acreditacion"`
}
