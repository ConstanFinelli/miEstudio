import React from "react";
import styles from "./FoldersSidebar.module.css";
import {
  Folder,
  Files,
  Plus,
  Download,
  ChevronLeft,
  ChevronsUpDown,
} from "lucide-react";
import { useMaterias } from "../../../../hooks/useMaterias";
import { useApuntes } from "../../../../hooks/useApuntes";
import { exportMateriaNotesZip } from "../../../../utils";
import type { FoldersSidebarProps } from "./types";
import { useYearGroups } from "./useYearGroups";
import { FoldersSidebarCollapsed } from "./components/FoldersSidebarCollapsed";
import { YearFolderGroup } from "./components/YearFolderGroup";

export const FoldersSidebar: React.FC<FoldersSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  selectedYear,
  onSelectYear,
  selectedFolder,
  onSelectFolder,
  selectedSubFolder,
  onSelectSubFolder,
  onOpenNoteModal,
  notes: propNotes,
}) => {
  const { materias } = useMaterias();
  const { apuntes: hookNotes } = useApuntes();
  const apuntes = propNotes || hookNotes;

  const {
    folderMaterias,
    yearGroups,
    collapsedYears,
    toggleYearCollapse,
    toggleAllYears,
  } = useYearGroups(materias, apuntes, selectedFolder);

  const handleSelectYear = (anio: number) => {
    if (collapsedYears[String(anio)]) {
      toggleYearCollapse(anio);
    }
    if (selectedYear === anio && selectedFolder === null) {
      onSelectYear?.(null);
    } else {
      onSelectYear?.(anio);
      onSelectFolder(null);
      onSelectSubFolder(null);
    }
  };

  if (isCollapsed) {
    return (
      <FoldersSidebarCollapsed onExpand={() => onToggleCollapse(false)} />
    );
  }

  const allNotesActive =
    selectedFolder === null &&
    (selectedYear === null || selectedYear === undefined);

  return (
    <aside className={styles.foldersColumn}>
      {/* Sidebar Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 12px 6px 12px",
        }}
      >
        <span className={styles.folderSectionTitle} style={{ padding: 0 }}>
          Carpetas por Año ({folderMaterias.length})
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {yearGroups.length > 0 && (
            <button
              type="button"
              className={styles.toolBtn}
              style={{ padding: "2px 5px" }}
              onClick={toggleAllYears}
              title="Colapsar / Expandir todos los años"
            >
              <ChevronsUpDown size={12} />
            </button>
          )}
          <button
            type="button"
            className={styles.toolBtn}
            style={{ padding: "2px 5px" }}
            onClick={() => onToggleCollapse(true)}
            title="Colapsar panel de carpetas"
          >
            <ChevronLeft size={12} />
          </button>
        </div>
      </div>

      {/* Folders List */}
      <div className={styles.foldersList}>
        {/* Item: Todos los apuntes */}
        <div
          className={`${styles.folderItem} ${
            allNotesActive ? styles.folderItemActive : ""
          }`}
          onClick={() => {
            onSelectFolder(null);
            onSelectSubFolder(null);
            onSelectYear?.(null);
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Files size={13} color="var(--primary)" />
            <span>Todos los apuntes</span>
          </div>
          <div className={styles.folderRightActions}>
            {apuntes.length > 0 && (
              <button
                type="button"
                className={styles.zipDownloadBtn}
                title="Descargar todos los apuntes (.zip)"
                onClick={(e) => {
                  e.stopPropagation();
                  exportMateriaNotesZip("Mis Apuntes", apuntes);
                }}
              >
                <Download size={11} />
              </button>
            )}
            <span className={styles.countBadge}>{apuntes.length}</span>
          </div>
        </div>

        {/* Empty State */}
        {yearGroups.length === 0 ? (
          <div
            style={{
              padding: "24px 12px",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            <Folder
              size={22}
              style={{
                color: "var(--text-dim)",
                margin: "0 auto 6px",
                display: "block",
              }}
            />
            <p
              style={{
                fontSize: "11px",
                lineHeight: 1.4,
                color: "var(--text-dim)",
              }}
            >
              Sin carpetas aún.
              <br />
              Crea una materia o apunte para organizar tus notas.
            </p>
          </div>
        ) : (
          yearGroups.map((year) => (
            <YearFolderGroup
              key={`year-${year.anio}`}
              year={year}
              isCollapsed={Boolean(collapsedYears[String(year.anio)])}
              isSelected={selectedYear === year.anio && selectedFolder === null}
              selectedFolder={selectedFolder}
              selectedSubFolder={selectedSubFolder}
              onToggleCollapse={toggleYearCollapse}
              onSelectYear={handleSelectYear}
              onSelectFolder={onSelectFolder}
              onSelectSubFolder={onSelectSubFolder}
              onSetSelectedYear={onSelectYear}
              apuntes={apuntes}
              materias={materias}
            />
          ))
        )}
      </div>

      {/* Footer / Create Note */}
      <div className={styles.foldersFooter}>
        <button
          type="button"
          className={styles.btnNewFolder}
          onClick={onOpenNoteModal}
        >
          <Plus size={12} />
          <span>Nuevo Apunte</span>
        </button>
      </div>
    </aside>
  );
};

export default FoldersSidebar;
