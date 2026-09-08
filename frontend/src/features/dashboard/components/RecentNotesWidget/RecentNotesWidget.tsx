import React from 'react';
import styles from './RecentNotesWidget.module.css';
import { BookOpen, ExternalLink } from 'lucide-react';
import { useApuntes } from '../../../../hooks';

interface RecentNotesWidgetProps {
  onGoToApuntes: () => void;
}

export const RecentNotesWidget: React.FC<RecentNotesWidgetProps> = ({ onGoToApuntes }) => {
  const { apuntes } = useApuntes();

  return (
    <div className={styles.widgetCard}>
      <div className={styles.widgetHeader}>
        <div className={styles.widgetTitle}>
          <BookOpen size={13} />
          <span>NOTAS RECIENTES</span>
        </div>
        <button
          style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={onGoToApuntes}
        >
          <span>Ver todas</span>
          <ExternalLink size={11} />
        </button>
      </div>

      <div className={styles.recentNotesList}>
        {apuntes.length === 0 ? (
          <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '12px', marginBottom: '4px' }}>No hay apuntes creados aún.</p>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              Crea tu primera nota de estudio desde la sección de apuntes.
            </span>
          </div>
        ) : (
          apuntes.slice(0, 3).map((note) => (
            <div key={note.id} className={styles.recentNoteItem} onClick={onGoToApuntes}>
              <div className={styles.recentNoteMeta}>
                <span className={styles.recentNoteSubject}>{note.materiaNombre.toUpperCase()}</span>
                <span className={styles.recentNoteDate}>
                  {new Date(note.fechaModificacion).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <div className={styles.recentNoteTitle}>{note.titulo}</div>
              <div className={styles.recentNoteExcerpt}>
                {note.resumen || (note.contenidoMarkdown ? note.contenidoMarkdown.slice(0, 80) + '...' : '')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentNotesWidget;
