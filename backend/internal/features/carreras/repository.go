package carreras

import (
	"errors"

	"gorm.io/gorm"
)

type Repository interface {
	Create(carrera *Carrera) error
	FindByID(id string, usuarioID string) (*Carrera, error)
	FindAllByUsuarioID(usuarioID string) ([]Carrera, error)
	FindActiveByUsuarioID(usuarioID string) (*Carrera, error)
	Update(carrera *Carrera) error
	SetActive(id string, usuarioID string) error
	Delete(id string, usuarioID string) error
	CreateAprobacion(aprob *AprobacionHistorica) error
	FindAprobacionesByCarrera(carreraID string, usuarioID string) ([]AprobacionHistorica, error)
	DeleteAprobacion(id string, usuarioID string) error
	RecalcularMetricasCarrera(carreraID string) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(carrera *Carrera) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if carrera.IsActiva {
			// Desactivar otras carreras del usuario
			if err := tx.Model(&Carrera{}).Where("usuario_id = ?", carrera.UsuarioID).Update("is_activa", false).Error; err != nil {
				return err
			}
		}
		return tx.Create(carrera).Error
	})
}

func (r *repository) FindByID(id string, usuarioID string) (*Carrera, error) {
	var carrera Carrera
	err := r.db.Where("id = ? AND usuario_id = ?", id, usuarioID).First(&carrera).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &carrera, nil
}

func (r *repository) FindAllByUsuarioID(usuarioID string) ([]Carrera, error) {
	var list []Carrera
	err := r.db.Where("usuario_id = ?", usuarioID).Order("is_activa DESC, created_at ASC").Find(&list).Error
	return list, err
}

func (r *repository) FindActiveByUsuarioID(usuarioID string) (*Carrera, error) {
	var carrera Carrera
	err := r.db.Where("usuario_id = ? AND is_activa = ?", usuarioID, true).First(&carrera).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Si no tiene activa marcada, retornar la primera
			err = r.db.Where("usuario_id = ?", usuarioID).Order("created_at ASC").First(&carrera).Error
			if err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					return nil, nil
				}
				return nil, err
			}
			return &carrera, nil
		}
		return nil, err
	}
	return &carrera, nil
}

func (r *repository) Update(carrera *Carrera) error {
	return r.db.Save(carrera).Error
}

func (r *repository) SetActive(id string, usuarioID string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&Carrera{}).Where("usuario_id = ?", usuarioID).Update("is_activa", false).Error; err != nil {
			return err
		}
		return tx.Model(&Carrera{}).Where("id = ? AND usuario_id = ?", id, usuarioID).Update("is_activa", true).Error
	})
}

func (r *repository) Delete(id string, usuarioID string) error {
	return r.db.Where("id = ? AND usuario_id = ?", id, usuarioID).Delete(&Carrera{}).Error
}

func (r *repository) CreateAprobacion(aprob *AprobacionHistorica) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(aprob).Error; err != nil {
			return err
		}
		return r.recalcularMetricasTx(tx, aprob.CarreraID)
	})
}

func (r *repository) FindAprobacionesByCarrera(carreraID string, usuarioID string) ([]AprobacionHistorica, error) {
	var list []AprobacionHistorica
	err := r.db.Where("carrera_id = ? AND usuario_id = ?", carreraID, usuarioID).Order("fecha_aprobacion DESC").Find(&list).Error
	return list, err
}

func (r *repository) DeleteAprobacion(id string, usuarioID string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var aprob AprobacionHistorica
		if err := tx.Where("id = ? AND usuario_id = ?", id, usuarioID).First(&aprob).Error; err != nil {
			return err
		}
		if err := tx.Delete(&aprob).Error; err != nil {
			return err
		}
		return r.recalcularMetricasTx(tx, aprob.CarreraID)
	})
}

func (r *repository) RecalcularMetricasCarrera(carreraID string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		return r.recalcularMetricasTx(tx, carreraID)
	})
}

func (r *repository) recalcularMetricasTx(tx *gorm.DB, carreraID string) error {
	var count int64
	var sum float64

	// Calcular promedio de aprobaciones históricas
	type Result struct {
		Count int64
		Avg   float64
	}
	var res Result
	err := tx.Model(&AprobacionHistorica{}).
		Select("COUNT(id) as count, COALESCE(AVG(nota_final), 0) as avg").
		Where("carrera_id = ?", carreraID).
		Scan(&res).Error

	if err != nil {
		return err
	}

	count = res.Count
	sum = res.Avg

	return tx.Model(&Carrera{}).Where("id = ?", carreraID).Updates(map[string]interface{}{
		"materias_aprobadas": count,
		"promedio_general":   sum,
	}).Error
}
