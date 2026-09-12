import React from "react";
import styles from "../FoldersSidebar.module.css";
import { ChevronDown, Folder, FolderOpen, Download } from "lucide-react";
import type { YearGroupItem } from "../types";
import type { ApunteNota, Materia } from "../../../../../types/academic";
import { exportMateriaNotesZip } from "../../../../../utils";
import { MateriaFolderItem } from "./MateriaFolderItem";

interface YearFolderGroupProps {
  year: YearGroupItem;
  isCollapsed: boolean;
  isSelected: boolean;
  selectedFolder: string | null;
  selectedSubFolder: string | null;
  onToggleCollapse: (anio: number) => void;
  onSelectYear: (anio: number) => void;
  onSelectFolder: (folder: string | null) => void;
  onSelectSubFolder: (sub: string | null) => void;
  onSetSelectedYear?: (year: number | null) => void;
  apuntes: ApunteNota[];
  materias: Materia[];
}

export const YearFolderGroup: React.FC<YearFolderGroupProps> = ({
  year,
  isCollapsed,
  isSelected,
  selectedFolder,
  selectedSubFolder,
  onToggleCollapse,
  onSelectYear,
  onSelectFolder,
  onSelectSubFolder,
  onSetSelectedYear,
  apuntes,
  materias,
}) => {
  const handleDownloadYearZip = (e: React.MouseEvent) => {
    e.stopPropagation();
    const yearNotes = apuntes.filter((a) => {
      const mat = materias.find(
        (m) => m.id === a.materiaId || m.nombre === a.materiaNombre
      );
      return year.anio === 0 ? !mat || !mat.anio : mat?.anio === year.anio;
    });
    exportMateriaNotesZip(
      `${year.label.replace(/[^a-zA-Z0-9]/g, "_")}_Apuntes`,
      yearNotes
    );
  };

  return (
    <div className={styles.yearGroup}>
      {/* Year Header / Parent Folder */}
      <div
        className={`${styles.yearGroupHeader} ${
          isSelected ? styles.yearGroupHeaderActive : ""
        }`}
        onClick={() => onSelectYear(year.anio)}
        title={`Ver todos los apuntes de ${year.label}`}
      >
        <div className={styles.yearTitleLeft}>
          <button
            type="button"
            className={styles.yearChevronBtn}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse(year.anio);
            }}
            title={isCollapsed ? "Expandir año" : "Colapsar año"}
          >
            <ChevronDown
              size={12}
              className={`${styles.chevron} ${
                isCollapsed ? styles.chevronCollapsed : ""
              }`}
            />
          </button>
          {isCollapsed ? (
            <Folder size={13} className={styles.yearFolderIcon} />
          ) : (
            <FolderOpen size={13} className={styles.yearFolderIcon} />
          )}
          <span className={styles.yearTitleText}>{year.label}</span>
          <span className={styles.yearMateriasCount}>
            ({year.materias.length})
          </span>
        </div>

        <div className={styles.folderRightActions}>
          {year.totalNotes > 0 && (
            <button
              type="button"
              className={styles.zipDownloadBtn}
              title={`Descargar notas de ${year.label} (.zip)`}
              onClick={handleDownloadYearZip}
            >
              <Download size={11} />
            </button>
          )}
          <span className={styles.countBadge}>{year.totalNotes}</span>
        </div>
      </div>

      {/* Materias inside this Year */}
      {!isCollapsed && (
        <div className={styles.yearMateriasList}>
          {year.materias.map((folder) => {
            const isMateriaSelected =
              selectedFolder === folder.nombre || selectedFolder === folder.id;

            return (
              <MateriaFolderItem
                key={folder.id}
                folder={folder}
                isSelected={isMateriaSelected}
                selectedSubFolder={selectedSubFolder}
                onSelectMateria={() => {
                  onSelectFolder(isMateriaSelected ? null : folder.nombre);
                  onSelectSubFolder(null);
                  onSetSelectedYear?.(folder.anio);
                }}
                onSelectSubFolder={onSelectSubFolder}
                apuntes={apuntes}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default YearFolderGroup;
