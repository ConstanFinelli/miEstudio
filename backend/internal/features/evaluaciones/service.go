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
	ListEvaluaciones(ctx context.Context, usuarioID string, materiaID string) ([]Evaluacion, error)
	ListProximas(ctx context.Context, usuarioID string, limit int) ([]Evaluacion, error)
	GetEvaluacion(ctx context.Context, id string) (*Evaluacion, error)
	CreateEvaluacion(ctx context.Context, dto CreateEvaluacionDTO) (*Evaluacion, error)
	UpdateEvaluacion(ctx context.Context, id string, dto UpdateEvaluacionDTO) (*Evaluacion, error)
	UpdateNota(ctx context.Context, id string, nota float64) (*Evaluacion, error)
	DeleteEvaluacion(ctx context.Context, id string) error
	RecalcularPromedioMateria(ctx context.Context, materiaID string) error
	SincronizarTodosLosPromedios(ctx context.Context) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) ListEvaluaciones(ctx context.Context, usuarioID string, materiaID string) ([]Evaluacion, error) {
	return s.repo.GetByMateria(ctx, usuarioID, materiaID)
}

func (s *service) ListProximas(ctx context.Context, usuarioID string, limit int) ([]Evaluacion, error) {
	return s.repo.GetProximas(ctx, usuarioID, limit)
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

	var fechaPtr *time.Time
	if dto.Fecha != nil && strings.TrimSpace(*dto.Fecha) != "" {
		fStr := strings.TrimSpace(*dto.Fecha)
		if parsedDate, err := time.ParseInLocation("2006-01-02", fStr, time.Local); err == nil {
			fechaPtr = &parsedDate
		} else if parsedDate, err := time.Parse(time.RFC3339, fStr); err == nil {
			fechaPtr = &parsedDate
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
	} else if len(horario) == 8 && strings.Count(horario, ":") == 2 {
		if parsedTime, err := time.Parse("15:04:05", horario); err == nil {
			horario = parsedTime.Format("15:04")
		}
	} else if _, err := time.Parse("15:04", horario); err != nil {
		if len(horario) > 20 {
			horario = horario[:20]
		}
	}
	peso := dto.Peso
	if peso <= 0 {
		peso = 100
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
		UsuarioID:     dto.UsuarioID,
		MateriaID:     dto.MateriaID,
		Titulo:        dto.Titulo,
		Tipo:          tipo,
		Fecha:         fechaPtr,
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

	_ = s.repo.RecalcularPromedioMateria(ctx, evaluacion.MateriaID)

	if reloaded, err := s.repo.GetByID(ctx, evaluacion.ID); err == nil {
		return reloaded, nil
	}

	return evaluacion, nil
}

func (s *service) UpdateEvaluacion(ctx context.Context, id string, dto UpdateEvaluacionDTO) (*Evaluacion, error) {
	ev, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	oldMateriaID := ev.MateriaID

	if dto.MateriaID != nil && *dto.MateriaID != "" {
		ev.MateriaID = *dto.MateriaID
	}
	if dto.Titulo != nil && *dto.Titulo != "" {
		ev.Titulo = *dto.Titulo
	}
	if dto.Tipo != nil && *dto.Tipo != "" {
		ev.Tipo = *dto.Tipo
	}
	if dto.ClearFecha {
		ev.Fecha = nil
	} else if dto.Fecha != nil {
		fStr := strings.TrimSpace(*dto.Fecha)
		if fStr == "" {
			ev.Fecha = nil
		} else if parsedDate, err := time.ParseInLocation("2006-01-02", fStr, time.Local); err == nil {
			ev.Fecha = &parsedDate
		} else if parsedDate, err := time.Parse(time.RFC3339, fStr); err == nil {
			ev.Fecha = &parsedDate
		}
	}
	if dto.Horario != nil {
		h := strings.TrimSpace(*dto.Horario)
		h = strings.TrimSuffix(h, " hs")
		h = strings.TrimSuffix(h, "hs")
		h = strings.TrimSpace(h)
		if h != "" {
			ev.Horario = h
		}
	}
	if dto.ClearNota {
		ev.Nota = nil
	} else if dto.Nota != nil {
		ev.Nota = dto.Nota
	}
	if dto.Peso != nil && *dto.Peso > 0 {
		ev.Peso = *dto.Peso
	}
	if dto.EsAprobatorio != nil {
		ev.EsAprobatorio = *dto.EsAprobatorio
	}
	if dto.Aula != nil {
		ev.Aula = *dto.Aula
	}
	if dto.Modalidad != nil && *dto.Modalidad != "" {
		ev.Modalidad = *dto.Modalidad
	}
	if dto.Temario != nil {
		if bytes, err := json.Marshal(*dto.Temario); err == nil {
			ev.Temario = string(bytes)
		}
	}

	if err := s.repo.Update(ctx, ev); err != nil {
		return nil, err
	}

	_ = s.repo.RecalcularPromedioMateria(ctx, ev.MateriaID)
	if oldMateriaID != "" && oldMateriaID != ev.MateriaID {
		_ = s.repo.RecalcularPromedioMateria(ctx, oldMateriaID)
	}

	if reloaded, err := s.repo.GetByID(ctx, ev.ID); err == nil {
		return reloaded, nil
	}
	return ev, nil
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

	_ = s.repo.RecalcularPromedioMateria(ctx, ev.MateriaID)

	return ev, nil
}

func (s *service) DeleteEvaluacion(ctx context.Context, id string) error {
	ev, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	materiaID := ev.MateriaID

	if err := s.repo.Delete(ctx, id); err != nil {
		return err
	}

	_ = s.repo.RecalcularPromedioMateria(ctx, materiaID)
	return nil
}

func (s *service) RecalcularPromedioMateria(ctx context.Context, materiaID string) error {
	return s.repo.RecalcularPromedioMateria(ctx, materiaID)
}

func (s *service) SincronizarTodosLosPromedios(ctx context.Context) error {
	return s.repo.SincronizarPromedios(ctx)
}

