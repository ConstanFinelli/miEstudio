package ai

type ChatMessage struct {
	Role    string `json:"role"` // "user" o "model"
	Content string `json:"content"`
}

type ChatRequest struct {
	MateriaID  *string       `json:"materia_id,omitempty"`
	MaterialID *string       `json:"material_id,omitempty"`
	ApunteID   *string       `json:"apunte_id,omitempty"`
	Mensaje    string        `json:"mensaje"`
	Historial  []ChatMessage `json:"historial,omitempty"`
}

type ChatResponse struct {
	Respuesta        string `json:"respuesta"`
	Modelo           string `json:"modelo"`
	TokensUtilizados int    `json:"tokens_utilizados,omitempty"`
}

type ResumenRequest struct {
	MaterialID *string `json:"material_id,omitempty"`
	ApunteID   *string `json:"apunte_id,omitempty"`
	Texto      *string `json:"texto,omitempty"`
	Formato    string  `json:"formato,omitempty"`  // "BULLET_POINTS" | "CONCEPTUAL" | "EXAMEN"
	Longitud   string  `json:"longitud,omitempty"` // "CORTO" | "MEDIO" | "DETALLADO"
}

type ResumenResponse struct {
	Titulo          string   `json:"titulo"`
	Resumen         string   `json:"resumen"`
	ConceptosClave  []string `json:"conceptos_clave"`
	FormulasTeoremas []string `json:"formulas_teoremas,omitempty"`
	TipsExamen      []string `json:"tips_examen,omitempty"`
}

type FlashcardItem struct {
	Frente     string `json:"frente"`
	Dorso      string `json:"dorso"`
	Dificultad string `json:"dificultad"` // "FACIL" | "MEDIA" | "DIFICIL"
	Categoria  string `json:"categoria,omitempty"`
}

type FlashcardsRequest struct {
	MaterialID     *string `json:"material_id,omitempty"`
	ApunteID       *string `json:"apunte_id,omitempty"`
	TextoAdicional *string `json:"texto_adicional,omitempty"`
	Cantidad       int     `json:"cantidad,omitempty"` // default 6
	Enfoque        string  `json:"enfoque,omitempty"`  // "TEORICO" | "PRACTICO" | "MIXTO"
}

type FlashcardsResponse struct {
	Flashcards []FlashcardItem `json:"flashcards"`
	Total      int             `json:"total"`
}

type QuizPregunta struct {
	ID             int      `json:"id"`
	Pregunta       string   `json:"pregunta"`
	Opciones       []string `json:"opciones"`
	IndiceCorrecta int      `json:"indice_correcta"`
	Explicacion    string   `json:"explicacion"`
}

type QuizRequest struct {
	MateriaID         *string `json:"materia_id,omitempty"`
	MaterialID        *string `json:"material_id,omitempty"`
	ApunteID          *string `json:"apunte_id,omitempty"`
	CantidadPreguntas int     `json:"cantidad_preguntas,omitempty"` // default 5
}

type QuizResponse struct {
	Titulo    string         `json:"titulo"`
	Preguntas []QuizPregunta `json:"preguntas"`
	Total     int            `json:"total"`
}

type ExplicarRequest struct {
	Texto  string `json:"texto"`
	Accion string `json:"accion"` // "SIMPLIFICAR" | "EJEMPLO" | "PASO_A_PASO" | "LATEX"
}

type ExplicarResponse struct {
	Resultado string `json:"resultado"`
	Accion    string `json:"accion"`
}
