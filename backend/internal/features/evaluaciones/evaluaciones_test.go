package evaluaciones

import (
	"testing"
	"time"
)

func TestToResponseDTO_WithAndWithoutFecha(t *testing.T) {
	// Caso 1: Evaluación sin fecha (instancia pasada o no fijada)
	evSinFecha := Evaluacion{
		ID:        "ev-1",
		UsuarioID: "user-1",
		MateriaID: "mat-1",
		Titulo:    "Evaluación Pasada",
		Tipo:      "PARCIAL",
		Fecha:     nil,
		Horario:   "09:00",
		Modalidad: "Presencial",
	}

	dtoSinFecha := ToResponseDTO(evSinFecha)
	if dtoSinFecha.Fecha != nil {
		t.Errorf("expected Fecha to be nil, got %v", *dtoSinFecha.Fecha)
	}
	if dtoSinFecha.Titulo != "Evaluación Pasada" {
		t.Errorf("expected Titulo 'Evaluación Pasada', got %s", dtoSinFecha.Titulo)
	}

	// Caso 2: Evaluación con fecha
	ahora := time.Date(2026, 9, 15, 10, 0, 0, 0, time.UTC)
	evConFecha := Evaluacion{
		ID:        "ev-2",
		UsuarioID: "user-1",
		MateriaID: "mat-1",
		Titulo:    "Parcial Programado",
		Tipo:      "PARCIAL",
		Fecha:     &ahora,
		Horario:   "10:00",
		Modalidad: "Presencial",
	}

	dtoConFecha := ToResponseDTO(evConFecha)
	if dtoConFecha.Fecha == nil {
		t.Fatalf("expected Fecha to be non-nil")
	}
	if *dtoConFecha.Fecha != ahora {
		t.Errorf("expected Fecha %v, got %v", ahora, *dtoConFecha.Fecha)
	}
}
