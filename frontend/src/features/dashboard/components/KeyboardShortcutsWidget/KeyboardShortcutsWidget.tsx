import React from 'react';
import styles from './KeyboardShortcutsWidget.module.css';
import { useTheme } from '../../../../context/ThemeContext';

interface KeyboardShortcutsWidgetProps {
  onOpenNoteModal: () => void;
  onOpenEvaluationModal: () => void;
}

export const KeyboardShortcutsWidget: React.FC<KeyboardShortcutsWidgetProps> = ({
  onOpenNoteModal,
  onOpenEvaluationModal
}) => {
  const { toggleTheme } = useTheme();

  return (
    <div className={styles.widgetCard}>
      <div className={styles.widgetHeader}>
        <div className={styles.widgetTitle}>
          <span>ATAJOS RÁPIDOS</span>
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          Keyboard First
        </span>
      </div>

      <div className={styles.shortcutsGrid}>
        <button className={styles.shortcutItem} onClick={onOpenNoteModal}>
          <span>Nuevo apunte</span>
          <span className={styles.shortcutKbd}>⌘ N</span>
        </button>

        <button className={styles.shortcutItem} onClick={onOpenEvaluationModal}>
          <span>Nueva evaluación</span>
          <span className={styles.shortcutKbd}>⌘ E</span>
        </button>

        <button
          className={styles.shortcutItem}
          onClick={() => {
            const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
            window.dispatchEvent(event);
          }}
        >
          <span>Comando global</span>
          <span className={styles.shortcutKbd}>⌘ K</span>
        </button>

        <button className={styles.shortcutItem} onClick={toggleTheme}>
          <span>Cambiar tema</span>
          <span className={styles.shortcutKbd}>⌘ T</span>
        </button>
      </div>
    </div>
  );
};

export default KeyboardShortcutsWidget;
