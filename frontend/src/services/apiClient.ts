/**
 * Cliente HTTP Base para comunicación con el Backend Go.
 * Soporta configuración mediante variables de entorno (VITE_API_URL).
 * Incluye detección de conectividad y fallback inteligente para desarrollo sin backend activo.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const FORCE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(isFormData = false): HeadersInit {
    const headers: Record<string, string> = {
      Accept: 'application/json'
    };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    // Token de autenticación si estuviese disponible
    const token = localStorage.getItem('miestudio-token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Carrera activa seleccionada para aislar datos académicos
    const activeCarreraId = localStorage.getItem('miestudio-active-carrera');
    if (activeCarreraId) {
      headers['X-Active-Carrera-ID'] = activeCarreraId;
    }

    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (FORCE_MOCKS) {
      throw new Error('MODO_MOCKS_ACTIVADO');
    }

    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const isFormData = options.body instanceof FormData;
    const requestHeaders: Record<string, string> = {
      ...(this.getHeaders(isFormData) as Record<string, string>),
      ...((options.headers as Record<string, string>) || {})
    };

    if (isFormData) {
      delete requestHeaders['Content-Type'];
      delete requestHeaders['content-type'];
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: requestHeaders
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));

        // Registrar detalle técnico en consola para desarrollo sin exponer cadenas crudas al usuario
        if (errorBody.details) {
          console.error(`[apiClient ${response.status}] ${url}:`, errorBody.details);
        }

        const defaultMsg =
          response.status === 400
            ? 'Los datos enviados no son válidos. Por favor, revisá la información ingresada.'
            : response.status === 401
            ? 'El correo electrónico o la contraseña son incorrectos, o tu sesión ha expirado.'
            : response.status === 403
            ? 'No tenés permisos para realizar esta acción.'
            : response.status === 404
            ? 'El recurso solicitado no fue encontrado.'
            : response.status === 413
            ? 'El archivo supera el tamaño máximo permitido (máx. 50 MB).'
            : response.status >= 500
            ? 'Ocurrió un inconveniente temporal en el servidor. Por favor, intentá nuevamente.'
            : `Error en la solicitud (${response.status})`;

        let userMsg = errorBody.error || errorBody.message || defaultMsg;

        // Limpieza de mensajes técnicos históricos a redacción empática y natural
        const lower = userMsg.toLowerCase();
        if (lower.includes('credenciales') || lower.includes('invalid credentials')) {
          userMsg = 'El correo electrónico o la contraseña son incorrectos. Por favor, verificalos e intentá nuevamente.';
        } else if (lower.includes('record not found')) {
          userMsg = 'No se encontró la información solicitada.';
        }

        throw new Error(userMsg);
      }

      // Si es 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (err: unknown) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        console.info(
          `[apiClient] Backend Go en ${this.baseUrl} no detectado o fuera de línea.`
        );
        throw new Error('No pudimos conectar con el servidor. Por favor, comprobá tu conexión a internet.');
      }
      throw err;
    }
  }

  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  }

  put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  }

  patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  }

  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
