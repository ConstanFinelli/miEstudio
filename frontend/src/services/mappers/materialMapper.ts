import type { MaterialDTO } from '../types';
import type { MaterialEstudio } from '../../types/academic';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const getAuthenticatedFileUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('data:')) return url;
  const token = typeof window !== 'undefined' ? localStorage.getItem('miestudio-token') : null;
  if (!token) return url;
  if (url.includes('token=')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}token=${encodeURIComponent(token)}`;
};

export const materialMapper = {
  toMaterial(dto: MaterialDTO): MaterialEstudio {
    let fileUrl = dto.archivo_path;
    if (!fileUrl || (!fileUrl.startsWith('http') && !fileUrl.startsWith('blob:'))) {
      fileUrl = `${API_BASE_URL}/materiales/${dto.id}/archivo`;
    }

    fileUrl = getAuthenticatedFileUrl(fileUrl);

    return {
      id: dto.id,
      materiaId: dto.materia_id,
      titulo: dto.titulo,
      categoria: dto.categoria,
      unidad: dto.unidad || '',
      archivoNombre: dto.archivo_nombre_original,
      archivoUrl: fileUrl,
      tamanioBytes: dto.tamanio_bytes,
      cantPaginas: dto.cant_paginas ?? 1,
      fechaSubida: dto.created_at
        ? new Date(dto.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
        : new Date().toLocaleDateString('es-AR')
    };
  },

  toDTO(material: Partial<MaterialEstudio>): Partial<MaterialDTO> {
    return {
      id: material.id,
      materia_id: material.materiaId,
      titulo: material.titulo,
      categoria: material.categoria,
      unidad: material.unidad,
      archivo_nombre_original: material.archivoNombre,
      archivo_path: material.archivoUrl,
      tamanio_bytes: material.tamanioBytes,
      cant_paginas: material.cantPaginas
    };
  }
};
