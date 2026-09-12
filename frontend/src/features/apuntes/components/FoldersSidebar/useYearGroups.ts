import { useMemo, useState, useEffect } from "react";
import type { ApunteNota, Materia } from "../../../../types/academic";
import type { FolderMateriaItem, YearGroupItem } from "./types";

const LOCAL_STORAGE_KEY = "miEstudio_apuntes_collapsed_years";

export const useYearGroups = (
  materias: Materia[],
  apuntes: ApunteNota[],
  selectedFolder: string | null
) => {
  // Distinct materias that have notes or are registered in the academic career
  const folderMaterias = useMemo<FolderMateriaItem[]>(() => {
    const list: FolderMateriaItem[] = [];

    materias.forEach((m) => {
      const matNotes = apuntes.filter(
        (a) => a.materiaId === m.id || a.materiaNombre === m.nombre
      );
      const subMap = new Map<string, number>();
      matNotes.forEach((a) => {
        const sub = a.carpeta || a.evaluacionNombre || "General";
        subMap.set(sub, (subMap.get(sub) || 0) + 1);
      });
      list.push({
        id: m.id,
        nombre: m.nombre,
        codigo: m.codigo,
        anio: m.anio ?? 1,
        cuatrimestre: m.cuatrimestre,
        color: m.color,
        count: matNotes.length,
        subfolders: Array.from(subMap.entries()).map(([name, count]) => ({
          name,
          count,
        })),
      });
    });

    // Also include any true orphan materias from existing notes not registered in carrera
    apuntes.forEach((a) => {
      const matchesRegisteredMateria = materias.some(
        (m) => m.id === a.materiaId || m.nombre === a.materiaNombre
      );
      if (
        !matchesRegisteredMateria &&
        a.materiaNombre &&
        a.materiaNombre.trim() !== "" &&
        a.materiaNombre !== "Materia" &&
        !list.some((item) => item.nombre === a.materiaNombre)
      ) {
        list.push({
          id: a.materiaId || a.materiaNombre,
          nombre: a.materiaNombre,
          anio: 0,
          count: apuntes.filter((x) => x.materiaNombre === a.materiaNombre).length,
          subfolders: [],
        });
      }
    });

    return list;
  }, [materias, apuntes]);

  // Group materias by academic year
  const yearGroups = useMemo<YearGroupItem[]>(() => {
    const groupsMap = new Map<number, YearGroupItem>();

    folderMaterias.forEach((item) => {
      const year = item.anio ?? 0;
      if (!groupsMap.has(year)) {
        groupsMap.set(year, {
          anio: year,
          label: year > 0 ? `${year}° Año` : "Otras Materias",
          materias: [],
          totalNotes: 0,
        });
      }
      const group = groupsMap.get(year)!;
      group.materias.push(item);
      group.totalNotes += item.count;
    });

    // Sort years: 1, 2, 3... and 0 at the end
    const sorted = Array.from(groupsMap.values()).sort((a, b) => {
      if (a.anio === 0) return 1;
      if (b.anio === 0) return -1;
      return a.anio - b.anio;
    });

    // Inside each year, sort materias: 1C first, then 2C, then Anual, then alphabetically by name
    sorted.forEach((grp) => {
      grp.materias.sort((a, b) => {
        const cuatriOrder: Record<string, number> = { "1C": 1, "2C": 2, Anual: 3 };
        const orderA = a.cuatrimestre ? cuatriOrder[a.cuatrimestre] || 4 : 4;
        const orderB = b.cuatrimestre ? cuatriOrder[b.cuatrimestre] || 4 : 4;
        if (orderA !== orderB) return orderA - orderB;
        return a.nombre.localeCompare(b.nombre);
      });
    });

    return sorted;
  }, [folderMaterias]);

  // Collapsed state for year folders (persisted in localStorage)
  const [collapsedYears, setCollapsedYears] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleYearCollapse = (anio: number) => {
    setCollapsedYears((prev) => {
      const key = String(anio);
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggleAllYears = () => {
    const anyExpanded = yearGroups.some((g) => !collapsedYears[String(g.anio)]);
    const next: Record<string, boolean> = {};
    if (anyExpanded) {
      yearGroups.forEach((g) => {
        next[String(g.anio)] = true;
      });
    }
    setCollapsedYears(next);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  // Ensure active materia's parent year is expanded when a materia is selected
  useEffect(() => {
    if (selectedFolder) {
      const mat = folderMaterias.find(
        (m) => m.nombre === selectedFolder || m.id === selectedFolder
      );
      if (mat) {
        const key = String(mat.anio ?? 0);
        if (collapsedYears[key]) {
          setCollapsedYears((prev) => {
            const next = { ...prev };
            delete next[key];
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
            } catch {}
            return next;
          });
        }
      }
    }
  }, [selectedFolder, folderMaterias, collapsedYears]);

  return {
    folderMaterias,
    yearGroups,
    collapsedYears,
    toggleYearCollapse,
    toggleAllYears,
  };
};
