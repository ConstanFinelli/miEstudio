package notes

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service interface {
	ListApuntes(ctx context.Context, usuarioID, materiaID, carpeta, search string) ([]Apunte, error)
	GetApunte(ctx context.Context, id string) (*Apunte, error)
	CreateApunte(ctx context.Context, dto CreateApunteDTO) (*Apunte, error)
	UpdateApunte(ctx context.Context, id string, dto UpdateApunteDTO) (*Apunte, error)
	DeleteApunte(ctx context.Context, id string) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) ListApuntes(ctx context.Context, usuarioID, materiaID, carpeta, search string) ([]Apunte, error) {
	notes, err := s.repo.GetAll(ctx, usuarioID, materiaID, carpeta, search)
	if err != nil {
		return nil, err
	}

	for i := range notes {
		if notes[i].Etiquetas != "" {
			var tags []string
			if err := json.Unmarshal([]byte(notes[i].Etiquetas), &tags); err == nil {
				notes[i].Tags = tags
			}
		}
		if notes[i].Tags == nil {
			notes[i].Tags = []string{}
		}
	}

	return notes, nil
}

func (s *service) GetApunte(ctx context.Context, id string) (*Apunte, error) {
	note, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("apunte no encontrado")
		}
		return nil, err
	}

	if note.Etiquetas != "" {
		var tags []string
		if err := json.Unmarshal([]byte(note.Etiquetas), &tags); err == nil {
			note.Tags = tags
		}
	}
	if note.Tags == nil {
		note.Tags = []string{}
	}

	return note, nil
}

func (s *service) CreateApunte(ctx context.Context, dto CreateApunteDTO) (*Apunte, error) {
	if dto.MateriaID == "" {
		return nil, errors.New("materia_id es requerido")
	}
	if dto.Titulo == "" {
		dto.Titulo = "Nuevo Apunte"
	}
	if dto.Carpeta == "" {
		dto.Carpeta = "General"
	}

	tagsJSON := "[]"
	if len(dto.Etiquetas) > 0 {
		if bytes, err := json.Marshal(dto.Etiquetas); err == nil {
			tagsJSON = string(bytes)
		}
	}

	apunte := &Apunte{
		ID:        uuid.New().String(),
		UsuarioID: dto.UsuarioID,
		MateriaID: dto.MateriaID,
		Titulo:    dto.Titulo,
		Contenido: dto.Contenido,
		Carpeta:   dto.Carpeta,
		Resumen:   dto.Resumen,
		Etiquetas: tagsJSON,
		Tags:      dto.Etiquetas,
	}
	if apunte.Tags == nil {
		apunte.Tags = []string{}
	}

	if err := s.repo.Create(ctx, apunte); err != nil {
		return nil, err
	}

	return apunte, nil
}

func (s *service) UpdateApunte(ctx context.Context, id string, dto UpdateApunteDTO) (*Apunte, error) {
	apunte, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if dto.Titulo != nil {
		apunte.Titulo = *dto.Titulo
	}
	if dto.Contenido != nil {
		apunte.Contenido = *dto.Contenido
	}
	if dto.Carpeta != nil {
		apunte.Carpeta = *dto.Carpeta
	}
	if dto.Resumen != nil {
		apunte.Resumen = *dto.Resumen
	}
	if dto.Etiquetas != nil {
		apunte.Tags = *dto.Etiquetas
		if bytes, err := json.Marshal(*dto.Etiquetas); err == nil {
			apunte.Etiquetas = string(bytes)
		}
	}

	if err := s.repo.Update(ctx, apunte); err != nil {
		return nil, err
	}

	if apunte.Tags == nil {
		apunte.Tags = []string{}
	}

	return apunte, nil
}

func (s *service) DeleteApunte(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
