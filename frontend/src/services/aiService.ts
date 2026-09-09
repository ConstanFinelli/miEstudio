import { apiClient } from './apiClient';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ChatRequest {
  materia_id?: string;
  material_id?: string;
  apunte_id?: string;
  mensaje: string;
  historial?: ChatMessage[];
}

export interface ChatResponse {
  respuesta: string;
  modelo: string;
  tokens_utilizados?: number;
}

export interface ResumenRequest {
  material_id?: string;
  apunte_id?: string;
  texto?: string;
  formato?: 'BULLET_POINTS' | 'CONCEPTUAL' | 'EXAMEN';
  longitud?: 'CORTO' | 'MEDIO' | 'DETALLADO';
}

export interface ResumenResponse {
  titulo: string;
  resumen: string;
  conceptos_clave: string[];
  formulas_teoremas?: string[];
  tips_examen?: string[];
}

export interface FlashcardItem {
  frente: string;
  dorso: string;
  dificultad: 'FACIL' | 'MEDIA' | 'DIFICIL';
  categoria?: string;
}

export interface FlashcardsRequest {
  material_id?: string;
  apunte_id?: string;
  texto_adicional?: string;
  cantidad?: number;
  enfoque?: 'TEORICO' | 'PRACTICO' | 'MIXTO';
}

export interface FlashcardsResponse {
  flashcards: FlashcardItem[];
  total: number;
}

export interface QuizPregunta {
  id: number;
  pregunta: string;
  opciones: string[];
  indice_correcta: number;
  explicacion: string;
}

export interface QuizRequest {
  materia_id?: string;
  material_id?: string;
  apunte_id?: string;
  cantidad_preguntas?: number;
}

export interface QuizResponse {
  titulo: string;
  preguntas: QuizPregunta[];
  total: number;
}

export interface ExplicarRequest {
  texto: string;
  accion: 'SIMPLIFICAR' | 'EJEMPLO' | 'PASO_A_PASO' | 'LATEX';
}

export interface ExplicarResponse {
  resultado: string;
  accion: string;
}

export const aiService = {
  async chat(req: ChatRequest): Promise<ChatResponse> {
    const res = await apiClient.post<{ data: ChatResponse }>('/ai/chat', req);
    return res.data;
  },

  async resumir(req: ResumenRequest): Promise<ResumenResponse> {
    const res = await apiClient.post<{ data: ResumenResponse }>('/ai/resumir', req);
    return res.data;
  },

  async generarFlashcards(req: FlashcardsRequest): Promise<FlashcardsResponse> {
    const res = await apiClient.post<{ data: FlashcardsResponse }>('/ai/flashcards', req);
    return res.data;
  },

  async generarQuiz(req: QuizRequest): Promise<QuizResponse> {
    const res = await apiClient.post<{ data: QuizResponse }>('/ai/quiz', req);
    return res.data;
  },

  async explicarSeleccion(req: ExplicarRequest): Promise<ExplicarResponse> {
    const res = await apiClient.post<{ data: ExplicarResponse }>('/ai/explicar-seleccion', req);
    return res.data;
  },

  /**
   * Conexión streaming con Server-Sent Events (SSE) para chat en tiempo real
   */
  async streamChat(
    req: ChatRequest,
    onChunk: (chunk: string) => void,
    onFinish?: () => void,
    onError?: (err: Error) => void
  ): Promise<void> {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const token = localStorage.getItem('miestudio-token');

    try {
      const response = await fetch(`${baseUrl}/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(req)
      });

      if (!response.ok || !response.body) {
        throw new Error(`Error en streaming HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') {
              if (onFinish) onFinish();
              return;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.chunk) {
                onChunk(parsed.chunk);
              } else if (parsed.error && onError) {
                onError(new Error(parsed.error));
              }
            } catch {
              // Ignorar línea no JSON
            }
          }
        }
      }

      if (onFinish) onFinish();
    } catch (err: any) {
      if (onError) onError(err);
      else throw err;
    }
  }
};
