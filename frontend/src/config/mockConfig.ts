/**
 * Configuración de Datos de Demostración (Mocks) para miEstudio.
 * 
 * -------------------------------------------------------------------------
 * ¿CÓMO ACTIVAR O DESACTIVAR LOS DATOS DE PRUEBA?
 * -------------------------------------------------------------------------
 * 1. En código: Cambia DEFAULT_ENABLE_MOCKS a true o false abajo.
 * 2. En el navegador: Abre la consola y escribe: window.toggleMocks()
 * 3. En la app: Presiona ⌘K y selecciona "Activar/Desactivar Datos de Prueba".
 */

export const DEFAULT_ENABLE_MOCKS = false; // <-- VARIABLE DE FÁCIL USO (false = inicia limpio, true = con datos de prueba)

const STORAGE_KEY = 'miestudio-enable-mocks';

export const isMocksEnabled = (): boolean => {
  if (typeof window === 'undefined') return DEFAULT_ENABLE_MOCKS;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    return stored === 'true';
  }
  return DEFAULT_ENABLE_MOCKS;
};

export const setMocksEnabled = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, String(enabled));
  window.location.reload();
};

export const toggleMocks = (): void => {
  setMocksEnabled(!isMocksEnabled());
};

// Acceso rápido desde la consola de desarrollador
if (typeof window !== 'undefined') {
  (window as unknown as { toggleMocks: typeof toggleMocks }).toggleMocks = () => {
    const nextState = !isMocksEnabled();
    setMocksEnabled(nextState);
    console.info(`[miEstudio] Datos de prueba ${nextState ? 'ACTIVADOS' : 'DESACTIVADOS'}. Recargando aplicación...`);
  };
}
