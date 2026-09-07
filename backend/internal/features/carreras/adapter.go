package carreras

import (
	"time"

	"github.com/google/uuid"
)

type AuthCarreraAdapter struct {
	repo Repository
}

func NewAuthCarreraAdapter(repo Repository) *AuthCarreraAdapter {
	return &AuthCarreraAdapter{repo: repo}
}

func (a *AuthCarreraAdapter) GetActiveCarrera(usuarioID string) (id string, data interface{}, err error) {
	carrera, err := a.repo.FindActiveByUsuarioID(usuarioID)
	if err != nil || carrera == nil {
		return "", nil, err
	}
	return carrera.ID, carrera, nil
}

func (a *AuthCarreraAdapter) CreateInitialCarrera(usuarioID, nombre, facultadSede, legajo string) (id string, data interface{}, err error) {
	if nombre == "" {
		nombre = "Carrera de Grado"
	}
	if facultadSede == "" {
		facultadSede = "Universidad"
	}
	if legajo == "" {
		legajo = "S/N"
	}

	carrera := &Carrera{
		ID:                uuid.New().String(),
		UsuarioID:         usuarioID,
		Nombre:            nombre,
		FacultadSede:      facultadSede,
		Legajo:            legajo,
		SemestreActual:    "1º Semestre",
		CicloActivo:       "1C 2026",
		DuracionAnios:     5,
		TotalMateriasPlan: 36,
		IsActiva:          true,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}

	if err := a.repo.Create(carrera); err != nil {
		return "", nil, err
	}
	return carrera.ID, carrera, nil
}
