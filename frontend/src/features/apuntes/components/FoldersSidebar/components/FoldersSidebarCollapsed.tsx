import React from "react";
import styles from "../FoldersSidebar.module.css";
import { Folder } from "lucide-react";

interface FoldersSidebarCollapsedProps {
  onExpand: () => void;
}

export const FoldersSidebarCollapsed: React.FC<FoldersSidebarCollapsedProps> = ({
  onExpand,
}) => {
  return (
    <aside className={styles.foldersColumnCollapsed}>
      <button
        type="button"
        className={styles.railToggleBtn}
        onClick={onExpand}
        title="Expandir Carpetas"
      >
        <Folder size={14} color="var(--primary)" />
      </button>
      <span className={styles.railVerticalLabel}>Carpetas</span>
    </aside>
  );
};

export default FoldersSidebarCollapsed;
