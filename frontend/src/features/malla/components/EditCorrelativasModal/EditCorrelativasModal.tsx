import React, { useState, useEffect } from 'react';
import styles from './EditCorrelativasModal.module.css';
import type { Materia } from '../../../../types/academic';
import { X, Check } from 'lucide-react';

interface EditCorrelativasModalProps {
  isOpen: boolean;
  materia: Materia | null;
  allMaterias: Materia[];
  onClose: () => void;
  onSave: (materiaId: string, cursarIds: string[], rendirIds: string[]) => Promise<void>;
}

export const EditCorrelativasModal: React.FC<EditCorrelativasModalProps> = ({
  isOpen,
  materia,
  allMaterias,
  onClose,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'CURSAR' | 'RENDIR'>('CURSAR');
  const [cursarIds, setCursarIds] = useState<string[]>([]);
  const [rendirIds, setRendirIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (materia) {
      setCursarIds(materia.correlativasCursar || []);
      setRendirIds(materia.correlativasRendir || []);
    }
  }, [materia]);

  if (!isOpen || !materia) return null;

  // Filtrar para no poder ponerse a sí misma de correlativa ni materias de años superiores
  const eligibleMaterias = allMaterias.filter(
    m => m.id !== materia.id && (m.anio <= materia.anio)
  );

  // Agrupar por año
  const materiasByYear: Record<number, Materia[]> = {};
  eligibleMaterias.forEach(m => {
    const yr = m.anio || 1;
    if (!materiasByYear[yr]) materiasByYear[yr] = [];
    materiasByYear[yr].push(m);
  });
  const years = Object.keys(materiasByYear).map(Number).sort((a, b) => a - b);

  const toggleSubject = (id: string) => {
    if (activeTab === 'CURSAR') {
      setCursarIds(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    } else {
      setRendirIds(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(materia.id, cursarIds, rendirIds);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const currentSelection = activeTab === 'CURSAR' ? cursarIds : rendirIds;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <span className={styles.modalLabel}>Configurar Correlativas</span>
            <h3 className={styles.modalTitle}>
              {materia.nombre} ({materia.codigo})
            </h3>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'CURSAR' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('CURSAR')}
          >
            <span>Para Cursar ({cursarIds.length})</span>
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'RENDIR' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('RENDIR')}
          >
            <span>Para Rendir Final ({rendirIds.length})</span>
          </button>
        </div>

        {/* Body with checkboxes */}
        <div className={styles.modalBody}>
          {years.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', padding: '24px' }}>
              Esta materia es de 1° Año y no tiene materias previas elegibles.
            </div>
          ) : (
            years.map(year => (
              <div key={year} className={styles.yearSection}>
                <span className={styles.yearSectionTitle}>{year}° Año</span>
                <div className={styles.subjectGrid}>
                  {materiasByYear[year].map(m => {
                    const isChecked = currentSelection.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        className={`${styles.checkboxCard} ${isChecked ? styles.checkboxCardActive : ''}`}
                        onClick={() => toggleSubject(m.id)}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by card click
                          className={styles.checkboxInput}
                        />
                        <div className={styles.checkboxSubjectInfo}>
                          <span className={styles.checkboxSubjectCode}>{m.codigo}</span>
                          <span className={styles.checkboxSubjectName} title={m.nombre}>
                            {m.nombre}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => {
              if (activeTab === 'CURSAR') setCursarIds([]);
              else setRendirIds([]);
            }}
          >
            Desmarcar todas ({activeTab === 'CURSAR' ? 'Cursar' : 'Rendir'})
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={isSaving}
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Check size={13} />
              <span>{isSaving ? 'Guardando...' : 'Guardar Correlativas'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
