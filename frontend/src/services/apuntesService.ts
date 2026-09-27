import { apiClient } from "./apiClient";
import type { ApunteDTO } from "./types";
import type { ApunteNota } from "../types/academic";
import { apunteMapper } from "./mappers";
import { mockApuntes } from "../data/mockData";
import { isMocksEnabled } from "../config/mockConfig";

let localApuntes: ApunteNota[] = isMocksEnabled() ? [...mockApuntes] : [];

export const apuntesService = {
  async getApuntes(materiaId?: string): Promise<ApunteNota[]> {
    try {
      const endpoint = materiaId
        ? `/apuntes?materia_id=${materiaId}`
        : "/apuntes";
      const dtos = await apiClient.get<ApunteDTO[]>(endpoint);
      return dtos.map((dto) => apunteMapper.toApunte(dto));
    } catch {
      if (materiaId) {
        return localApuntes.filter((a) => a.materiaId === materiaId);
      }
      return [...localApuntes];
    }
  },

  async getApunteById(id: string): Promise<ApunteNota | null> {
    try {
      const dto = await apiClient.get<ApunteDTO>(`/apuntes/${id}`);
      return apunteMapper.toApunte(dto);
    } catch {
      const found = localApuntes.find((a) => a.id === id);
      return found || null;
    }
  },

  async createApunte(apunte: Partial<ApunteNota>): Promise<ApunteNota> {
    try {
      const dtoBody = apunteMapper.toDTO(apunte);
      const createdDTO = await apiClient.post<ApunteDTO>("/apuntes", dtoBody);
      const created = apunteMapper.toApunte(createdDTO, apunte.materiaNombre);
      localApuntes.unshift(created);
      return created;
    } catch {
      const wordCount = apunte.contenidoMarkdown
        ? apunte.contenidoMarkdown.trim().split(/\s+/).length
        : 0;
      const newApunte: ApunteNota = {
        id: `nota-${Date.now()}`,
        materiaId: apunte.materiaId || "mat-1",
        materiaNombre: apunte.materiaNombre || "Sistemas Distribuidos",
        carpeta: apunte.carpeta || "General",
        titulo: apunte.titulo || "Nuevo Apunte",
        resumen:
          apunte.resumen ||
          (apunte.contenidoMarkdown
            ? apunte.contenidoMarkdown.slice(0, 100) + "..."
            : ""),
        contenidoMarkdown:
          apunte.contenidoMarkdown ||
          "# Nuevo Apunte\n\nComienza a escribir aquí...",
        tags: apunte.tags || ["teoria"],
        fechaModificacion: new Date().toISOString(),
        tiempoLecturaMin: Math.max(1, Math.ceil(wordCount / 200)),
        palabras: wordCount,
      };
      localApuntes.unshift(newApunte);
      return newApunte;
    }
  },

  async updateApunte(
    id: string,
    updates: Partial<ApunteNota>,
  ): Promise<ApunteNota> {
    try {
      const dtoBody = apunteMapper.toDTO(updates);
      const updatedDTO = await apiClient.put<ApunteDTO>(
        `/apuntes/${id}`,
        dtoBody,
      );
      const updated = apunteMapper.toApunte(updatedDTO, updates.materiaNombre);
      localApuntes = localApuntes.map((a) =>
        a.id === id ? { ...a, ...updated } : a,
      );
      return updated;
    } catch {
      localApuntes = localApuntes.map((a) => {
        if (a.id === id) {
          const content = updates.contenidoMarkdown ?? a.contenidoMarkdown;
          const wordCount = content.trim().split(/\s+/).length;
          return {
            ...a,
            ...updates,
            fechaModificacion: new Date().toISOString(),
            palabras: wordCount,
            tiempoLecturaMin: Math.max(1, Math.ceil(wordCount / 200)),
          };
        }
        return a;
      });
      const found = localApuntes.find((a) => a.id === id);
      if (!found) throw new Error(`Apunte con ID ${id} no encontrado`);
      return found;
    }
  },

  async deleteApunte(id: string): Promise<void> {
    try {
      await apiClient.delete(`/apuntes/${id}`);
    } catch {
      // noop
    }
    localApuntes = localApuntes.filter((a) => a.id !== id);
  },

  async uploadImage(file: File): Promise<{ url: string; key: string; filename: string }> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('file', file);

      const res = await apiClient.post<{ data?: { url: string; key: string; filename: string }; url?: string; key?: string; filename?: string }>(
        '/apuntes/imagenes',
        formData
      );

      const data = res.data || res;
      if (data && data.url) {
        return {
          url: data.url,
          key: data.key || '',
          filename: data.filename || file.name
        };
      }
      throw new Error('Respuesta inválida del servidor');
    } catch (err) {
      console.warn('Subida al servidor fallida o modo sin conexión. Convirtiendo a Data URL local...', err);
      // Fallback a Data URL en base64 para garantizar que la imagen siempre se inserte
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            url: reader.result as string,
            key: `local-${Date.now()}`,
            filename: file.name
          });
        };
        reader.onerror = () => reject(new Error('No se pudo leer el archivo de imagen.'));
        reader.readAsDataURL(file);
      });
    }
  },
};
