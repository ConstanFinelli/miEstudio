/**
 * Utilidades para manejo de fechas locales académicas sin desfasajes de zona horaria (UTC vs Local).
 */

/**
 * Parsea una cadena de fecha (YYYY-MM-DD o ISO con T) garantizando que
 * represente el día calendario local exacto sin desfasajes de UTC a día previo.
 */
export const parseLocalDate = (dateStr?: string | null): Date | null => {
  if (!dateStr) return null;
  try {
    const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.trim();
    const parts = clean.split('-').map(Number);
    if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
      return new Date(dateStr);
    }
    return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  } catch {
    return null;
  }
};

/**
 * Calcula los días restantes para un evento respecto al inicio del día actual (00:00 hs local).
 * Retorna etiquetas humanizadas: 'Hoy', 'Mañana', 'Ayer', 'En X días', etc.
 */
export const getDaysRemaining = (dateStr?: string | null): string => {
  if (!dateStr) return 'Próximamente';
  const targetDate = parseLocalDate(dateStr);
  if (!targetDate) return 'Próximamente';

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetDay = targetDate.getTime();
  const diffDays = Math.round((targetDay - todayStart) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Mañana';
  if (diffDays === -1) return 'Ayer';
  if (diffDays < 0) return `Hace ${Math.abs(diffDays)} días`;
  return `En ${diffDays} días`;
};

/**
 * Formatea una fecha de evaluación con día de la semana, número, mes y horario.
 * Ej: "Jueves, 17 de septiembre, 19:00 hs"
 */
export const formatEvaluationDate = (dateStr?: string | null, horario?: string): string => {
  if (!dateStr) return 'Fecha pendiente';
  const d = parseLocalDate(dateStr);
  if (!d) return dateStr;

  try {
    const formatted = d.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    const cleanHorario = horario ? (horario.endsWith('hs') ? horario : `${horario} hs`) : '19:00 hs';
    return `${formatted.charAt(0).toUpperCase() + formatted.slice(1)}, ${cleanHorario}`;
  } catch {
    return dateStr;
  }
};

/**
 * Formatea una fecha corta.
 * Ej: "jue, 17 sept"
 */
export const formatShortDate = (dateStr?: string | null): string => {
  if (!dateStr) return 'Fecha pendiente';
  const d = parseLocalDate(dateStr);
  if (!d) return dateStr;

  try {
    return d.toLocaleDateString('es-AR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  } catch {
    return dateStr;
  }
};
