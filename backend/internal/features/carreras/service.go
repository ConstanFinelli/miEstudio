package carreras

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type Service interface {
	CreateCarrera(usuarioID string, dto CreateCarreraDTO) (*Carrera, error)
	GetCarreras(usuarioID string) ([]Carrera, error)
	GetCarrera(id string, usuarioID string) (*Carrera, error)
	GetActiveCarrera(usuarioID string) (*Carrera, error)
	UpdateCarrera(id string, usuarioID string, dto UpdateCarreraDTO) (*Carrera, error)
	SetActiveCarrera(id string, usuarioID string) error
	DeleteCarrera(id string, usuarioID string) error
	RegistrarAprobacion(usuarioID string, dto CreateAprobacionHistoricaDTO) (*AprobacionHistorica, error)
	GetAprobaciones(carreraID string, usuarioID string) ([]AprobacionHistorica, error)
	DeleteAprobacion(id string, usuarioID string) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) CreateCarrera(usuarioID string, dto CreateCarreraDTO) (*Carrera, error) {
	if dto.Nombre == "" {
		return nil, errors.New("el nombre de la carrera es obligatorio")
	}

	duracion := dto.DuracionAnios
	if duracion <= 0 {
		duracion = 5
	}
	totalMaterias := dto.TotalMateriasPlan
	if totalMaterias <= 0 {
		totalMaterias = 40
	}
	semestre := dto.SemestreActual
	if semestre == "" {
		semestre = "1° Año - 1C"
	}
	ciclo := dto.CicloActivo
	if ciclo == "" {
		ciclo = "1C 2026"
	}

	var fechaIngreso *time.Time
	if dto.FechaIngreso != nil && *dto.FechaIngreso != "" {
		parsed, err := time.Parse("2006-01-02", *dto.FechaIngreso)
		if err == nil {
			fechaIngreso = &parsed
		}
	}

	// Verificar si es la primera carrera del usuario para activarla automáticamente
	carrerasExistentes, _ := s.repo.FindAllByUsuarioID(usuarioID)
	isActiva := len(carrerasExistentes) == 0

	carrera := &Carrera{
		ID:                uuid.New().String(),
		UsuarioID:         usuarioID,
		Nombre:            dto.Nombre,
		FacultadSede:      dto.FacultadSede,
		Legajo:            dto.Legajo,
		SemestreActual:    semestre,
		CicloActivo:       ciclo,
		DuracionAnios:     duracion,
		TotalMateriasPlan: totalMaterias,
		IsActiva:          isActiva,
		FechaIngreso:      fechaIngreso,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}

	if err := s.repo.Create(carrera); err != nil {
		return nil, err
	}

	return carrera, nil
}

func (s *service) GetCarreras(usuarioID string) ([]Carrera, error) {
	return s.repo.FindAllByUsuarioID(usuarioID)
}

func (s *service) GetCarrera(id string, usuarioID string) (*Carrera, error) {
	carrera, err := s.repo.FindByID(id, usuarioID)
	if err != nil {
		return nil, err
	}
	if carrera == nil {
		return nil, errors.New("carrera no encontrada")
	}
	return carrera, nil
}

func (s *service) GetActiveCarrera(usuarioID string) (*Carrera, error) {
	return s.repo.FindActiveByUsuarioID(usuarioID)
}

func (s *service) UpdateCarrera(id string, usuarioID string, dto UpdateCarreraDTO) (*Carrera, error) {
	carrera, err := s.GetCarrera(id, usuarioID)
	if err != nil {
		return nil, err
	}

	if dto.Nombre != nil {
		carrera.Nombre = *dto.Nombre
	}
	if dto.FacultadSede != nil {
		carrera.FacultadSede = *dto.FacultadSede
	}
	if dto.Legajo != nil {
		carrera.Legajo = *dto.Legajo
	}
	if dto.SemestreActual != nil {
		carrera.SemestreActual = *dto.SemestreActual
	}
	if dto.CicloActivo != nil {
		carrera.CicloActivo = *dto.CicloActivo
	}
	if dto.DuracionAnios != nil {
		carrera.DuracionAnios = *dto.DuracionAnios
	}
	if dto.TotalMateriasPlan != nil {
		carrera.TotalMateriasPlan = *dto.TotalMateriasPlan
	}
	if dto.IsActiva != nil && *dto.IsActiva {
		if err := s.repo.SetActive(id, usuarioID); err != nil {
			return nil, err
		}
		carrera.IsActiva = true
	}

	carrera.UpdatedAt = time.Now()
	if err := s.repo.Update(carrera); err != nil {
		return nil, err
	}

	return carrera, nil
}

func (s *service) SetActiveCarrera(id string, usuarioID string) error {
	return s.repo.SetActive(id, usuarioID)
}

func (s *service) DeleteCarrera(id string, usuarioID string) error {
	return s.repo.Delete(id, usuarioID)
}

func (s *service) RegistrarAprobacion(usuarioID string, dto CreateAprobacionHistoricaDTO) (*AprobacionHistorica, error) {
	if dto.MateriaID == "" || dto.CarreraID == "" {
		return nil, errors.New("materia_id y carrera_id son obligatorios")
	}
	if dto.NotaFinal < 1 || dto.NotaFinal > 10 {
		return nil, errors.New("la nota final debe estar comprendida entre 1 y 10")
	}

	fecha := time.Now()
	if dto.FechaAprobacion != "" {
		if parsed, err := time.Parse("2006-01-02", dto.FechaAprobacion); err == nil {
			fecha = parsed
		}
	}

	tipo := dto.TipoAprobacion
	if tipo == "" {
		tipo = "FINAL"
	}

	aprob := &AprobacionHistorica{
		ID:              uuid.New().String(),
		UsuarioID:       usuarioID,
		CarreraID:       dto.CarreraID,
		MateriaID:       dto.MateriaID,
		NotaFinal:       dto.NotaFinal,
		FechaAprobacion: fecha,
		TipoAprobacion:  tipo,
		LibroActa:       dto.LibroActa,
		FolioActa:       dto.FolioActa,
		Observaciones:   dto.Observaciones,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	if err := s.repo.CreateAprobacion(aprob); err != nil {
		return nil, err
	}

	return aprob, nil
}

func (s *service) GetAprobaciones(carreraID string, usuarioID string) ([]AprobacionHistorica, error) {
	return s.repo.FindAprobacionesByCarrera(carreraID, usuarioID)
}

func (s *service) DeleteAprobacion(id string, usuarioID string) error {
	return s.repo.DeleteAprobacion(id, usuarioID)
}
