package subjects

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Repository interface {
	GetAll(ctx context.Context, usuarioID string, carreraID string, estado string, anio int) ([]Materia, error)
	GetByID(ctx context.Context, id string) (*Materia, error)
	Create(ctx context.Context, materia *Materia) error
	Update(ctx context.Context, materia *Materia) error
	Delete(ctx context.Context, id string) error
	BatchImport(ctx context.Context, usuarioID string, req BatchImportPlanRequest) (*BatchImportPlanResponse, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetAll(ctx context.Context, usuarioID string, carreraID string, estado string, anio int) ([]Materia, error) {
	var materias []Materia
	q := r.db.WithContext(ctx).Order("anio desc, nombre asc")
	if usuarioID != "" {
		q = q.Where("usuario_id = ?", usuarioID)
	}

	targetCarreraID := carreraID
	if targetCarreraID == "" && usuarioID != "" {
		var activeCarreraID string
		_ = r.db.WithContext(ctx).Table("carreras").
			Where("usuario_id = ? AND is_activa = ?", usuarioID, true).
			Select("id").Limit(1).Scan(&activeCarreraID).Error
		targetCarreraID = activeCarreraID
	}

	if targetCarreraID != "" {
		q = q.Where("carrera_id = ?", targetCarreraID)
	}
	if estado != "" {
		q = q.Where("estado = ?", estado)
	}
	if anio > 0 {
		q = q.Where("anio = ?", anio)
	}
	if err := q.Find(&materias).Error; err != nil {
		return nil, err
	}
	return materias, nil
}

func (r *repository) GetByID(ctx context.Context, id string) (*Materia, error) {
	var materia Materia
	if err := r.db.WithContext(ctx).First(&materia, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &materia, nil
}

func (r *repository) Create(ctx context.Context, materia *Materia) error {
	if materia.CarreraID == "" && materia.UsuarioID != "" {
		var activeCarreraID string
		_ = r.db.WithContext(ctx).Table("carreras").
			Where("usuario_id = ? AND is_activa = ?", materia.UsuarioID, true).
			Select("id").Limit(1).Scan(&activeCarreraID).Error
		if activeCarreraID != "" {
			materia.CarreraID = activeCarreraID
		}
	}
	return r.db.WithContext(ctx).Create(materia).Error
}

func (r *repository) Update(ctx context.Context, materia *Materia) error {
	return r.db.WithContext(ctx).Save(materia).Error
}

func (r *repository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&Materia{}, "id = ?", id).Error
}

var defaultPalette = []string{
	"#3b82f6", "#10b981", "#8b5cf6", "#f59e0b",
	"#ec4899", "#06b6d4", "#6366f1", "#14b8a6",
	"#f97316", "#84cc16", "#0ea5e9", "#d946ef",
}

func cleanRefString(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	replacer := strings.NewReplacer(
		"á", "a", "é", "e", "í", "i", "ó", "o", "ú", "u",
		"ä", "a", "ë", "e", "ï", "i", "ö", "o", "ü", "u",
		".", "", "-", "", "_", "", ",", "", ":", "", ";", "",
	)
	s = replacer.Replace(s)
	return strings.Join(strings.Fields(s), " ")
}

func (r *repository) BatchImport(ctx context.Context, usuarioID string, req BatchImportPlanRequest) (*BatchImportPlanResponse, error) {
	tx := r.db.WithContext(ctx).Begin()
	defer func() {
		if rec := recover(); rec != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Error; err != nil {
		return nil, err
	}

	// 1. Obtener materias existentes de la carrera para esta cuenta
	var existingSubjects []Materia
	if err := tx.Where("usuario_id = ? AND carrera_id = ?", usuarioID, req.CarreraID).Find(&existingSubjects).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Mapeos de búsqueda para vincular materias existentes y no perder apuntes/notas
	existingByCode := make(map[string]Materia)
	existingByName := make(map[string]Materia)
	refMap := make(map[string]string)
	for _, m := range existingSubjects {
		if m.Codigo != "" {
			existingByCode[cleanRefString(m.Codigo)] = m
			refMap[cleanRefString(m.Codigo)] = m.ID
		}
		if m.Nombre != "" {
			existingByName[cleanRefString(m.Nombre)] = m
			refMap[cleanRefString(m.Nombre)] = m.ID
		}
	}

	matchedExistingIDs := make(map[string]bool)
	var processedList []Materia
	maxAnio := 1

	// PASO 1: Upsert inteligente de materias (preservando ID original si ya existe)
	for i, item := range req.Materias {
		anio := item.Anio
		if anio <= 0 {
			anio = 1
		}
		if anio > maxAnio {
			maxAnio = anio
		}

		cuatrimestre := "PRIMERO"
		cNorm := strings.ToUpper(strings.TrimSpace(item.Cuatrimestre))
		if strings.Contains(cNorm, "ANUAL") || cNorm == "A" {
			cuatrimestre = "ANUAL"
		} else if strings.Contains(cNorm, "2") || strings.Contains(cNorm, "SEGUNDO") {
			cuatrimestre = "SEGUNDO"
		} else {
			cuatrimestre = "PRIMERO"
		}

		// Buscar si ya existe por código o por nombre normalizado
		var existing *Materia
		if item.Codigo != "" {
			if ex, ok := existingByCode[cleanRefString(item.Codigo)]; ok {
				existing = &ex
			}
		}
		if existing == nil && item.Nombre != "" {
			if ex, ok := existingByName[cleanRefString(item.Nombre)]; ok {
				existing = &ex
			}
		}

		var m Materia
		if existing != nil {
			// Materia YA EXISTE: Preservamos su ID, apuntes, notas y estado académico
			m = *existing
			matchedExistingIDs[m.ID] = true
			m.Anio = anio
			m.Cuatrimestre = cuatrimestre
			if item.Codigo != "" {
				m.Codigo = item.Codigo
			}
			if item.Nombre != "" {
				m.Nombre = item.Nombre
			}
			if item.Modalidad != "" {
				m.Modalidad = item.Modalidad
			}
			if item.ProfesorTitular != "" && m.ProfesorTitular == "" {
				m.ProfesorTitular = item.ProfesorTitular
			}
			if item.ProfesorJTP != "" && m.ProfesorJTP == "" {
				m.ProfesorJTP = item.ProfesorJTP
			}

			if err := tx.Save(&m).Error; err != nil {
				tx.Rollback()
				return nil, err
			}
		} else {
			// Materia NUEVA: generamos ID nuevo
			newID := uuid.New().String()
			estado := item.Estado
			if estado == "" {
				estado = "PENDIENTE"
			}
			modalidad := item.Modalidad
			if modalidad == "" {
				modalidad = "Presencial"
			}
			color := item.Color
			if color == "" {
				color = defaultPalette[i%len(defaultPalette)]
			}
			reglas := DefaultReglasAcreditacion()

			m = Materia{
				ID:                 newID,
				UsuarioID:          usuarioID,
				CarreraID:          req.CarreraID,
				Codigo:             item.Codigo,
				Nombre:             item.Nombre,
				Anio:               anio,
				Cuatrimestre:       cuatrimestre,
				Estado:             estado,
				Color:              color,
				Modalidad:          modalidad,
				ProfesorTitular:    item.ProfesorTitular,
				ProfesorJTP:        item.ProfesorJTP,
				ReglasAcreditacion: &reglas,
				CorrelativasCursar: []string{},
				CorrelativasRendir: []string{},
			}

			if err := tx.Create(&m).Error; err != nil {
				tx.Rollback()
				return nil, err
			}
		}

		// Registrar referencias para el mapeo de correlatividades
		if item.TempID != "" {
			refMap[cleanRefString(item.TempID)] = m.ID
		}
		if m.Codigo != "" {
			refMap[cleanRefString(m.Codigo)] = m.ID
		}
		if m.Nombre != "" {
			refMap[cleanRefString(m.Nombre)] = m.ID
		}

		processedList = append(processedList, m)
	}

	// Si el usuario eligió reemplazar el plan actual:
	// Eliminamos únicamente las materias de la carrera que NO están en el nuevo plan importado.
	if req.ReplacePlan {
		for _, ex := range existingSubjects {
			if !matchedExistingIDs[ex.ID] {
				if err := tx.Delete(&Materia{}, "id = ?", ex.ID).Error; err != nil {
					tx.Rollback()
					return nil, err
				}
			}
		}
	}

	// PASO 2: Resolver correlatividades mapeando referencias a IDs reales
	resolveRefs := func(refs []string, currentID string) []string {
		var resolved []string
		seen := make(map[string]bool)
		for _, ref := range refs {
			norm := cleanRefString(ref)
			if targetID, ok := refMap[norm]; ok {
				if !seen[targetID] && targetID != currentID {
					seen[targetID] = true
					resolved = append(resolved, targetID)
				}
			}
		}
		return resolved
	}

	for i, item := range req.Materias {
		m := &processedList[i]
		m.CorrelativasCursar = resolveRefs(item.CorrelativasCursar, m.ID)
		m.CorrelativasRendir = resolveRefs(item.CorrelativasRendir, m.ID)

		if len(m.CorrelativasCursar) > 0 || len(m.CorrelativasRendir) > 0 {
			if err := tx.Model(&Materia{}).Where("id = ?", m.ID).Updates(map[string]interface{}{
				"correlativas_cursar": m.CorrelativasCursar,
				"correlativas_rendir": m.CorrelativasRendir,
			}).Error; err != nil {
				tx.Rollback()
				return nil, err
			}
		}
	}

	// PASO 3: Actualizar metadatos de la carrera
	var totalMateriasCount int64
	if err := tx.Model(&Materia{}).Where("usuario_id = ? AND carrera_id = ?", usuarioID, req.CarreraID).Count(&totalMateriasCount).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	carreraUpdates := map[string]interface{}{
		"total_materias_plan": int(totalMateriasCount),
	}
	duracion := req.DuracionAnios
	if duracion <= 0 {
		duracion = maxAnio
	}
	carreraUpdates["duracion_anios"] = duracion

	if err := tx.Table("carreras").Where("id = ? AND usuario_id = ?", req.CarreraID, usuarioID).Updates(carreraUpdates).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &BatchImportPlanResponse{
		TotalImportadas: len(processedList),
		DuracionAnios:   duracion,
		CarreraID:       req.CarreraID,
		Materias:        processedList,
	}, nil
}
