import React from "react";
import styles from "../FoldersSidebar.module.css";
import { Download } from "lucide-react";
import type { FolderMateriaItem } from "../types";
import type { ApunteNota } from "../../../../../types/academic";
import { exportMateriaNotesZip } from "../../../../../utils";

interface MateriaFolderItemProps {
  folder: FolderMateriaItem;
  isSelected: boolean;
  selectedSubFolder: string | null;
  onSelectMateria: () => void;
  onSelectSubFolder: (subName: string | null) => void;
  apuntes: ApunteNota[];
}

export const MateriaFolderItem: React.FC<MateriaFolderItemProps> = ({
  folder,
  isSelected,
  selectedSubFolder,
  onSelectMateria,
  onSelectSubFolder,
  apuntes,
}) => {
  const handleDownloadZip = (e: React.MouseEvent) => {
    e.stopPropagation();
    const folderNotes = apuntes.filter(
      (a) => a.materiaId === folder.id || a.materiaNombre === folder.nombre
    );
    exportMateriaNotesZip(folder.nombre, folderNotes);
  };

  return (
    <div>
      <div
        className={`${styles.folderItem} ${isSelected ? styles.folderItemActive : ""}`}
        onClick={onSelectMateria}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            minWidth: 0,
          }}
        >
          <span
            className={styles.materiaColorDot}
            style={{ backgroundColor: folder.color || "var(--primary)" }}
          />
          <span
            style={{
              maxWidth: "115px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={folder.nombre}
          >
            {folder.nombre}
          </span>
          {folder.cuatrimestre && (
            <span className={styles.materiaCuatriPill}>
              {folder.cuatrimestre}
            </span>
          )}
        </div>

        <div className={styles.folderRightActions}>
          {folder.count > 0 && (
            <button
              type="button"
              className={styles.zipDownloadBtn}
              title={`Descargar notas de ${folder.nombre} (.zip)`}
              onClick={handleDownloadZip}
            >
              <Download size={11} />
            </button>
          )}
          <span className={styles.countBadge}>{folder.count}</span>
        </div>
      </div>

      {/* Subfolders when selected */}
      {isSelected && folder.subfolders.length > 0 && (
        <div>
          {folder.subfolders.map((sub) => (
            <div
              key={sub.name}
              className={styles.folderSubItem}
              style={{
                color:
                  selectedSubFolder === sub.name
                    ? "var(--text-primary)"
                    : undefined,
                fontWeight: selectedSubFolder === sub.name ? 600 : undefined,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSubFolder(
                  selectedSubFolder === sub.name ? null : sub.name
                );
              }}
            >
              <span
                style={{
                  maxWidth: "110px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                ↳ {sub.name}
              </span>
              <span className={styles.countBadge}>{sub.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MateriaFolderItem;
