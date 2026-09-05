import React, { useState } from 'react';
import styles from './MateriasView.module.css';
import { mockMaterias, mockEvaluaciones, mockMateriales } from '../../data/mockData';
import type { Materia } from '../../types/academic';
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
  const [selectedMateriaId, setSelectedMateriaId] = useState<string>('mat-1');

  const selectedMateria: Materia = mockMaterias.find(m => m.id === selectedMateriaId) || mockMaterias[0];

  // Evaluations and materials for this materia
  const materiaEvaluations = mockEvaluaciones.filter(e => e.materiaId === selectedMateria.id);
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
