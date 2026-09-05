package evaluaciones

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service interface {
	ListEvaluaciones(ctx context.Context, materiaID string) ([]Evaluacion, error)
	ListProximas(ctx context.Context, limit int) ([]Evaluacion, error)
	GetEvaluacion(ctx context.Context, id string) (*Evaluacion, error)
	CreateEvaluacion(ctx context.Context, dto CreateEvaluacionDTO) (*Evaluacion, error)
	UpdateNota(ctx context.Context, id string, nota float64) (*Evaluacion, error)
	DeleteEvaluacion(ctx context.Context, id string) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) ListEvaluaciones(ctx context.Context, materiaID string) ([]Evaluacion, error) {
	return s.repo.GetByMateria(ctx, materiaID)
}

func (s *service) ListProximas(ctx context.Context, limit int) ([]Evaluacion, error) {
	return s.repo.GetProximas(ctx, limit)
}

func (s *service) GetEvaluacion(ctx context.Context, id string) (*Evaluacion, error) {
	ev, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("evaluación no encontrada")
		}
		return nil, err
	}
	return ev, nil
}

func (s *service) CreateEvaluacion(ctx context.Context, dto CreateEvaluacionDTO) (*Evaluacion, error) {
	if dto.MateriaID == "" {
		return nil, errors.New("materia_id es requerido")
	}
	if dto.Titulo == "" {
		return nil, errors.New("el título de la evaluación es requerido")
	}

	parsedDate, err := time.Parse("2006-01-02", dto.Fecha)
	if err != nil {
		parsedDate, err = time.Parse(time.RFC3339, dto.Fecha)
		if err != nil {
			parsedDate = time.Now().AddDate(0, 0, 7)
		}
	}

	tipo := dto.Tipo
	if tipo == "" {
		tipo = "PARCIAL"
	}

	horario := strings.TrimSpace(dto.Horario)
	horario = strings.TrimSuffix(horario, " hs")
	horario = strings.TrimSuffix(horario, "hs")
	horario = strings.TrimSpace(horario)

	if horario == "" {
		horario = "09:00"
	} else {
		// Validar que sea un formato de hora válido de 24hs (HH:mm)
		if _, err := time.Parse("15:04", horario); err != nil {
			return nil, errors.New("formato de horario inválido, debe ser una hora válida HH:mm (ej: 19:00)")
		}
	}
	peso := dto.Peso
	if peso <= 0 {
		peso = 25
	}
	esAprobatorio := true
	if dto.EsAprobatorio != nil {
		esAprobatorio = *dto.EsAprobatorio
	}

	temarioJSON := "[]"
	if len(dto.Temario) > 0 {
		if bytes, err := json.Marshal(dto.Temario); err == nil {
			temarioJSON = string(bytes)
		}
	}

	modalidad := dto.Modalidad
	if modalidad == "" {
		modalidad = "Presencial"
	}

	evaluacion := &Evaluacion{
		ID:            uuid.New().String(),
		MateriaID:     dto.MateriaID,
		Titulo:        dto.Titulo,
		Tipo:          tipo,
		Fecha:         parsedDate,
		Horario:       horario,
		Nota:          dto.Nota,
		Peso:          peso,
		EsAprobatorio: esAprobatorio,
		Aula:          dto.Aula,
		Modalidad:     modalidad,
		Temario:       temarioJSON,
	}

	if err := s.repo.Create(ctx, evaluacion); err != nil {
		return nil, err
	}

	return evaluacion, nil
}

func (s *service) UpdateNota(ctx context.Context, id string, nota float64) (*Evaluacion, error) {
	ev, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	ev.Nota = &nota
	if err := s.repo.Update(ctx, ev); err != nil {
		return nil, err
	}

	return ev, nil
}

func (s *service) DeleteEvaluacion(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
