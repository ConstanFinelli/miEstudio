package evaluaciones

import (
	"context"
	"math"
	"time"

	"gorm.io/gorm"
	"miestudio/backend/internal/features/subjects"
)

type Repository interface {
	GetByMateria(ctx context.Context, usuarioID string, materiaID string) ([]Evaluacion, error)
	GetProximas(ctx context.Context, usuarioID string, limit int) ([]Evaluacion, error)
	GetByID(ctx context.Context, id string) (*Evaluacion, error)
	Create(ctx context.Context, evaluacion *Evaluacion) error
	Update(ctx context.Context, evaluacion *Evaluacion) error
	Delete(ctx context.Context, id string) error
	RecalcularPromedioMateria(ctx context.Context, materiaID string) error
	SincronizarPromedios(ctx context.Context) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetByMateria(ctx context.Context, usuarioID string, materiaID string) ([]Evaluacion, error) {
	var evaluaciones []Evaluacion
	q := r.db.WithContext(ctx).Preload("Materia").Order("(fecha IS NULL) ASC, fecha ASC, created_at ASC")
	if usuarioID != "" {
		q = q.Where("usuario_id = ? OR usuario_id = '' OR usuario_id IS NULL", usuarioID)
	}
	if materiaID != "" {
		q = q.Where("materia_id = ?", materiaID)
	}
	if err := q.Find(&evaluaciones).Error; err != nil {
		return nil, err
	}
	return evaluaciones, nil
}

func (r *repository) GetProximas(ctx context.Context, usuarioID string, limit int) ([]Evaluacion, error) {
	var evaluaciones []Evaluacion
	now := time.Now()
	// Margen de 24 horas hacia atrás para evitar que diferencias de zona horaria
	// (servidor UTC vs cliente UTC-3) filtren evaluaciones del día actual.
	cutoff := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location()).Add(-24 * time.Hour)

	q := r.db.WithContext(ctx).Preload("Materia").
		Where("nota IS NULL AND fecha IS NOT NULL AND fecha >= ?", cutoff).
		Order("fecha asc")
	if usuarioID != "" {
		q = q.Where("usuario_id = ? OR usuario_id = '' OR usuario_id IS NULL", usuarioID)
	}
	if limit > 0 {
		q = q.Limit(limit)
	}
	if err := q.Find(&evaluaciones).Error; err != nil {
		return nil, err
	}
	return evaluaciones, nil
}

func (r *repository) GetByID(ctx context.Context, id string) (*Evaluacion, error) {
	var evaluacion Evaluacion
	if err := r.db.WithContext(ctx).Preload("Materia").First(&evaluacion, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &evaluacion, nil
}

func (r *repository) Create(ctx context.Context, evaluacion *Evaluacion) error {
	return r.db.WithContext(ctx).Create(evaluacion).Error
}

func (r *repository) Update(ctx context.Context, evaluacion *Evaluacion) error {
	return r.db.WithContext(ctx).Save(evaluacion).Error
}

func (r *repository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&Evaluacion{}, "id = ?", id).Error
}

func (r *repository) RecalcularPromedioMateria(ctx context.Context, materiaID string) error {
	if materiaID == "" {
		return nil
	}

	var materia subjects.Materia
	if err := r.db.WithContext(ctx).First(&materia, "id = ?", materiaID).Error; err != nil {
		return nil // Materia inexistente o eliminada
	}

	var evals []Evaluacion
	if err := r.db.WithContext(ctx).Where("materia_id = ? AND nota IS NOT NULL", materiaID).Find(&evals).Error; err != nil {
		return err
	}

	if len(evals) == 0 {
		// Si es cursando o regular y no tiene evaluaciones calificadas, el promedio es 0
		if materia.Estado == "CURSANDO" || materia.Estado == "REGULAR" {
			return r.db.WithContext(ctx).Model(&subjects.Materia{}).Where("id = ?", materiaID).Update("promedio", 0).Error
		}
		return nil
	}

	var totalWeighted float64
	var totalWeight float64
	var totalSimple float64
	var count float64

	for _, ev := range evals {
		if ev.Nota == nil {
			continue
		}
		peso := float64(ev.Peso)
		if peso <= 0 {
			peso = 1
		}
		totalWeighted += (*ev.Nota) * peso
		totalWeight += peso
		totalSimple += *ev.Nota
		count++
	}

	var nuevoPromedio float64
	if totalWeight > 0 {
		nuevoPromedio = totalWeighted / totalWeight
	} else if count > 0 {
		nuevoPromedio = totalSimple / count
	}

	nuevoPromedio = math.Round(nuevoPromedio*100) / 100

	return r.db.WithContext(ctx).Model(&subjects.Materia{}).Where("id = ?", materiaID).Update("promedio", nuevoPromedio).Error
}

func (r *repository) SincronizarPromedios(ctx context.Context) error {
	var materias []subjects.Materia
	if err := r.db.WithContext(ctx).Where("estado IN ('CURSANDO', 'REGULAR')").Find(&materias).Error; err != nil {
		return err
	}

	for _, m := range materias {
		_ = r.RecalcularPromedioMateria(ctx, m.ID)
	}
	return nil
}

