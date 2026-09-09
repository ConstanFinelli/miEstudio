import React from "react";
import styles from "./FoldersSidebar.module.css";
import { Folder, ChevronLeft, Plus, Files, Download } from "lucide-react";
import type { ApunteNota } from "../../../../types/academic";
import { useMaterias, useApuntes } from "../../../../hooks";
import { exportMateriaNotesZip } from "../../../../utils";

interface FoldersSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
  selectedFolder: string | null;
  onSelectFolder: (folder: string | null) => void;
  selectedSubFolder: string | null;
  onSelectSubFolder: (sub: string | null) => void;
  onOpenNoteModal?: () => void;
  notes?: ApunteNota[];
}

export const FoldersSidebar: React.FC<FoldersSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  selectedFolder,
  onSelectFolder,
  selectedSubFolder,
  onSelectSubFolder,
  onOpenNoteModal,
  notes,
}) => {
  const { materias } = useMaterias();
  const { apuntes: hookApuntes } = useApuntes();
  const apuntes = notes || hookApuntes;

  // Distinct materias that have notes or are enrolled
  const folderMaterias = React.useMemo(() => {
    const list: {
      id: string;
      nombre: string;
      count: number;
      subfolders: { name: string; count: number }[];
    }[] = [];

    // Add all registered materias
    materias.forEach((m) => {
      const matNotes = apuntes.filter(
        (a) => a.materiaId === m.id || a.materiaNombre === m.nombre,
      );
      const subMap = new Map<string, number>();
      matNotes.forEach((a) => {
        const sub = a.carpeta || a.evaluacionNombre || "General";
        subMap.set(sub, (subMap.get(sub) || 0) + 1);
      });
      list.push({
        id: m.id,
        nombre: m.nombre,
        count: matNotes.length,
        subfolders: Array.from(subMap.entries()).map(([name, count]) => ({
          name,
          count,
        })),
      });
    });

    // Also include any orphan materias from existing notes
    apuntes.forEach((a) => {
      if (
        a.materiaNombre &&
        !list.some((item) => item.nombre === a.materiaNombre)
      ) {
        list.push({
          id: a.materiaId || a.materiaNombre,
          nombre: a.materiaNombre,
          count: apuntes.filter((x) => x.materiaNombre === a.materiaNombre)
            .length,
          subfolders: [],
        });
      }
    });

    return list;
  }, [materias, apuntes]);

  if (isCollapsed) {
    return (
      <aside className={styles.foldersColumnCollapsed}>
        <button
          className={styles.railToggleBtn}
          onClick={() => onToggleCollapse(false)}
          title="Expandir Carpetas"
        >
          <Folder size={14} color="var(--primary)" />
        </button>
        <span className={styles.railVerticalLabel}>Carpetas</span>
      </aside>
    );
  }

  return (
    <aside className={styles.foldersColumn}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 12px 4px 12px",
        }}
      >
        <span className={styles.folderSectionTitle} style={{ padding: 0 }}>
          Carpetas ({folderMaterias.length})
        </span>
        <button
          className={styles.toolBtn}
          style={{ padding: "2px 5px" }}
          onClick={() => onToggleCollapse(true)}
          title="Colapsar panel de carpetas"
        >
          <ChevronLeft size={12} />
        </button>
      </div>

      <div className={styles.foldersList}>
        {/* Item: Todos los apuntes */}
        <div
          className={`${styles.folderItem} ${selectedFolder === null ? styles.folderItemActive : ""}`}
          onClick={() => {
            onSelectFolder(null);
            onSelectSubFolder(null);
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

        {folderMaterias.length === 0 ? (
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
          folderMaterias.map((folder) => {
            const isSelected = selectedFolder === folder.nombre;
            return (
              <div key={folder.id}>
                <div
                  className={`${styles.folderItem} ${isSelected ? styles.folderItemActive : ""}`}
                  onClick={() => {
                    onSelectFolder(isSelected ? null : folder.nombre);
                    onSelectSubFolder(null);
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Folder
                      size={13}
                      color={
                        isSelected ? "var(--primary)" : "var(--text-muted)"
                      }
                    />
                    <span
                      style={{
                        maxWidth: "140px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {folder.nombre}
                    </span>
                  </div>
                  <div className={styles.folderRightActions}>
                    {folder.count > 0 && (
                      <button
                        type="button"
                        className={styles.zipDownloadBtn}
                        title={`Descargar notas de ${folder.nombre} (.zip)`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const folderNotes = apuntes.filter(
                            (a) => a.materiaId === folder.id || a.materiaNombre === folder.nombre
                          );
                          exportMateriaNotesZip(folder.nombre, folderNotes);
                        }}
                      >
                        <Download size={11} />
                      </button>
                    )}
                    <span className={styles.countBadge}>{folder.count}</span>
                  </div>
                </div>

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
                          fontWeight:
                            selectedSubFolder === sub.name ? 600 : undefined,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSubFolder(
                            selectedSubFolder === sub.name ? null : sub.name,
                          );
                        }}
                      >
                        <span
                          style={{
                            maxWidth: "130px",
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
          })
        )}
      </div>

      <div className={styles.foldersFooter}>
        <button className={styles.btnNewFolder} onClick={onOpenNoteModal}>
          <Plus size={12} />
          <span>Nuevo Apunte</span>
        </button>
      </div>
    </aside>
  );
};

export default FoldersSidebar;
