package schedules

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service interface {
	ListHorarios(ctx context.Context, usuarioID, materiaID, diaSemana string) ([]HorarioCursada, error)
	GetHorario(ctx context.Context, id string) (*HorarioCursada, error)
	CreateHorario(ctx context.Context, dto CreateHorarioDTO) (*HorarioCursada, error)
	UpdateHorario(ctx context.Context, id string, dto UpdateHorarioDTO) (*HorarioCursada, error)
	DeleteHorario(ctx context.Context, id string) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) ListHorarios(ctx context.Context, usuarioID, materiaID, diaSemana string) ([]HorarioCursada, error) {
	return s.repo.GetAll(ctx, usuarioID, materiaID, diaSemana)
}

func (s *service) GetHorario(ctx context.Context, id string) (*HorarioCursada, error) {
	item, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("horario no encontrado")
		}
		return nil, err
	}
	return item, nil
}

func (s *service) CreateHorario(ctx context.Context, dto CreateHorarioDTO) (*HorarioCursada, error) {
	if strings.TrimSpace(dto.MateriaID) == "" {
		return nil, errors.New("materia_id es requerido")
	}
	if strings.TrimSpace(dto.DiaSemana) == "" {
		return nil, errors.New("dia_semana es requerido")
	}
	if strings.TrimSpace(dto.HoraInicio) == "" || strings.TrimSpace(dto.HoraFin) == "" {
		return nil, errors.New("hora_inicio y hora_fin son requeridas")
	}

	dia := strings.ToUpper(strings.TrimSpace(dto.DiaSemana))
	modalidad := dto.Modalidad
	if modalidad == "" {
		modalidad = "Presencial"
	}
	tipoClase := dto.TipoClase
	if tipoClase == "" {
		tipoClase = "TEORIA"
	}

	horario := &HorarioCursada{
		ID:           uuid.New().String(),
		UsuarioID:    dto.UsuarioID,
		MateriaID:    dto.MateriaID,
		DiaSemana:    dia,
		HoraInicio:   dto.HoraInicio,
		HoraFin:      dto.HoraFin,
		FacultadSede: strings.TrimSpace(dto.FacultadSede),
		Aula:         strings.TrimSpace(dto.Aula),
		TipoClase:    tipoClase,
		Modalidad:    modalidad,
	}

	if err := s.repo.Create(ctx, horario); err != nil {
		return nil, err
	}

	return s.repo.GetByID(ctx, horario.ID)
}

func (s *service) UpdateHorario(ctx context.Context, id string, dto UpdateHorarioDTO) (*HorarioCursada, error) {
	horario, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if dto.MateriaID != nil {
		horario.MateriaID = *dto.MateriaID
	}
	if dto.DiaSemana != nil {
		horario.DiaSemana = strings.ToUpper(strings.TrimSpace(*dto.DiaSemana))
	}
	if dto.HoraInicio != nil {
		horario.HoraInicio = *dto.HoraInicio
	}
	if dto.HoraFin != nil {
		horario.HoraFin = *dto.HoraFin
	}
	if dto.FacultadSede != nil {
		horario.FacultadSede = strings.TrimSpace(*dto.FacultadSede)
	}
	if dto.Aula != nil {
		horario.Aula = strings.TrimSpace(*dto.Aula)
	}
	if dto.TipoClase != nil {
		horario.TipoClase = *dto.TipoClase
	}
	if dto.Modalidad != nil {
		horario.Modalidad = *dto.Modalidad
	}

	if err := s.repo.Update(ctx, horario); err != nil {
		return nil, err
	}

	return s.repo.GetByID(ctx, id)
}

func (s *service) DeleteHorario(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
