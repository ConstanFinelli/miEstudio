package carreras

import (
	"testing"
)

type mockRepository struct {
	carreras     []Carrera
	aprobaciones []AprobacionHistorica
}

func (m *mockRepository) Create(c *Carrera) error {
	m.carreras = append(m.carreras, *c)
	return nil
}
func (m *mockRepository) FindByID(id string, usuarioID string) (*Carrera, error) {
	for _, c := range m.carreras {
		if c.ID == id && c.UsuarioID == usuarioID {
			return &c, nil
		}
	}
	return nil, nil
}
func (m *mockRepository) FindAllByUsuarioID(usuarioID string) ([]Carrera, error) {
	var list []Carrera
	for _, c := range m.carreras {
		if c.UsuarioID == usuarioID {
			list = append(list, c)
		}
	}
	return list, nil
}
func (m *mockRepository) FindActiveByUsuarioID(usuarioID string) (*Carrera, error) {
	for _, c := range m.carreras {
		if c.UsuarioID == usuarioID && c.IsActiva {
			return &c, nil
		}
	}
	return nil, nil
}
func (m *mockRepository) Update(c *Carrera) error { return nil }
func (m *mockRepository) SetActive(id string, usuarioID string) error {
	for i := range m.carreras {
		if m.carreras[i].UsuarioID == usuarioID {
			m.carreras[i].IsActiva = (m.carreras[i].ID == id)
		}
	}
	return nil
}
func (m *mockRepository) Delete(id string, usuarioID string) error { return nil }
func (m *mockRepository) CreateAprobacion(aprob *AprobacionHistorica) error {
	m.aprobaciones = append(m.aprobaciones, *aprob)
	return nil
}
func (m *mockRepository) FindAprobacionesByCarrera(carreraID string, usuarioID string) ([]AprobacionHistorica, error) {
	return m.aprobaciones, nil
}
func (m *mockRepository) DeleteAprobacion(id string, usuarioID string) error { return nil }
func (m *mockRepository) RecalcularMetricasCarrera(carreraID string) error   { return nil }

func TestCreateCarreraDefaults(t *testing.T) {
	repo := &mockRepository{}
	svc := NewService(repo)

	dto := CreateCarreraDTO{
		Nombre:       "Ingeniería en Sistemas",
		FacultadSede: "UTN",
		Legajo:       "12345",
	}

	carrera, err := svc.CreateCarrera("user-1", dto)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if carrera.Nombre != dto.Nombre {
		t.Errorf("expected nombre %s, got %s", dto.Nombre, carrera.Nombre)
	}
	if !carrera.IsActiva {
		t.Errorf("expected first carrera to be active by default")
	}
	if carrera.DuracionAnios != 5 {
		t.Errorf("expected default duration 5, got %d", carrera.DuracionAnios)
	}
	if carrera.TotalMateriasPlan != 0 {
		t.Errorf("expected default total materias 0, got %d", carrera.TotalMateriasPlan)
	}
}

func TestRegistrarAprobacionValidation(t *testing.T) {
	repo := &mockRepository{}
	svc := NewService(repo)

	// Nota inválida (> 10)
	_, err := svc.RegistrarAprobacion("user-1", CreateAprobacionHistoricaDTO{
		CarreraID: "car-1",
		MateriaID: "mat-1",
		NotaFinal: 11,
	})
	if err == nil {
		t.Errorf("expected error for invalid nota > 10, got nil")
	}

	// Nota válida
	aprob, err := svc.RegistrarAprobacion("user-1", CreateAprobacionHistoricaDTO{
		CarreraID:       "car-1",
		MateriaID:       "mat-1",
		NotaFinal:       9.5,
		FechaAprobacion: "2024-12-15",
		TipoAprobacion:  "FINAL",
	})
	if err != nil {
		t.Fatalf("expected no error for valid aprobacion, got %v", err)
	}
	if aprob.NotaFinal != 9.5 {
		t.Errorf("expected nota 9.5, got %f", aprob.NotaFinal)
	}
}
