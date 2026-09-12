import type { ApunteNota } from "../../../../types/academic";

export interface FolderSubfolderItem {
  name: string;
  count: number;
}

export interface FolderMateriaItem {
  id: string;
  nombre: string;
  codigo?: string;
  anio: number;
  cuatrimestre?: string;
  color?: string;
  count: number;
  subfolders: FolderSubfolderItem[];
}

export interface YearGroupItem {
  anio: number;
  label: string;
  materias: FolderMateriaItem[];
  totalNotes: number;
}

export interface FoldersSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
  selectedYear?: number | null;
  onSelectYear?: (year: number | null) => void;
  selectedFolder: string | null;
  onSelectFolder: (folder: string | null) => void;
  selectedSubFolder: string | null;
  onSelectSubFolder: (sub: string | null) => void;
  onOpenNoteModal?: (materiaId?: string) => void;
  notes?: ApunteNota[];
}
