import React, { useState } from 'react';
import styles from './MateriasView.module.css';
import {
  Plus,
  Search,
  CheckCircle,
  FileText,
  Download,
  Edit2,
  Trash2,
  RotateCcw,
  Eye,
  FileDown
} from 'lucide-react';
import { mockMaterias, mockEvaluaciones, mockMateriales } from '../../data/mockData';
import type { Materia } from '../../types/academic';

interface MateriasViewProps {
  onOpenEvaluationModal: () => void;
  onOpenNoteModal: () => void;
  onViewPdf: (title: string, url: string) => void;
}

export const MateriasView: React.FC<MateriasViewProps> = ({
  onOpenEvaluationModal,
  onViewPdf
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(3);
  const [selectedCuatri, setSelectedCuatri] = useState<'1C' | '2C' | 'Anual'>('1C');
  const [selectedEstado, setSelectedEstado] = useState<string>('CURSANDO');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMateriaId, setSelectedMateriaId] = useState<string>('mat-1');

  const selectedMateria: Materia = mockMaterias.find(m => m.id === selectedMateriaId) || mockMaterias[0];

  // Evaluations for this materia
  const materiaEvaluations = mockEvaluaciones.filter(e => e.materiaId === selectedMateria.id);

  // Materials for this materia
  const materiaMaterials = mockMateriales.filter(m => m.materiaId === selectedMateria.id);

  // Filtered materias list
  const filteredMaterias = mockMaterias.filter(m => {
    if (selectedEstado !== 'TODOS' && m.estado !== selectedEstado) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return m.nombre.toLowerCase().includes(q) || m.codigo.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className={styles.container}>
      {/* Header Area */}
      <div className={styles.headerArea}>
        <div className={styles.headerLeft}>
          <div className={styles.headerMeta}>
            <span>GESTIÓN DE CURSADAS</span>
            <span>·</span>
            <span>INGENIERÍA EN SISTEMAS DE INFORMACIÓN</span>
            <span>·</span>
            <span style={{ color: 'var(--text-dim)' }}>PLAN 2023</span>
          </div>

          <div className={styles.headerTitleRow}>
            <h1 className={styles.pageTitle}>Materias & Cursadas</h1>
            <span className={styles.consoleBadge}>RF1 + RF2 CONSOLE</span>
          </div>

          <p className={styles.pageDesc}>
            Control estricto de correlatividades, ponderación ponderada por instancia de examen y proyección algorítmica de regularidad y promoción directa.
          </p>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.creditsKpi}>
            <span style={{ color: 'var(--emerald)' }}>●</span>
            <span>Créditos en curso:</span>
            <span className={styles.creditsKpiVal}>24 UCA</span>
          </div>

          <button className={styles.btnPrimary} onClick={() => alert('Registrar nueva materia')}>
            <Plus size={14} />
            <span>+ Registrar Materia</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className={styles.filtersBar}>
        <div className={styles.filtersLeft}>
          {/* Year Pills */}
          <div className={styles.pillGroup}>
            {[1, 2, 3, 4].map(yr => (
              <button
                key={yr}
                className={`${styles.pillBtn} ${selectedYear === yr ? styles.pillBtnActive : ''}`}
                onClick={() => setSelectedYear(yr)}
              >
                {yr}° Año
              </button>
            ))}
          </div>

          {/* Cuatrimestre */}
          <div className={styles.pillGroup}>
            {(['1C', '2C', 'Anual'] as const).map(c => (
              <button
                key={c}
                className={`${styles.pillBtn} ${selectedCuatri === c ? styles.pillBtnActive : ''}`}
                onClick={() => setSelectedCuatri(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className={styles.searchInputWrapper}>
            <Search size={13} />
            <input
              type="text"
              placeholder="Filtrar por código o nombre..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Status Tabs */}
        <div className={styles.statusTabs}>
          <span style={{ color: 'var(--text-dim)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>ESTADO:</span>
          {['TODOS', 'CURSANDO', 'REGULAR', 'APROBADA', 'PROMOCIONADA'].map(st => {
            const count = st === 'TODOS'
              ? mockMaterias.length
              : mockMaterias.filter(m => m.estado === st).length;
            const label = st === 'TODOS' ? 'Todos' : st.charAt(0) + st.slice(1).toLowerCase();
            return (
              <button
                key={st}
                className={`${styles.statusTabBtn} ${selectedEstado === st ? styles.statusTabBtnActive : ''}`}
                onClick={() => setSelectedEstado(st)}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Master-Detail Grid */}
      <div className={styles.masterDetailGrid}>
        {/* Left Master Column */}
        <div className={styles.masterColumn}>
          <div className={styles.masterHeader}>
            <span>Materias Registradas ({filteredMaterias.length})</span>
            <span style={{ color: 'var(--text-dim)' }}>Clic para inspeccionar</span>
          </div>

          {filteredMaterias.map((materia) => {
            const isSelected = materia.id === selectedMateria.id;
            const isCursando = materia.estado === 'CURSANDO';
            return (
              <div
                key={materia.id}
                className={`${styles.subjectCard} ${isSelected ? styles.subjectCardSelected : ''}`}
                onClick={() => setSelectedMateriaId(materia.id)}
              >
                <div className={styles.cardTopRow}>
                  <span className={styles.cardCodeMeta}>
                    {materia.codigo} · {materia.anio}° Año, {materia.cuatrimestre}
                  </span>
                  <span className={`${styles.statusBadge} ${
                    materia.estado === 'CURSANDO'
                      ? styles.statusCursando
                      : materia.estado === 'PROMOCIONADA'
                      ? styles.statusPromocionada
                      : styles.statusAprobada
                  }`}>
                    {materia.estado.charAt(0) + materia.estado.slice(1).toLowerCase()}
                  </span>
                </div>

                <div className={styles.cardSubjectTitle}>{materia.nombre}</div>

                {isCursando ? (
                  <>
                    <div className={styles.cardMetricsRow}>
                      <div className={styles.cardMetricBlock}>
                        <span className={styles.cardMetricLabel}>Promedio</span>
                        <span className={styles.cardMetricVal} style={{ color: 'var(--emerald)' }}>
                          {materia.promedio.toFixed(2)}
                        </span>
                      </div>
                      <div className={styles.cardMetricBlock}>
                        <span className={styles.cardMetricLabel}>Ponderado</span>
                        <span className={styles.cardMetricVal}>{materia.ponderado}%</span>
                      </div>
                      <div className={styles.cardMetricBlock}>
                        <span className={styles.cardMetricLabel}>Asistencia</span>
                        <span className={styles.cardMetricVal}>{materia.asistencia}%</span>
                      </div>
                    </div>

                    <div className={styles.projectionRow}>
                      <span>Proyección Académica:</span>
                      <span className={styles.projectionHighlight}>
                        {materia.promedio >= 8.0 ? '☍ En camino a Promoción (≥ 8.0)' : 'Regular (Final Pendiente)'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '8px', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {materia.estado === 'PROMOCIONADA' ? 'Calificación Final Acreditada' : 'Acta Examen Final #1042'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, color: 'var(--emerald)' }}>
                      {materia.calificacionFinal?.toFixed(1)} / 10
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Detail Column */}
        <div className={styles.detailColumn}>
          {/* Detail Header */}
          <div className={styles.detailHeader}>
            <div className={styles.detailHeaderLeft}>
              <div className={styles.detailMetaLine}>
                <span>{selectedMateria.codigo}</span>
                <span>{selectedMateria.comision}</span>
              </div>
              <h2 className={styles.detailTitle}>{selectedMateria.nombre}</h2>
              <p className={styles.detailStaff}>
                Titular: {selectedMateria.profesores.titular} · JTP: {selectedMateria.profesores.jtp}
              </p>
            </div>

            <div className={styles.detailHeaderActions}>
              <button className={styles.iconBtnSmall} title="Editar Materia">
                <Edit2 size={13} />
              </button>
              <button className={styles.iconBtnSmall} title="Descargar Historial">
                <Download size={13} />
              </button>
              <button className={styles.iconBtnSmall} title="Historial de Cambios">
                <RotateCcw size={13} />
              </button>
            </div>
          </div>

          {/* Section 1: Reglas de Acreditación */}
          <div className={styles.sectionBox}>
            <div className={styles.boxHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>=≠ REGLAS DE ACREDITACIÓN CONFIGURADAS</span>
              </div>
              <span style={{ color: 'var(--emerald)', fontSize: '10px' }}>ALGORITMO ACTIVO</span>
            </div>

            <div className={styles.rulesGrid}>
              <div className={styles.ruleCard}>
                <div className={styles.ruleCardTitle}>
                  <CheckCircle size={13} color="var(--emerald)" />
                  <span>Condición Promoción Directa</span>
                </div>
                <p className={styles.ruleCardDesc}>
                  {selectedMateria.reglasAcreditacion.promocion.descripcion}
                </p>
              </div>

              <div className={styles.ruleCard}>
                <div className={styles.ruleCardTitle}>
                  <CheckCircle size={13} color="var(--blue)" />
                  <span>Condición Regularidad</span>
                </div>
                <p className={styles.ruleCardDesc}>
                  {selectedMateria.reglasAcreditacion.regularidad.descripcion}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Instancias de Evaluación Registradas */}
          <div className={styles.evalListSection}>
            <div className={styles.evalListHeader}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                INSTANCIAS DE EVALUACIÓN ({materiaEvaluations.length} REGISTRADAS)
              </div>
              <button className={styles.btnPrimary} onClick={onOpenEvaluationModal} style={{ padding: '4px 10px', fontSize: '11px' }}>
                <Plus size={12} />
                <span>+ Agregar Instancia de Evaluación</span>
              </button>
            </div>

            {materiaEvaluations.map((evalItem) => (
              <div key={evalItem.id} className={styles.evalItemRow}>
                <div className={styles.evalItemLeft}>
                  <div className={styles.evalIconSquare}>
                    <FileText size={15} />
                  </div>
                  <div className={styles.evalInfo}>
                    <div className={styles.evalMetaPills}>
                      <span style={{ background: 'var(--surface-3)', padding: '1px 5px', borderRadius: '2px', color: 'var(--text-secondary)' }}>
                        {evalItem.tipo}
                      </span>
                      <span>Fecha: {new Date(evalItem.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span>Peso: {evalItem.peso}%</span>
                    </div>
                    <div className={styles.evalItemTitle}>{evalItem.titulo}</div>
                    <div className={styles.evalItemSub}>{evalItem.temario.join(', ')}</div>
                  </div>
                </div>

                <div className={styles.evalItemRight}>
                  {evalItem.nota !== null ? (
                    <div className={styles.scorePill}>
                      <span>{evalItem.nota.toFixed(1)}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>/ 10</span>
                    </div>
                  ) : (
                    <button className={styles.btnActionLight} onClick={() => alert('Cargar calificación')}>
                      Ingresar Nota
                    </button>
                  )}
                  <button className={styles.iconBtnSmall} title="Editar">
                    <Edit2 size={12} />
                  </button>
                  <button className={styles.iconBtnSmall} title="Eliminar">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Section 4: Árbol de Correlatividades */}
          <div className={styles.correlativesBox}>
            <span className={styles.correlativesTitle}>ÁRBOL DE CORRELATIVIDADES VINCULADAS</span>
            <div className={styles.correlativesRow}>
              <span>Requisitos Previos:</span>
              {selectedMateria.correlativas.requiere.map((req) => (
                <span key={req.codigo} className={styles.correlativeTagSuccess}>
                  <CheckCircle size={12} />
                  <span>{req.nombre} ({req.estado.charAt(0) + req.estado.slice(1).toLowerCase()})</span>
                </span>
              ))}
            </div>
            <div className={styles.correlativesRow} style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
              <span>Habilita cursada de:</span>
              {selectedMateria.correlativas.habilita.map((hab) => (
                <span key={hab.codigo} style={{ color: 'var(--primary-glow)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                  → {hab.nombre} ({hab.anio}° Año)
                </span>
              ))}
            </div>
          </div>

          {/* Section 5: Gestor de Materiales & PDFs (Feature Pedida por el Usuario) */}
          <div className={styles.materialsSection}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                MATERIALES DE ESTUDIO & VISOR DE PDFS ({materiaMaterials.length})
              </div>
              <button
                className={styles.btnActionLight}
                onClick={() => alert('Subir nuevo PDF para ' + selectedMateria.nombre)}
              >
                + Subir PDF / Guía
              </button>
            </div>

            {materiaMaterials.map((mat) => (
              <div key={mat.id} className={styles.materialCardItem}>
                <div className={styles.materialLeft}>
                  <span className={styles.pdfBadge}>PDF</span>
                  <div>
                    <div className={styles.materialTitle}>{mat.titulo}</div>
                    <div className={styles.materialMeta}>
                      <span>{mat.archivoNombre}</span> · <span>{(mat.tamanioBytes / 1024 / 1024).toFixed(1)} MB</span> · <span>{mat.cantPaginas} págs</span> · <span>Subido el {mat.fechaSubida}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    className={styles.btnActionLight}
                    onClick={() => onViewPdf(mat.titulo, mat.archivoUrl)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Eye size={12} />
                    <span>Visualizar en Pantalla</span>
                  </button>
                  <button className={styles.iconBtnSmall} title="Descargar">
                    <FileDown size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
