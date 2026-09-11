import React, { useState, useEffect } from "react";
import styles from "./MateriasView.module.css";
import { BookOpen, Plus } from "lucide-react";
import type { Materia } from "../../types/academic";
import {
  useMaterias,
  useEvaluaciones,
  useMateriales,
  useHorarios,
} from "../../hooks";
import {
  MateriasHeader,
  MateriasFilterBar,
  MateriasList,
  MateriaDetailHeader,
  AccreditationRulesCard,
  EvaluationsList,
  MaterialsManager,
  MateriaSchedulesCard,
} from "./components";

import {
  AccreditationRulesModal,
  UploadMaterialModal,
  MateriaModal,
} from "../../components/modals";

import type { InstanciaEvaluacion } from "../../types/academic";

interface MateriasViewProps {
  onOpenEvaluationModal: () => void;
  onEditEvaluation?: (evaluation: InstanciaEvaluacion) => void;
  onOpenNoteModal?: () => void;
  onOpenMateriaModal?: () => void;
  onViewPdf: (title: string, url: string) => void;
}

export const MateriasView: React.FC<MateriasViewProps> = ({
  onOpenEvaluationModal,
  onEditEvaluation,
  onOpenMateriaModal,
  onViewPdf,
}) => {
  const [selectedYear, setSelectedYear] = useState<number | "TODOS">("TODOS");
  const [selectedCuatri, setSelectedCuatri] = useState<
    "TODOS" | "1C" | "2C" | "Anual"
  >("TODOS");
  const [selectedEstado, setSelectedEstado] = useState<string>("TODOS");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMateriaId, setSelectedMateriaId] = useState<string>("");
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditMateriaModalOpen, setIsEditMateriaModalOpen] = useState(false);

  const {
    materias,
    isLoading: isMateriasLoading,
    deleteMateria,
    updateMateria,
    refresh: refreshMaterias,
  } = useMaterias();

  // Sincronizar reactivamente cuando se crea o modifica una materia desde cualquier modal
  useEffect(() => {
    const handleMateriaCreatedOrUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<Materia | undefined>;
      if (customEvent.detail) {
        setSelectedMateriaId(customEvent.detail.id);
        if (selectedEstado !== "TODOS" && customEvent.detail.estado !== selectedEstado) {
          setSelectedEstado("TODOS");
        }
        if (selectedYear !== "TODOS" && customEvent.detail.anio !== selectedYear) {
          setSelectedYear("TODOS");
        }
      }
      refreshMaterias();
    };

    window.addEventListener("materias:updated", handleMateriaCreatedOrUpdated);
    return () =>
      window.removeEventListener("materias:updated", handleMateriaCreatedOrUpdated);
  }, [refreshMaterias, selectedEstado, selectedYear]);

  const handleDeleteMateria = async (id: string, nombre: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar "${nombre}"? Esta acción eliminará la cursada y sus registros asociados.`,
    );
    if (!confirmDelete) return;

    try {
      await deleteMateria(id);
      const remaining = materias.filter((m) => m.id !== id);
      if (remaining.length > 0) {
        setSelectedMateriaId(remaining[0].id);
      } else {
        setSelectedMateriaId("");
      }
    } catch (err) {
      console.error("Error al eliminar materia:", err);
      alert("Ocurrió un error al intentar eliminar la materia.");
    }
  };

  // Filtered materias list applying Year (1-6 o TODOS), Cuatrimestre, Estado and Search
  const filteredMaterias = materias.filter((m) => {
    if (selectedYear !== "TODOS" && m.anio !== selectedYear) return false;
    if (selectedCuatri !== "TODOS" && m.cuatrimestre !== selectedCuatri)
      return false;
    if (selectedEstado !== "TODOS" && m.estado !== selectedEstado) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        m.nombre.toLowerCase().includes(q) || m.codigo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Selected materia prioritizes matching selected ID within filtered list
  const selectedMateria: Materia | undefined =
    filteredMaterias.find((m) => m.id === selectedMateriaId) ||
    filteredMaterias[0];

  // Evaluations for this materia
  const { evaluaciones: materiaEvaluations, deleteEvaluacion } =
    useEvaluaciones(selectedMateria?.id);

  // Materials for this materia
  const {
    materiales: materiaMaterials,
    uploadMaterial,
    deleteMaterial,
  } = useMateriales(selectedMateria?.id);

  // Schedules for this materia
  const {
    horarios: materiaHorarios,
    refresh: refreshHorarios,
    deleteHorario: deleteHorarioCursada,
  } = useHorarios(selectedMateria?.id);

  const handleDeleteEvaluation = async (id: string, titulo: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar la evaluación "${titulo}"?`,
    );
    if (!confirmDelete) return;

    try {
      await deleteEvaluacion(id);
    } catch (err) {
      console.error("Error al eliminar evaluación:", err);
      alert("Ocurrió un error al eliminar la evaluación.");
    }
  };

  const handleDeleteMaterial = async (id: string, titulo: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar el material "${titulo}"?`,
    );
    if (!confirmDelete) return;

    try {
      await deleteMaterial(id);
    } catch (err) {
      console.error("Error al eliminar material:", err);
      alert("Ocurrió un error al eliminar el material.");
    }
  };

  // Set initial selected id when materias load
  useEffect(() => {
    if (
      filteredMaterias.length > 0 &&
      (!selectedMateriaId ||
        !filteredMaterias.some((m) => m.id === selectedMateriaId))
    ) {
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
        <MateriasHeader onRegisterMateria={onOpenMateriaModal} />
        <div className={styles.emptyViewCard}>
          <div className={styles.emptyViewIcon}>
            <BookOpen size={28} />
          </div>
          <div>
            <h2 className={styles.emptyViewTitle}>
              No tenés materias registradas todavía
            </h2>
            <p className={styles.emptyViewDesc}>
              Registrá tus materias del cuatrimestre para comenzar a hacer el
              seguimiento de notas, fechas de examen, apuntes y bibliografía.
            </p>
          </div>
          {onOpenMateriaModal && (
            <button
              className={`${styles.btnPrimary} ${styles.emptyViewBtn}`}
              onClick={onOpenMateriaModal}
            >
              <Plus size={16} />
              <span>Registrar Primera Materia</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 1. Header Area */}
      <MateriasHeader onRegisterMateria={onOpenMateriaModal} />

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
          selectedMateriaId={selectedMateria?.id || ""}
          onSelectMateria={setSelectedMateriaId}
          onOpenMateriaModal={onOpenMateriaModal}
          onDeleteMateria={handleDeleteMateria}
        />

        {/* Right Column: Selected Materia Details */}
        {selectedMateria ? (
          <div className={styles.detailColumn}>
            <MateriaDetailHeader
              materia={selectedMateria}
              onEditMateria={() => setIsEditMateriaModalOpen(true)}
              onDeleteMateria={handleDeleteMateria}
            />

            <MateriaSchedulesCard
              materia={selectedMateria}
              horarios={materiaHorarios}
              onRefreshHorarios={refreshHorarios}
              onDeleteHorario={deleteHorarioCursada}
            />

            <AccreditationRulesCard
              reglas={selectedMateria.reglasAcreditacion}
              estado={selectedMateria.estado}
              onConfigure={() => setIsRulesModalOpen(true)}
            />

            <EvaluationsList
              evaluations={materiaEvaluations}
              onOpenEvaluationModal={onOpenEvaluationModal}
              onEditEvaluation={onEditEvaluation}
              onDeleteEvaluation={handleDeleteEvaluation}
            />

            <MaterialsManager
              materials={materiaMaterials}
              materiaNombre={selectedMateria.nombre}
              onViewPdf={onViewPdf}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
              onDeleteMaterial={handleDeleteMaterial}
            />
          </div>
        ) : (
          <div className={styles.noFilteredResults}>
            <p className={styles.noFilteredTitle}>
              Ninguna materia coincide con los filtros
            </p>
            <span className={styles.noFilteredSub}>
              Probá seleccionando "Todos" los años o cuatrimestres para explorar
              tus asignaturas registradas.
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
            await updateMateria(selectedMateria.id, {
              reglasAcreditacion: newReglas,
            });
          }}
        />
      )}

      {/* Modal para subir PDFs de materiales de estudio */}
      {selectedMateria && (
        <UploadMaterialModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          materiaId={selectedMateria.id}
          materiaNombre={selectedMateria.nombre}
          materiaCodigo={selectedMateria.codigo}
          onUpload={(file, titulo, categoria) =>
            uploadMaterial(file, titulo, categoria)
          }
        />
      )}

      {/* Modal para editar datos de la materia */}
      {selectedMateria && isEditMateriaModalOpen && (
        <MateriaModal
          isOpen={isEditMateriaModalOpen}
          onClose={() => setIsEditMateriaModalOpen(false)}
          materiaToEdit={selectedMateria}
          onSuccess={async (updated) => {
            setIsEditMateriaModalOpen(false);
            await updateMateria(updated.id, updated);
          }}
        />
      )}
    </div>
  );
};

export default MateriasView;
