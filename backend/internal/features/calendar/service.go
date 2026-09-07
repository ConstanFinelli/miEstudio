package calendar

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
)

type Service interface {
	ListEventos(ctx context.Context, usuarioID string) ([]EventoCalendario, error)
	CreateEvento(ctx context.Context, dto CreateEventoDTO) (*EventoCalendario, error)
	DeleteEvento(ctx context.Context, id string) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) ListEventos(ctx context.Context, usuarioID string) ([]EventoCalendario, error) {
	return s.repo.GetAll(ctx, usuarioID)
}

func (s *service) CreateEvento(ctx context.Context, dto CreateEventoDTO) (*EventoCalendario, error) {
	if dto.Titulo == "" {
		return nil, errors.New("el título del evento es requerido")
	}

	inicio, err := time.Parse(time.RFC3339, dto.FechaInicio)
	if err != nil {
		inicio, err = time.Parse("2006-01-02", dto.FechaInicio)
		if err != nil {
			inicio = time.Now()
		}
	}

	fin, err := time.Parse(time.RFC3339, dto.FechaFin)
	if err != nil {
		fin, err = time.Parse("2006-01-02", dto.FechaFin)
		if err != nil {
			fin = inicio.Add(2 * time.Hour)
		}
	}

	tipo := dto.Tipo
	if tipo == "" {
		tipo = "ESTUDIO"
	}
	modalidad := dto.Modalidad
	if modalidad == "" {
		modalidad = "Presencial"
	}

	evento := &EventoCalendario{
		ID:               uuid.New().String(),
		UsuarioID:        dto.UsuarioID,
		MateriaID:        dto.MateriaID,
		Titulo:           dto.Titulo,
		FechaInicio:      inicio,
		FechaFin:         fin,
		Tipo:             tipo,
		Aula:             dto.Aula,
		Modalidad:        modalidad,
		ImpactoAcademico: dto.ImpactoAcademico,
		EsCritico:        dto.EsCritico,
	}

	if err := s.repo.Create(ctx, evento); err != nil {
		return nil, err
	}

	return evento, nil
}

func (s *service) DeleteEvento(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
