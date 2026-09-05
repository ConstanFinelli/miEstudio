import React, { useState, useEffect, useMemo } from 'react';
import styles from './MateriasView.module.css';
import { BookOpen, Plus } from 'lucide-react';
import type { Materia, MaterialEstudio } from '../../types/academic';
import { useMaterias, useEvaluaciones } from '../../hooks';
import { materialesService } from '../../services';
import {
  MateriasHeader,
  MateriasFilterBar,
  MateriasList,
  MateriaDetailHeader,
  AccreditationRulesCard,
  EvaluationsList,
  CorrelativesCard,
  MaterialsManager
} from './components';

interface MateriasViewProps {
  onOpenEvaluationModal: () => void;
  onOpenNoteModal?: () => void;
  onOpenMateriaModal?: () => void;
  onViewPdf: (title: string, url: string) => void;
}

export const MateriasView: React.FC<MateriasViewProps> = ({
  onOpenEvaluationModal,
  onOpenMateriaModal,
  onViewPdf
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(3);
  const [selectedCuatri, setSelectedCuatri] = useState<'1C' | '2C' | 'Anual'>('1C');
  const [selectedEstado, setSelectedEstado] = useState<string>('CURSANDO');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMateriaId, setSelectedMateriaId] = useState<string>('');
  const [materiaMaterials, setMateriaMaterials] = useState<MaterialEstudio[]>([]);

  const { materias, isLoading: isMateriasLoading } = useMaterias();

  // Selected materia
  const selectedMateria: Materia | undefined =
    materias.find(m => m.id === selectedMateriaId) || materias[0];

  // Evaluations for this materia
  const { evaluaciones: materiaEvaluations } = useEvaluaciones(selectedMateria?.id);

  // Load materials for selected materia
  useEffect(() => {
    if (selectedMateria?.id) {
      materialesService.getMateriales(selectedMateria.id).then(setMateriaMaterials);
    }
  }, [selectedMateria?.id]);

  // Set initial selected id when materias load
  useEffect(() => {
    if (materias.length > 0 && !selectedMateriaId) {
      setSelectedMateriaId(materias[0].id);
    }
  }, [materias, selectedMateriaId]);

  const totalCreditos = useMemo(() => {
    return materias.reduce((acc, m) => acc + (m.creditos || 0), 0);
  }, [materias]);

  if (isMateriasLoading && materias.length === 0) {
    return <div className={styles.container}>Cargando materias...</div>;
  }

  // Si no hay materias registradas aún, mostrar header y empty state estilizado con acción para crear
  if (materias.length === 0) {
    return (
      <div className={styles.container}>
        <MateriasHeader
          onRegisterMateria={onOpenMateriaModal}
          totalCreditos={0}
        />
        <div style={{
          backgroundColor: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '60px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          textAlign: 'center',
          marginTop: '20px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--surface-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <BookOpen size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              No tenés materias registradas todavía
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: 1.5, margin: 0 }}>
              Registrá tus materias del cuatrimestre para comenzar a hacer el seguimiento de notas, fechas de examen, apuntes y bibliografía.
            </p>
          </div>
          {onOpenMateriaModal && (
            <button
              className={styles.btnPrimary}
              style={{ padding: '10px 20px', fontSize: '13px' }}
              onClick={onOpenMateriaModal}
            >
              <Plus size={16} />
              <span>+ Registrar Primera Materia</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Filtered materias list
  const filteredMaterias = materias.filter(m => {
    if (selectedEstado !== 'TODOS' && m.estado !== selectedEstado) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return m.nombre.toLowerCase().includes(q) || m.codigo.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className={styles.container}>
      {/* 1. Header Area */}
      <MateriasHeader
        onRegisterMateria={onOpenMateriaModal}
        totalCreditos={totalCreditos}
      />

      {/* 2. Filters Bar */}
      <MateriasFilterBar
        selectedYear={selectedYear}
        onSelectYear={setSelectedYear}
        selectedCuatri={selectedCuatri}
        onSelectCuatri={setSelectedCuatri}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedEstado={selectedEstado}
        onSelectEstado={setSelectedEstado}
      />

      {/* 3. Master-Detail Grid */}
      <div className={styles.masterDetailGrid}>
        {/* Left Column: Master Materias List */}
        <MateriasList
          materias={filteredMaterias}
          selectedMateriaId={selectedMateria?.id || ''}
          onSelectMateria={setSelectedMateriaId}
          onOpenMateriaModal={onOpenMateriaModal}
        />

        {/* Right Column: Selected Materia Details */}
        {selectedMateria ? (
          <div className={styles.detailColumn}>
            <MateriaDetailHeader materia={selectedMateria} />

            <AccreditationRulesCard reglas={selectedMateria.reglasAcreditacion} />

            <EvaluationsList
              evaluations={materiaEvaluations}
              onOpenEvaluationModal={onOpenEvaluationModal}
            />

            <CorrelativesCard correlativas={selectedMateria.correlativas} />

            <MaterialsManager
              materials={materiaMaterials}
              materiaNombre={selectedMateria.nombre}
              onViewPdf={onViewPdf}
            />
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Seleccioná una materia del listado para inspeccionar su cursada.
          </div>
        )}
      </div>
    </div>
  );
};

export default MateriasView;
