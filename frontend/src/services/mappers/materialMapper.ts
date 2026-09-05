import type { MaterialDTO } from '../types';
import type { MaterialEstudio } from '../../types/academic';

export const materialMapper = {
  toMaterial(dto: MaterialDTO): MaterialEstudio {
    return {
      id: dto.id,
      materiaId: dto.materia_id,
      titulo: dto.titulo,
      categoria: dto.categoria,
      archivoNombre: dto.archivo_nombre_original,
      archivoUrl: dto.archivo_path,
      tamanioBytes: dto.tamanio_bytes,
      cantPaginas: dto.cant_paginas ?? 1,
      fechaSubida: dto.created_at || new Date().toISOString()
    };
  },

  toDTO(material: Partial<MaterialEstudio>): Partial<MaterialDTO> {
    return {
      id: material.id,
      materia_id: material.materiaId,
      titulo: material.titulo,
      categoria: material.categoria,
      archivo_nombre_original: material.archivoNombre,
      archivo_path: material.archivoUrl,
      tamanio_bytes: material.tamanioBytes,
      cant_paginas: material.cantPaginas
    };
  }
};
