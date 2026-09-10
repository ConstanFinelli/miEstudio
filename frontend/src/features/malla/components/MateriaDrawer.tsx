import React from 'react';
import styles from './MateriaDrawer.module.css';
import type { MateriaNodeData } from '../types';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Edit3,
  ExternalLink,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MateriaDrawerProps {
  nodeData: MateriaNodeData | null;
  onClose: () => void;
  onSelectMateria: (id: string) => void;
  onOpenEditCorrelativas: (materiaId: string) => void;
}

export const MateriaDrawer: React.FC<MateriaDrawerProps> = ({
  nodeData,
  onClose,
  onSelectMateria,
  onOpenEditCorrelativas
}) => {
  const navigate = useNavigate();

  if (!nodeData) return null;

  const {
    materia,
    computedStatus,
    correlativasCursarFaltantes,
    correlativasCursarCumplidas,
    correlativasRendirFaltantes,
    correlativasRendirCumplidas,
    desbloqueaDirectas,
    desbloqueaTotalCount,
    puedeCursar,
    puedeRendir
  } = nodeData;

  const totalCursarReqs = correlativasCursarCumplidas.length + correlativasCursarFaltantes.length;
  const totalRendirReqs = correlativasRendirCumplidas.length + correlativasRendirFaltantes.length;

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div className={styles.drawerContent} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div className={styles.headerInfo}>
            <div className={styles.codeMeta}>
              <span>{materia.codigo}</span>
              <span>•</span>
              <span>{materia.anio}° Año</span>
              <span>•</span>
              <span>{materia.cuatrimestre}</span>
            </div>
            <h2 className={styles.title}>{materia.nombre}</h2>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            title="Cerrar panel"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.drawerBody}>
          {/* Status summary */}
          <div className={styles.statusCard}>
            <span className={styles.statusLabel}>Estado Académico</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color:
                  computedStatus === 'APROBADA' || computedStatus === 'PROMOCIONADA'
                    ? 'var(--emerald)'
                    : computedStatus === 'CURSANDO'
                    ? 'var(--primary-glow)'
                    : computedStatus === 'HABILITADA'
                    ? '#22d3ee'
                    : computedStatus === 'REGULAR'
                    ? '#a78bfa'
                    : 'var(--text-muted)'
              }}
            >
              {computedStatus}
              {materia.promedio > 0 && ` (${materia.promedio.toFixed(1)})`}
            </span>
          </div>

          {/* Section: Correlativas para Cursar */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>
                {puedeCursar ? (
                  <CheckCircle2 size={13} color="var(--emerald)" />
                ) : (
                  <Lock size={13} color="var(--amber)" />
                )}
                <span>Correlativas para Cursar</span>
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                {correlativasCursarCumplidas.length}/{totalCursarReqs}
              </span>
            </div>

            {totalCursarReqs === 0 ? (
              <div className={styles.emptyPill}>Sin correlativas previas requeridas para cursar.</div>
            ) : (
              <div className={styles.reqList}>
                {/* Cumplidas */}
                {correlativasCursarCumplidas.map(req => (
                  <div
                    key={req.id}
                    className={styles.reqItem}
                    onClick={() => onSelectMateria(req.id)}
                    title={`Ver ${req.nombre}`}
                  >
                    <div className={styles.reqItemLeft}>
                      <CheckCircle2 size={13} className={styles.reqIconPassed} />
                      <span className={styles.reqName}>{req.nombre}</span>
                    </div>
                    <span className={styles.reqStatusBadge} style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)' }}>
                      {req.estado}
                    </span>
                  </div>
                ))}
                {/* Faltantes */}
                {correlativasCursarFaltantes.map(req => (
                  <div
                    key={req.id}
                    className={styles.reqItem}
                    onClick={() => onSelectMateria(req.id)}
                    title={`Ver ${req.nombre} (Requisito faltante)`}
                    style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}
                  >
                    <div className={styles.reqItemLeft}>
                      <AlertCircle size={13} className={styles.reqIconMissing} />
                      <span className={styles.reqName}>{req.nombre}</span>
                    </div>
                    <span className={styles.reqStatusBadge} style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)' }}>
                      Falta regularizar
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Correlativas para Rendir Final */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>
                {puedeRendir ? (
                  <CheckCircle2 size={13} color="var(--emerald)" />
                ) : (
                  <Lock size={13} color="var(--amber)" />
                )}
                <span>Correlativas para Rendir Final</span>
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                {correlativasRendirCumplidas.length}/{totalRendirReqs}
              </span>
            </div>

            {totalRendirReqs === 0 ? (
              <div className={styles.emptyPill}>Sin correlativas para rendir examen final.</div>
            ) : (
              <div className={styles.reqList}>
                {correlativasRendirCumplidas.map(req => (
                  <div
                    key={req.id}
                    className={styles.reqItem}
                    onClick={() => onSelectMateria(req.id)}
                    title={`Ver ${req.nombre}`}
                  >
                    <div className={styles.reqItemLeft}>
                      <CheckCircle2 size={13} className={styles.reqIconPassed} />
                      <span className={styles.reqName}>{req.nombre}</span>
                    </div>
                    <span className={styles.reqStatusBadge} style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)' }}>
                      {req.estado}
                    </span>
                  </div>
                ))}
                {correlativasRendirFaltantes.map(req => (
                  <div
                    key={req.id}
                    className={styles.reqItem}
                    onClick={() => onSelectMateria(req.id)}
                    title={`Ver ${req.nombre} (Requiere final aprobado)`}
                    style={{ borderColor: 'rgba(239, 68, 68, 0.35)' }}
                  >
                    <div className={styles.reqItemLeft}>
                      <AlertCircle size={13} style={{ color: 'var(--red)' }} />
                      <span className={styles.reqName}>{req.nombre}</span>
                    </div>
                    <span className={styles.reqStatusBadge} style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--red)' }}>
                      Final pendiente
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Materias que Desbloquea a Futuro */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>
                <Sparkles size={13} color="var(--primary-glow)" />
                <span>Desbloquea a Futuro ({desbloqueaDirectas.length})</span>
              </span>
              {desbloqueaTotalCount > desbloqueaDirectas.length && (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Total en carrera: {desbloqueaTotalCount}
                </span>
              )}
            </div>

            {desbloqueaDirectas.length === 0 ? (
              <div className={styles.emptyPill}>No es requisito obligatorio de materias posteriores.</div>
            ) : (
              <div className={styles.unlockedList}>
                {desbloqueaDirectas.map(dep => (
                  <div
                    key={dep.id}
                    className={styles.unlockedItem}
                    onClick={() => onSelectMateria(dep.id)}
                    title={`Ver ${dep.nombre}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>
                        {dep.codigo}
                      </span>
                      <span className={styles.reqName}>{dep.nombre}</span>
                    </div>
                    <ArrowRight size={12} color="var(--text-muted)" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className={styles.drawerFooter}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => onOpenEditCorrelativas(materia.id)}
            title="Configurar qué materias exige esta asignatura"
          >
            <Edit3 size={13} />
            <span>Editar Correlativas</span>
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            onClick={() => {
              navigate('/materias');
            }}
            title="Ver información académica completa en Materias"
          >
            <ExternalLink size={13} />
            <span>Ficha Materia</span>
          </button>
        </div>
      </div>
    </div>
  );
};
