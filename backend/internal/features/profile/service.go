package profile

import (
	"context"
	"encoding/json"

	"github.com/google/uuid"
)

type Service interface {
	GetPerfil(ctx context.Context) (*PerfilDTO, error)
	UpdatePerfil(ctx context.Context, dto UpdatePerfilDTO) (*PerfilDTO, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) GetPerfil(ctx context.Context) (*PerfilDTO, error) {
	p, err := s.repo.Get(ctx)
	if err != nil {
		return nil, err
	}

	if p == nil {
		p = &Perfil{
			ID:                uuid.New().String(),
			Nombre:            "Estudiante",
			Legajo:            "48.910",
			Carrera:           "Ingeniería en Informática",
			SemestreActual:    "7° Semestre",
			CicloActivo:       "1C 2026",
			PromedioGeneral:   8.42,
			DeltaPromedio:     0.18,
			PuestoCohorte:     4,
			Percentil:         95,
			MateriasAprobadas: 24,
			MateriasTotales:   36,
			CreditosAprobados: 168,
			CreditosTotales:   240,
			PromedioHistorico: `[{"cuatrimestre":"1C 2023","promedio":7.80},{"cuatrimestre":"2C 2023","promedio":8.10},{"cuatrimestre":"1C 2024","promedio":8.25},{"cuatrimestre":"2C 2024","promedio":8.50},{"cuatrimestre":"1C 2025","promedio":8.42}]`,
		}
		_ = s.repo.Save(ctx, p)
	}

	return toDTO(p), nil
}

func (s *service) UpdatePerfil(ctx context.Context, dto UpdatePerfilDTO) (*PerfilDTO, error) {
	p, err := s.repo.Get(ctx)
	if err != nil {
		return nil, err
	}
	if p == nil {
		p = &Perfil{ID: uuid.New().String()}
	}

	if dto.Nombre != nil {
		p.Nombre = *dto.Nombre
	}
	if dto.Legajo != nil {
		p.Legajo = *dto.Legajo
	}
	if dto.Carrera != nil {
		p.Carrera = *dto.Carrera
	}
	if dto.SemestreActual != nil {
		p.SemestreActual = *dto.SemestreActual
	}
	if dto.CicloActivo != nil {
		p.CicloActivo = *dto.CicloActivo
	}
	if dto.PromedioGeneral != nil {
		p.PromedioGeneral = *dto.PromedioGeneral
	}
	if dto.DeltaPromedio != nil {
		p.DeltaPromedio = *dto.DeltaPromedio
	}
	if dto.PuestoCohorte != nil {
		p.PuestoCohorte = *dto.PuestoCohorte
	}
	if dto.Percentil != nil {
		p.Percentil = *dto.Percentil
	}
	if dto.MateriasAprobadas != nil {
		p.MateriasAprobadas = *dto.MateriasAprobadas
	}
	if dto.MateriasTotales != nil {
		p.MateriasTotales = *dto.MateriasTotales
	}
	if dto.CreditosAprobados != nil {
		p.CreditosAprobados = *dto.CreditosAprobados
	}
	if dto.CreditosTotales != nil {
		p.CreditosTotales = *dto.CreditosTotales
	}
	if dto.PromedioHistorico != nil {
		if bytes, err := json.Marshal(*dto.PromedioHistorico); err == nil {
			p.PromedioHistorico = string(bytes)
		}
	}

	if err := s.repo.Save(ctx, p); err != nil {
		return nil, err
	}

	return toDTO(p), nil
}

func toDTO(p *Perfil) *PerfilDTO {
	var historico []PromedioHistoricoItem
	if p.PromedioHistorico != "" {
		_ = json.Unmarshal([]byte(p.PromedioHistorico), &historico)
	}
	if historico == nil {
		historico = []PromedioHistoricoItem{}
	}

	return &PerfilDTO{
		ID:                p.ID,
		Nombre:            p.Nombre,
		Legajo:            p.Legajo,
		Carrera:           p.Carrera,
		SemestreActual:    p.SemestreActual,
		CicloActivo:       p.CicloActivo,
		PromedioGeneral:   p.PromedioGeneral,
		DeltaPromedio:     p.DeltaPromedio,
		PuestoCohorte:     p.PuestoCohorte,
		Percentil:         p.Percentil,
		MateriasAprobadas: p.MateriasAprobadas,
		MateriasTotales:   p.MateriasTotales,
		CreditosAprobados: p.CreditosAprobados,
		CreditosTotales:   p.CreditosTotales,
		PromedioHistorico: historico,
	}
}
