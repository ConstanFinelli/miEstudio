package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"miestudio/backend/internal/features/auth"
	"miestudio/backend/internal/features/materials"
	"miestudio/backend/internal/storage"
)

const AcademicSystemPrompt = `Eres el Asistente Académico Inteligente de "miEstudio", una plataforma universitaria de estudio activo.
Tu función es ayudar al estudiante a comprender en profundidad los materiales de estudio oficiales (libros, diapositivas, guías y documentos PDF de cátedra), resolver dudas con rigor conceptual y claridad pedagógica.
Directrices:
1. Sé conciso, riguroso y claro.
2. Fundamenta tus respuestas, explicaciones, resúmenes, flashcards y preguntas de examen estrictamente en el material de estudio oficial (PDF) proporcionado. Cita secciones, capítulos o páginas relevantes cuando aplique.
3. Para fórmulas matemáticas o científicas, usa siempre sintaxis LaTeX estándar delimitada por $...$ o $$...$$.
4. Si una consulta no se puede responder a partir del material proporcionado, acláralo honestamente y complementa con conocimientos académicos generales advirtiendo dicha distinción.`

type Service interface {
	Chat(ctx context.Context, userID string, req ChatRequest) (*ChatResponse, error)
	StreamChat(ctx context.Context, userID string, req ChatRequest, onChunk func(chunk string) error) error
	Resumir(ctx context.Context, userID string, req ResumenRequest) (*ResumenResponse, error)
	GenerarFlashcards(ctx context.Context, userID string, req FlashcardsRequest) (*FlashcardsResponse, error)
	GenerarQuiz(ctx context.Context, userID string, req QuizRequest) (*QuizResponse, error)
	ExplicarSeleccion(ctx context.Context, userID string, req ExplicarRequest) (*ExplicarResponse, error)
	ValidateKey(ctx context.Context, apiKey string) error
	ParseStudyPlan(ctx context.Context, userID string, fileBytes []byte, mimeType string, textContent string, customKey ...string) (*ParseStudyPlanResponse, error)
}

type service struct {
	client        GeminiClient
	materialsRepo materials.Repository
	storage       storage.StorageService
	authRepo      auth.Repository
}

func NewService(
	client GeminiClient,
	materialsRepo materials.Repository,
	storage storage.StorageService,
	authRepo auth.Repository,
) Service {
	return &service{
		client:        client,
		materialsRepo: materialsRepo,
		storage:       storage,
		authRepo:      authRepo,
	}
}

func (s *service) getEffectiveKey(ctx context.Context, userID string, customKey ...string) (string, error) {
	if len(customKey) > 0 && strings.TrimSpace(customKey[0]) != "" {
		return strings.TrimSpace(customKey[0]), nil
	}
	if userID != "" && s.authRepo != nil {
		user, err := s.authRepo.FindByID(userID)
		if err == nil && user != nil && strings.TrimSpace(user.GeminiAPIKey) != "" {
			return strings.TrimSpace(user.GeminiAPIKey), nil
		}
	}
	return "", fmt.Errorf("GEMINI_KEY_REQUIRED: Debes configurar tu clave de API de Google Gemini en tu perfil para usar el copiloto de IA.")
}

func (s *service) getEffectiveKeyForPlan(ctx context.Context, userID string, customKey ...string) string {
	if len(customKey) > 0 && strings.TrimSpace(customKey[0]) != "" {
		return strings.TrimSpace(customKey[0])
	}
	if userID != "" && s.authRepo != nil {
		user, err := s.authRepo.FindByID(userID)
		if err == nil && user != nil && strings.TrimSpace(user.GeminiAPIKey) != "" {
			return strings.TrimSpace(user.GeminiAPIKey)
		}
	}
	// Si el usuario no tiene clave personal, usa automáticamente la del servidor (.env)
	return ""
}

func (s *service) ValidateKey(ctx context.Context, apiKey string) error {
	return s.client.ValidateKey(ctx, apiKey)
}

