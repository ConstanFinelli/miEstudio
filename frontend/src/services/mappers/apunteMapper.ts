import type { ApunteDTO } from "../types";
import type { ApunteNota } from "../../types/academic";

export const apunteMapper = {
  toApunte(dto: ApunteDTO, fallbackMateriaNombre?: string): ApunteNota {
    const wordCount = dto.contenido
      ? dto.contenido.trim().split(/\s+/).length
      : 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const resolvedMateriaNombre =
      dto.materia_nombre ||
      dto.materia?.nombre ||
      fallbackMateriaNombre ||
      "Materia";

    return {
      id: dto.id,
      materiaId: dto.materia_id,
      materiaNombre: resolvedMateriaNombre,
      materiaCodigo: dto.materia?.codigo,
      carpeta: dto.carpeta || "General",
      titulo: dto.titulo,
      resumen:
        dto.resumen ||
        (dto.contenido ? dto.contenido.slice(0, 120) + "..." : ""),
      contenidoMarkdown: dto.contenido,
      tags: dto.etiquetas || [],
      fechaModificacion:
        dto.updated_at || dto.created_at || new Date().toISOString(),
      tiempoLecturaMin: readingTime,
      palabras: wordCount,
    };
  },

  toDTO(apunte: Partial<ApunteNota>): Partial<ApunteDTO> {
    return {
      id: apunte.id,
      materia_id: apunte.materiaId,
      titulo: apunte.titulo,
      contenido: apunte.contenidoMarkdown,
      carpeta: apunte.carpeta,
      resumen: apunte.resumen,
      etiquetas: apunte.tags,
    };
  },
};
