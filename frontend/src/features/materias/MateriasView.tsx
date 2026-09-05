import React, { useState, useEffect } from 'react';
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
import { AccreditationRulesModal } from '../../components/modals';

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
  const [selectedYear, setSelectedYear] = useState<number | 'TODOS'>('TODOS');
  const [selectedCuatri, setSelectedCuatri] = useState<'TODOS' | '1C' | '2C' | 'Anual'>('TODOS');
  const [selectedEstado, setSelectedEstado] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMateriaId, setSelectedMateriaId] = useState<string>('');
  const [materiaMaterials, setMateriaMaterials] = useState<MaterialEstudio[]>([]);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  const { materias, isLoading: isMateriasLoading, deleteMateria, updateMateria } = useMaterias();

  const handleDeleteMateria = async (id: string, nombre: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar "${nombre}"? Esta acción eliminará la cursada y sus registros asociados.`
    );
    if (!confirmDelete) return;

    try {
      await deleteMateria(id);
      const remaining = materias.filter(m => m.id !== id);
      if (remaining.length > 0) {
        setSelectedMateriaId(remaining[0].id);
      } else {
        setSelectedMateriaId('');
      }
    } catch (err) {
      console.error('Error al eliminar materia:', err);
      alert('Ocurrió un error al intentar eliminar la materia.');
    }
  };

  // Filtered materias list applying Year (1-6 o TODOS), Cuatrimestre, Estado and Search
  const filteredMaterias = materias.filter(m => {
    if (selectedYear !== 'TODOS' && m.anio !== selectedYear) return false;
    if (selectedCuatri !== 'TODOS' && m.cuatrimestre !== selectedCuatri) return false;
    if (selectedEstado !== 'TODOS' && m.estado !== selectedEstado) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return m.nombre.toLowerCase().includes(q) || m.codigo.toLowerCase().includes(q);
    }
    return true;
  });

  // Selected materia prioritizes matching selected ID within filtered list
  const selectedMateria: Materia | undefined =
    filteredMaterias.find(m => m.id === selectedMateriaId) || filteredMaterias[0];

  // Evaluations for this materia
  const { evaluaciones: materiaEvaluations, deleteEvaluacion } = useEvaluaciones(selectedMateria?.id);

  const handleDeleteEvaluation = async (id: string, titulo: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar la evaluación "${titulo}"?`
    );
    if (!confirmDelete) return;

    try {
      await deleteEvaluacion(id);
    } catch (err) {
      console.error('Error al eliminar evaluación:', err);
      alert('Ocurrió un error al eliminar la evaluación.');
    }
  };

  // Load materials for selected materia
  useEffect(() => {
    if (selectedMateria?.id) {
      materialesService.getMateriales(selectedMateria.id).then(setMateriaMaterials);
    }
  }, [selectedMateria?.id]);

  // Set initial selected id when materias load
  useEffect(() => {
    if (filteredMaterias.length > 0 && (!selectedMateriaId || !filteredMaterias.some(m => m.id === selectedMateriaId))) {
      setSelectedMateriaId(filteredMaterias[0].id);
    }
  }, [filteredMaterias, selectedMateriaId]);

  if (isMateriasLoading && materias.length === 0) {
    return <div className={styles.container}>Cargando materias...</div>;
  }

  // Si no hay materias registradas aún, mostrar header y empty state estilizado con acción para crear
  if (materias.length === 0) {
    return (
      <div className={styles.container}>
        <MateriasHeader
          onRegisterMateria={onOpenMateriaModal}
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

  return (
    <div className={styles.container}>
      {/* 1. Header Area */}
      <MateriasHeader
        onRegisterMateria={onOpenMateriaModal}
      />

      {/* 2. Filters Bar con Años 1 a 6 y Cuatrimestres funcionales */}
      <MateriasFilterBar
        selectedYear={selectedYear}
        onSelectYear={setSelectedYear}
        selectedCuatri={selectedCuatri}
        onSelectCuatri={setSelectedCuatri}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedEstado={selectedEstado}
        onSelectEstado={setSelectedEstado}
        materias={materias}
      />

      {/* 3. Master-Detail Grid */}
      <div className={styles.masterDetailGrid}>
        {/* Left Column: Master Materias List */}
        <MateriasList
          materias={filteredMaterias}
          selectedMateriaId={selectedMateria?.id || ''}
          onSelectMateria={setSelectedMateriaId}
          onOpenMateriaModal={onOpenMateriaModal}
          onDeleteMateria={handleDeleteMateria}
        />

        {/* Right Column: Selected Materia Details */}
        {selectedMateria ? (
          <div className={styles.detailColumn}>
            <MateriaDetailHeader
              materia={selectedMateria}
              onDeleteMateria={handleDeleteMateria}
            />

            <AccreditationRulesCard
              reglas={selectedMateria.reglasAcreditacion}
              onConfigure={() => setIsRulesModalOpen(true)}
            />

            <EvaluationsList
              evaluations={materiaEvaluations}
              onOpenEvaluationModal={onOpenEvaluationModal}
              onDeleteEvaluation={handleDeleteEvaluation}
            />

            <CorrelativesCard correlativas={selectedMateria.correlativas} />

            <MaterialsManager
              materials={materiaMaterials}
              materiaNombre={selectedMateria.nombre}
              onViewPdf={onViewPdf}
            />
          </div>
        ) : (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            backgroundColor: 'var(--surface-1)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-subtle)',
            color: 'var(--text-muted)'
          }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Ninguna materia coincide con los filtros
            </p>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
              Probá seleccionando "Todos" los años o cuatrimestres para explorar tus asignaturas registradas.
            </span>
          </div>
        )}
      </div>

      {/* Modal para configurar las reglas de acreditación */}
      {selectedMateria && (
        <AccreditationRulesModal
          isOpen={isRulesModalOpen}
          onClose={() => setIsRulesModalOpen(false)}
          materia={selectedMateria}
          onSave={async (newReglas) => {
            await updateMateria(selectedMateria.id, { reglasAcreditacion: newReglas });
          }}
        />
      )}
    </div>
  );
};

export default MateriasView;