func (s *service) prepareContext(ctx context.Context, userID string, materialID *string) ([]Part, error) {
	var parts []Part

	hasMaterial := materialID != nil && *materialID != ""

	if !hasMaterial {
		return nil, fmt.Errorf("el copiloto de IA requiere un material de estudio (PDF) seleccionado para fundamentar las respuestas en la bibliografía oficial")
	}

	mat, err := s.materialsRepo.GetByID(ctx, *materialID)
	if err != nil {
		return nil, fmt.Errorf("material de estudio no encontrado: %w", err)
	}

	// Blindaje Multi-Tenant: Validar pertenencia del material
	if mat.UsuarioID != "" && userID != "" && mat.UsuarioID != userID {
		return nil, fmt.Errorf("no tienes permiso para consultar este material de estudio")
	}

	filePath := s.storage.GetFilePath(mat.ArchivoKey)
	fileBytes, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("no se pudo leer el archivo del material: %w", err)
	}

	mimeType := mat.MimeType
	if mimeType == "" {
		mimeType = "application/pdf"
	}

	parts = append(parts, Part{
		InlineData: FileToInlineData(fileBytes, mimeType),
	})
	parts = append(parts, Part{
		Text: fmt.Sprintf("Documento oficial de estudio / cátedra: \"%s\" (Categoría: %s). Basa todas tus respuestas, resúmenes, explicaciones y preguntas de examen rigurosamente en este material.", mat.Titulo, mat.Categoria),
	})

	return parts, nil
}

func (s *service) Chat(ctx context.Context, userID string, req ChatRequest) (*ChatResponse, error) {
	key, err := s.getEffectiveKey(ctx, userID)
	if err != nil {
		return nil, err
	}

	contextParts, err := s.prepareContext(ctx, userID, req.MaterialID)
	if err != nil {
		return nil, err
	}

	var contents []Content

	// Historial previo
	for _, msg := range req.Historial {
		contents = append(contents, Content{
			Role:  msg.Role,
			Parts: []Part{{Text: msg.Content}},
		})
	}

	// Mensaje actual con contexto
	currentParts := append(contextParts, Part{Text: req.Mensaje})
	contents = append(contents, Content{
		Role:  "user",
		Parts: currentParts,
	})

	answer, tokens, err := s.client.Generate(ctx, AcademicSystemPrompt, contents, false, key)
	if err != nil {
		return nil, err
	}

	return &ChatResponse{
		Respuesta:        answer,
		Modelo:           DefaultGeminiModel,
		TokensUtilizados: tokens,
	}, nil
}

func (s *service) StreamChat(ctx context.Context, userID string, req ChatRequest, onChunk func(chunk string) error) error {
	key, err := s.getEffectiveKey(ctx, userID)
	if err != nil {
		return err
	}

	contextParts, err := s.prepareContext(ctx, userID, req.MaterialID)
	if err != nil {
		return err
	}

	var contents []Content
	for _, msg := range req.Historial {
		contents = append(contents, Content{
			Role:  msg.Role,
			Parts: []Part{{Text: msg.Content}},
		})
	}

	currentParts := append(contextParts, Part{Text: req.Mensaje})
	contents = append(contents, Content{
		Role:  "user",
		Parts: currentParts,
	})

	_, err = s.client.StreamGenerate(ctx, AcademicSystemPrompt, contents, onChunk, key)
	return err
}

