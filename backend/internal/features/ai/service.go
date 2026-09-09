package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"miestudio/backend/internal/features/materials"
	"miestudio/backend/internal/features/notes"
	"miestudio/backend/internal/storage"
)

const AcademicSystemPrompt = `Eres el Asistente Académico Inteligente de "miEstudio", una plataforma universitaria de estudio activo.
Tu función es ayudar al estudiante a comprender en profundidad el material de su carrera, resolver dudas con rigor conceptual y claridad pedagógica.
Directrices:
1. Sé conciso, claro y directo.
2. Si el usuario te proporciona un documento PDF o apunte, fundamenta tus respuestas en dicho texto. Cita secciones o temas relevantes.
3. Para fórmulas matemáticas o científicas, usa siempre sintaxis LaTeX estándar delimitada por $...$ o $$...$$.
4. Si no tienes certeza sobre algo o la respuesta no se desprende del material proporcionado, acláralo honestamente.`

type Service interface {
	Chat(ctx context.Context, userID string, req ChatRequest) (*ChatResponse, error)
	StreamChat(ctx context.Context, userID string, req ChatRequest, onChunk func(chunk string) error) error
	Resumir(ctx context.Context, userID string, req ResumenRequest) (*ResumenResponse, error)
	GenerarFlashcards(ctx context.Context, userID string, req FlashcardsRequest) (*FlashcardsResponse, error)
	GenerarQuiz(ctx context.Context, userID string, req QuizRequest) (*QuizResponse, error)
	ExplicarSeleccion(ctx context.Context, req ExplicarRequest) (*ExplicarResponse, error)
}

type service struct {
	client        GeminiClient
	materialsRepo materials.Repository
	notesRepo     notes.Repository
	storage       storage.StorageService
}

func NewService(
	client GeminiClient,
	materialsRepo materials.Repository,
	notesRepo notes.Repository,
	storage storage.StorageService,
) Service {
	return &service{
		client:        client,
		materialsRepo: materialsRepo,
		notesRepo:     notesRepo,
		storage:       storage,
	}
}

func (s *service) prepareContext(ctx context.Context, userID string, materialID, apunteID *string) ([]Part, error) {
	var parts []Part

	hasMaterial := materialID != nil && *materialID != ""
	hasApunte := apunteID != nil && *apunteID != ""

	if !hasMaterial && !hasApunte {
		return nil, fmt.Errorf("el copiloto requiere un apunte o material de estudio (PDF) para contextualizar la IA y evitar usos innecesarios")
	}

	// 1. Adjuntar PDF si se proporcionó materialID
	if hasMaterial {
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
			Text: fmt.Sprintf("Documento de referencia: \"%s\" (Categoría: %s)", mat.Titulo, mat.Categoria),
		})
	}

	// 2. Adjuntar Apunte si se proporcionó apunteID
	if hasApunte {
		note, err := s.notesRepo.GetByID(ctx, *apunteID)
		if err != nil {
			return nil, fmt.Errorf("apunte no encontrado: %w", err)
		}

		// Blindaje Multi-Tenant: Validar pertenencia del apunte
		if note.UsuarioID != "" && userID != "" && note.UsuarioID != userID {
			return nil, fmt.Errorf("no tienes permiso para consultar este apunte")
		}

		// Si no hay PDF complementario y el apunte está vacío, requerir contenido para no gastar IA
		if strings.TrimSpace(note.Contenido) == "" && !hasMaterial {
			return nil, fmt.Errorf("el apunte seleccionado no contiene texto para analizar. Añade contenido a tu apunte o selecciona un PDF complementario")
		}

		noteContext := fmt.Sprintf("Apunte de referencia: \"%s\"\nContenido del apunte:\n%s", note.Titulo, note.Contenido)
		parts = append(parts, Part{Text: noteContext})
	}

	return parts, nil
}

func (s *service) Chat(ctx context.Context, userID string, req ChatRequest) (*ChatResponse, error) {
	contextParts, err := s.prepareContext(ctx, userID, req.MaterialID, req.ApunteID)
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

	answer, tokens, err := s.client.Generate(ctx, AcademicSystemPrompt, contents, false)
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
	contextParts, err := s.prepareContext(ctx, userID, req.MaterialID, req.ApunteID)
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

	_, err = s.client.StreamGenerate(ctx, AcademicSystemPrompt, contents, onChunk)
	return err
}

func (s *service) Resumir(ctx context.Context, userID string, req ResumenRequest) (*ResumenResponse, error) {
	contextParts, err := s.prepareContext(ctx, userID, req.MaterialID, req.ApunteID)
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

	rawJSON, _, err := s.client.Generate(ctx, AcademicSystemPrompt, contents, true)
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
	contextParts, err := s.prepareContext(ctx, userID, req.MaterialID, req.ApunteID)
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

	rawJSON, _, err := s.client.Generate(ctx, AcademicSystemPrompt, contents, true)
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
	contextParts, err := s.prepareContext(ctx, userID, req.MaterialID, req.ApunteID)
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

	rawJSON, _, err := s.client.Generate(ctx, AcademicSystemPrompt, contents, true)
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

func (s *service) ExplicarSeleccion(ctx context.Context, req ExplicarRequest) (*ExplicarResponse, error) {
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

	answer, _, err := s.client.Generate(ctx, AcademicSystemPrompt, contents, false)
	if err != nil {
		return nil, err
	}

	return &ExplicarResponse{
		Resultado: answer,
		Accion:    req.Accion,
	}, nil
}
