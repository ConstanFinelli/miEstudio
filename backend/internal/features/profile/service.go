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
			Legajo:            "---",
			Carrera:           "Carrera de Grado",
			SemestreActual:    "Ciclo Lectivo",
			CicloActivo:       "1C 2026",
			PromedioGeneral:   0,
			DeltaPromedio:     0,
			PuestoCohorte:     0,
			Percentil:         0,
			MateriasAprobadas: 0,
			MateriasTotales:   0,
			CreditosAprobados: 0,
			CreditosTotales:   0,
			PromedioHistorico: `[]`,
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