func (s *service) Resumir(ctx context.Context, userID string, req ResumenRequest) (*ResumenResponse, error) {
	key, err := s.getEffectiveKey(ctx, userID)
	if err != nil {
		return nil, err
	}

	contextParts, err := s.prepareContext(ctx, userID, req.MaterialID)
	if err != nil {
		return nil, err
	}

	if req.Texto != nil && *req.Texto != "" {
		contextParts = append(contextParts, Part{Text: fmt.Sprintf("Texto a resumir:\n%s", *req.Texto)})
	}

	prompt := fmt.Sprintf(`Analiza el material provisto y genera un resumen estructurado con formato JSON estricto.
Formato solicitado: %s
Longitud: %s

Responde ÚNICAMENTE con el siguiente esquema JSON:
{
  "titulo": "Título descriptivo del resumen",
  "resumen": "Síntesis clara de los puntos esenciales",
  "conceptos_clave": ["concepto 1", "concepto 2"],
  "formulas_teoremas": ["fórmula o teorema 1 en LaTeX", "fórmula 2"],
  "tips_examen": ["tip de evaluación 1", "pregunta típica de examen"]
}`, req.Formato, req.Longitud)

	contents := []Content{
		{
			Role:  "user",
			Parts: append(contextParts, Part{Text: prompt}),
		},
	}

	rawJSON, _, err := s.client.Generate(ctx, AcademicSystemPrompt, contents, true, key)
	if err != nil {
		return nil, err
	}

	var result ResumenResponse
	cleaned := CleanJSONResponse(rawJSON)
	if err := json.Unmarshal([]byte(cleaned), &result); err != nil {
		return nil, fmt.Errorf("error al procesar respuesta estructurada: %w (raw: %s)", err, rawJSON)
	}

	return &result, nil
}

func (s *service) GenerarFlashcards(ctx context.Context, userID string, req FlashcardsRequest) (*FlashcardsResponse, error) {
	key, err := s.getEffectiveKey(ctx, userID)
	if err != nil {
		return nil, err
	}

	contextParts, err := s.prepareContext(ctx, userID, req.MaterialID)
	if err != nil {
		return nil, err
	}

	if req.TextoAdicional != nil && *req.TextoAdicional != "" {
		contextParts = append(contextParts, Part{Text: *req.TextoAdicional})
	}

	cantidad := req.Cantidad
	if cantidad <= 0 {
		cantidad = 6
	}

	prompt := fmt.Sprintf(`A partir del material analizado, genera exactamente %d flashcards para Active Recall (repetición espaciada).
Enfoque: %s

Responde ÚNICAMENTE con el siguiente esquema JSON:
{
  "flashcards": [
    {
      "frente": "Pregunta conceptual clara, problema o definición a completar",
      "dorso": "Respuesta concisa, precisa y explicativa",
      "dificultad": "FACIL" | "MEDIA" | "DIFICIL",
      "categoria": "Subtema o Unidad"
    }
  ]
}`, cantidad, req.Enfoque)

	contents := []Content{
		{
			Role:  "user",
			Parts: append(contextParts, Part{Text: prompt}),
		},
	}

	rawJSON, _, err := s.client.Generate(ctx, AcademicSystemPrompt, contents, true, key)
	if err != nil {
		return nil, err
	}

	var parsed struct {
		Flashcards []FlashcardItem `json:"flashcards"`
	}
	cleaned := CleanJSONResponse(rawJSON)
	if err := json.Unmarshal([]byte(cleaned), &parsed); err != nil {
		return nil, fmt.Errorf("error al procesar flashcards generadas: %w", err)
	}

	return &FlashcardsResponse{
		Flashcards: parsed.Flashcards,
		Total:      len(parsed.Flashcards),
	}, nil
}

