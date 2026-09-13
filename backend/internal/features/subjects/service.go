package subjects

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service interface {
	ListMaterias(ctx context.Context, usuarioID string, carreraID string, estado string, anio int) ([]Materia, error)
	GetMateria(ctx context.Context, id string) (*Materia, error)
	CreateMateria(ctx context.Context, dto CreateMateriaDTO) (*Materia, error)
	UpdateMateria(ctx context.Context, id string, dto UpdateMateriaDTO) (*Materia, error)
	DeleteMateria(ctx context.Context, id string) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) ListMaterias(ctx context.Context, usuarioID string, carreraID string, estado string, anio int) ([]Materia, error) {
	return s.repo.GetAll(ctx, usuarioID, carreraID, estado, anio)
}

func (s *service) GetMateria(ctx context.Context, id string) (*Materia, error) {
	m, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("materia no encontrada")
		}
		return nil, err
	}
	return m, nil
}

func (s *service) CreateMateria(ctx context.Context, dto CreateMateriaDTO) (*Materia, error) {
	if dto.Nombre == "" {
		return nil, errors.New("el nombre de la materia es requerido")
	}
	if dto.Anio <= 0 {
		dto.Anio = time.Now().Year()
	}
	if dto.Cuatrimestre == "" {
		dto.Cuatrimestre = "PRIMERO"
	}
	if dto.Estado == "" {
		dto.Estado = "CURSANDO"
	}
	if dto.Color == "" {
		dto.Color = "#3b82f6"
	}
	if dto.Modalidad == "" {
		dto.Modalidad = "Presencial"
	}

	reglas := dto.ReglasAcreditacion
	if reglas == nil {
		def := DefaultReglasAcreditacion()
		reglas = &def
	}

	materia := &Materia{
		ID:                 uuid.New().String(),
		UsuarioID:          dto.UsuarioID,
		CarreraID:          dto.CarreraID,
		Codigo:             dto.Codigo,
		Nombre:             dto.Nombre,
		Anio:               dto.Anio,
		Cuatrimestre:       dto.Cuatrimestre,
		Estado:             dto.Estado,
		Color:              dto.Color,
		Comision:           dto.Comision,
		Modalidad:          dto.Modalidad,
		Promedio:           dto.Promedio,
		ProfesorTitular:    dto.ProfesorTitular,
		ProfesorJTP:        dto.ProfesorJTP,
		ReglasAcreditacion: reglas,
		CorrelativasCursar: dto.CorrelativasCursar,
		CorrelativasRendir: dto.CorrelativasRendir,
	}

	if materia.CorrelativasCursar == nil {
		materia.CorrelativasCursar = []string{}
	}
	if materia.CorrelativasRendir == nil {
		materia.CorrelativasRendir = []string{}
	}

	if err := s.repo.Create(ctx, materia); err != nil {
		return nil, err
	}

	return materia, nil
}

func (s *service) UpdateMateria(ctx context.Context, id string, dto UpdateMateriaDTO) (*Materia, error) {
	materia, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if dto.Codigo != nil {
		materia.Codigo = *dto.Codigo
	}
	if dto.Nombre != nil {
		materia.Nombre = *dto.Nombre
	}
	if dto.Anio != nil {
		materia.Anio = *dto.Anio
	}
	if dto.Cuatrimestre != nil {
		materia.Cuatrimestre = *dto.Cuatrimestre
	}
	if dto.Estado != nil {
		oldEstado := materia.Estado
		materia.Estado = *dto.Estado
		if (oldEstado == "APROBADA" || oldEstado == "PROMOCIONADA") && (*dto.Estado == "CURSANDO" || *dto.Estado == "REGULAR") {
			materia.Promedio = 0
		}
	}
	if dto.Color != nil {
		materia.Color = *dto.Color
	}
	if dto.Comision != nil {
		materia.Comision = *dto.Comision
	}
	if dto.Modalidad != nil {
		materia.Modalidad = *dto.Modalidad
	}
	if dto.Promedio != nil {
		if materia.Estado == "APROBADA" || materia.Estado == "PROMOCIONADA" {
			materia.Promedio = *dto.Promedio
		} else if dto.Estado == nil {
			materia.Promedio = *dto.Promedio
		}
	}
	if dto.ProfesorTitular != nil {
		materia.ProfesorTitular = *dto.ProfesorTitular
	}
	if dto.ProfesorJTP != nil {
		materia.ProfesorJTP = *dto.ProfesorJTP
	}
	if dto.ReglasAcreditacion != nil {
		materia.ReglasAcreditacion = dto.ReglasAcreditacion
	}
	if dto.CorrelativasCursar != nil {
		materia.CorrelativasCursar = *dto.CorrelativasCursar
	}
	if dto.CorrelativasRendir != nil {
		materia.CorrelativasRendir = *dto.CorrelativasRendir
	}

	if err := s.repo.Update(ctx, materia); err != nil {
		return nil, err
	}

	return materia, nil
}

func (s *service) DeleteMateria(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
