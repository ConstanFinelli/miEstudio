import React, { useState } from 'react';
import styles from '../MateriasView.module.css';
import { Clock, Plus, Building2, MapPin, Edit2, Trash2 } from 'lucide-react';
import type { HorarioCursada, Materia } from '../../../types/academic';
import { HorarioModal } from '../../../components/modals';

interface MateriaSchedulesCardProps {
  materia: Materia;
  horarios: HorarioCursada[];
  onRefreshHorarios: () => void;
  onDeleteHorario: (id: string) => Promise<void>;
}

export const MateriaSchedulesCard: React.FC<MateriaSchedulesCardProps> = ({
  materia,
  horarios,
  onRefreshHorarios,
  onDeleteHorario
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHorario, setEditingHorario] = useState<HorarioCursada | null>(null);

  const materiaHorarios = horarios.filter(h => h.materiaId === materia.id);

  const handleEdit = (h: HorarioCursada) => {
    setEditingHorario(h);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingHorario(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('¿Eliminar este horario de cursada?');
    if (confirm) {
      await onDeleteHorario(id);
      onRefreshHorarios();
    }
  };

  return (
    <div className={styles.evalListSection}>
      <div className={styles.evalListHeader}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
          HORARIOS DE CURSADA ({materiaHorarios.length} CLASES SEMANALES)
        </div>
        <button
          className={styles.btnPrimary}
          onClick={handleAdd}
          style={{ padding: '4px 10px', fontSize: '11px' }}
        >
          <Plus size={12} />
          <span>+ Agregar Horario de Cursada</span>
        </button>
      </div>

      {materiaHorarios.length === 0 ? (
        <div style={{
          padding: '16px',
          textAlign: 'center',
          color: 'var(--text-dim)',
          fontSize: '12px',
          fontStyle: 'italic',
          background: 'var(--surface-2)',
          borderRadius: 'var(--radius-sm)'
        }}>
          No hay horarios de cursada configurados para esta materia.
        </div>
      ) : (
        materiaHorarios.map(h => (
          <div key={h.id} className={styles.evalItemRow}>
            <div className={styles.evalItemLeft}>
              <div
                className={styles.evalIconSquare}
                style={{
                  color: materia.color || 'var(--primary)',
                  backgroundColor: `${materia.color || 'var(--primary)'}15`
                }}
              >
                <Clock size={15} />
              </div>
              <div className={styles.evalInfo}>
                <div className={styles.evalMetaPills}>
                  <span style={{
                    background: 'var(--surface-3)',
                    padding: '1px 6px',
                    borderRadius: '2px',
                    color: 'var(--text-primary)',
                    fontWeight: 600
                  }}>
                    {h.diaSemana}
                  </span>
                  <span>{h.horaInicio} - {h.horaFin} hs</span>
                  {h.tipoClase && <span>{h.tipoClase}</span>}
                  {h.modalidad && <span>{h.modalidad}</span>}
                </div>
                <div className={styles.evalItemTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  {h.facultadSede && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                      <Building2 size={12} />
                      {h.facultadSede}
                    </span>
                  )}
                  {h.aula && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-dim)', fontSize: '12px' }}>
                      <MapPin size={12} />
                      {h.aula}
                    </span>
                  )}
                </div>
                {h.observaciones && (
                  <div className={styles.evalItemSub}>{h.observaciones}</div>
                )}
              </div>
            </div>

            <div className={styles.evalItemRight}>
              <button
                className={styles.iconBtnSmall}
                title="Editar horario"
                onClick={() => handleEdit(h)}
              >
                <Edit2 size={12} />
              </button>
              <button
                className={styles.iconBtnSmall}
                title="Eliminar horario"
                onClick={() => handleDelete(h.id)}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))
      )}

      <HorarioModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHorario(null);
        }}
        onSuccess={() => {
          onRefreshHorarios();
        }}
        horarioToEdit={editingHorario}
        defaultMateriaId={materia.id}
      />
    </div>
  );
};