func (s *service) GenerarQuiz(ctx context.Context, userID string, req QuizRequest) (*QuizResponse, error) {
	key, err := s.getEffectiveKey(ctx, userID)
	if err != nil {
		return nil, err
	}

	contextParts, err := s.prepareContext(ctx, userID, req.MaterialID)
	if err != nil {
		return nil, err
	}

	cantidad := req.CantidadPreguntas
	if cantidad <= 0 {
		cantidad = 5
	}

	prompt := fmt.Sprintf(`Genera un cuestionario de autoevaluación / simulacro de examen tipo múltiple choice con %d preguntas.
Cada pregunta debe tener exactamente 4 opciones de respuesta y solo 1 opción correcta.
Incluye una justificación pedagógica en "explicacion".

Responde ÚNICAMENTE con el siguiente esquema JSON:
{
  "titulo": "Simulacro de Evaluación: [Tema]",
  "preguntas": [
    {
      "id": 1,
      "pregunta": "¿Enunciado de la pregunta?",
      "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "indice_correcta": 0,
      "explicacion": "Por qué la opción seleccionada es la correcta..."
    }
  ]
}`, cantidad)

	contents := []Content{
		{
			Role:  "user",
			Parts: append(contextParts, Part{Text: prompt}),
		},
	}

	rawJSON, _, err := s.client.Generate(ctx, AcademicSystemPrompt, contents, true, key)
	if err != nil {
		return nil, err
	}

	var result QuizResponse
	cleaned := CleanJSONResponse(rawJSON)
	if err := json.Unmarshal([]byte(cleaned), &result); err != nil {
		return nil, fmt.Errorf("error al decodificar quiz: %w", err)
	}
	result.Total = len(result.Preguntas)

	return &result, nil
}

func (s *service) ExplicarSeleccion(ctx context.Context, userID string, req ExplicarRequest) (*ExplicarResponse, error) {
	key, err := s.getEffectiveKey(ctx, userID)
	if err != nil {
		return nil, err
	}

	var instruction string
	switch req.Accion {
	case "SIMPLIFICAR":
		instruction = "Explica el siguiente fragmento de forma extremadamente simple, con palabras cotidianas y una analogía de la vida real."
	case "EJEMPLO":
		instruction = "Proporciona un ejemplo práctico, numérico o de caso de estudio aplicado al siguiente concepto."
	case "PASO_A_PASO":
		instruction = "Desglosa la lógica, deducción o algoritmo del siguiente texto en pasos numerados claros."
	case "LATEX":
		instruction = "Convierte cualquier fórmula o expresión matemática presente en el texto a sintaxis LaTeX estándar ($...$)."
	default:
		instruction = "Explica con rigor pedagógico el siguiente texto académico."
	}

	prompt := fmt.Sprintf("%s\n\nTexto a analizar:\n\"%s\"", instruction, req.Texto)
	contents := []Content{
		{
			Role:  "user",
			Parts: []Part{{Text: prompt}},
		},
	}

	answer, _, err := s.client.Generate(ctx, AcademicSystemPrompt, contents, false, key)
	if err != nil {
		return nil, err
	}

	return &ExplicarResponse{
		Resultado: answer,
		Accion:    req.Accion,
	}, nil
}

