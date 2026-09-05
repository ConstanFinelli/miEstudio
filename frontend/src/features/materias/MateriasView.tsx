import React, { useState, useEffect } from 'react';
import styles from './MateriasView.module.css';
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

  if (isMateriasLoading && materias.length === 0) {
    return <div className={styles.container}>Cargando materias...</div>;
  }

  if (!selectedMateria) {
    return <div className={styles.container}>No se encontraron materias.</div>;
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
      <MateriasHeader />

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
          selectedMateriaId={selectedMateria.id}
          onSelectMateria={setSelectedMateriaId}
        />

        {/* Right Column: Selected Materia Details */}
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
      </div>
    </div>
  );
};

export default MateriasView;