func (s *service) ParseStudyPlan(ctx context.Context, userID string, fileBytes []byte, mimeType string, textContent string, customKey ...string) (*ParseStudyPlanResponse, error) {
	key := s.getEffectiveKeyForPlan(ctx, userID, customKey...)

	var parts []Part
	if len(fileBytes) > 0 {
		if mimeType == "" {
			mimeType = "application/pdf"
		}
		parts = append(parts, Part{
			InlineData: FileToInlineData(fileBytes, mimeType),
		})
		parts = append(parts, Part{
			Text: "Analiza exhaustivamente el documento adjunto que contiene el plan de estudios / malla curricular oficial de la carrera universitaria.",
		})
	}

	if strings.TrimSpace(textContent) != "" {
		parts = append(parts, Part{
			Text: fmt.Sprintf("Texto complementario o copiado del plan de estudios:\n%s", strings.TrimSpace(textContent)),
		})
	}

	if len(parts) == 0 {
		return nil, fmt.Errorf("debes proporcionar un archivo (PDF o imagen) o el texto del plan de estudios")
	}

	prompt := `Eres un experto académico universitario de la plataforma "miEstudio". Tu tarea es extraer con máxima precisión el plan de estudios y la malla curricular completa a partir del documento o texto provisto.

Reglas estrictas de extracción:
1. Extrae TODAS las materias o asignaturas del plan sin omitir ninguna.
2. Determina el año académico como número entero (1, 2, 3, 4, 5, etc.).
3. Identifica el cuatrimestre o régimen de cada materia con mucha atención:
   - "ANUAL": Asígnalo si la materia dura todo el año lectivo. Busca indicadores en columnas como "Régimen", "Período" o "Duración" marcados como "A", "Anual", "Régimen Anual", o si la materia no está asignada a un cuatrimestre específico pero abarca todo el año académico (materias troncales anuales como Análisis Matemático, Álgebra, Física, etc.).
   - "1C": Materias del primer cuatrimestre ("1°C", "1º Cuatrimestre", "1").
   - "2C": Materias del segundo cuatrimestre ("2°C", "2º Cuatrimestre", "2").
   - IMPORTANTE: No marques todo como "1C" por defecto. Si una materia es anual o abarca ambos períodos, márcala expresamente como "ANUAL".
4. Asigna un "temp_id" único para cada materia (ej: "m_1", "m_2", "m_3", ...).
5. Extrae el "codigo" de la materia si figura (ej: "95.01", "CB01"), o si no figura déjalo vacío o usa una abreviatura breve.
6. Extrae o deduce la modalidad: "PRESENCIAL", "VIRTUAL" o "HIBRIDA" (por defecto "PRESENCIAL").
7. Cargas horarias: extrae horas totales o semanales en enteros si figuran, o null si no están especificadas.
8. Correlatividades (MUY IMPORTANTE):
   - "correlativas_cursar": array con los nombres exactos o códigos de las materias que se deben haber cursado/regularizado antes de cursar esta materia.
   - "correlativas_rendir": array con los nombres exactos o códigos de las materias aprobadas con final requeridas para rendir el final de esta materia.
   Si en el plan las correlatividades no distinguen cursar de rendir, coloca los mismos nombres en ambas listas.
9. "carrera_sugerida": Nombre oficial de la carrera si figura en el documento.
10. "duracion_anios": Número entero indicando la duración en años del plan (año máximo).
11. "total_materias": Número total de materias extraídas.

Responde ÚNICAMENTE con JSON estricto con el siguiente esquema:
{
  "carrera_sugerida": "Nombre de la Carrera",
  "total_materias": 40,
  "duracion_anios": 5,
  "notas": "Comentarios breves sobre el plan",
  "materias": [
    {
      "temp_id": "m_1",
      "codigo": "101",
      "nombre": "Análisis Matemático I",
      "anio": 1,
      "cuatrimestre": "ANUAL",
      "modalidad": "PRESENCIAL",
      "carga_horaria_total": 160,
      "carga_horaria_semanal": 5,
      "correlativas_cursar": [],
      "correlativas_rendir": []
    },
    {
      "temp_id": "m_2",
      "codigo": "102",
      "nombre": "Informática I",
      "anio": 1,
      "cuatrimestre": "1C",
      "modalidad": "PRESENCIAL",
      "carga_horaria_total": 64,
      "carga_horaria_semanal": 4,
      "correlativas_cursar": [],
      "correlativas_rendir": []
    }
  ]
}`

	contents := []Content{
		{
			Role:  "user",
			Parts: append(parts, Part{Text: prompt}),
		},
	}

	rawJSON, _, err := s.client.Generate(ctx, "Eres un extractor de mallas curriculares universitarias.", contents, true, key)
	if err != nil {
		return nil, err
	}

	var result ParseStudyPlanResponse
	cleaned := CleanJSONResponse(rawJSON)
	if err := json.Unmarshal([]byte(cleaned), &result); err != nil {
		return nil, fmt.Errorf("error al decodificar plan de estudio extraído por la IA: %w (raw: %s)", err, rawJSON)
	}

	if result.TotalMaterias == 0 {
		result.TotalMaterias = len(result.Materias)
	}
	if result.DuracionAnios == 0 {
		maxAnio := 1
		for _, m := range result.Materias {
			if m.Anio > maxAnio {
				maxAnio = m.Anio
			}
		}
		result.DuracionAnios = maxAnio
	}

	return &result, nil
}
