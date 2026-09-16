import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import styles from "./MateriasView.module.css";
import { BookOpen, Plus, Sparkles } from "lucide-react";
import type { Materia } from "../../types/academic";
import { ImportPlanModal } from "../malla/components";
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
  EditMaterialModal,
  MateriaModal,
} from "../../components/modals";

import type { InstanciaEvaluacion, MaterialEstudio } from "../../types/academic";
import { useAuth } from "../../context/AuthContext";
import { materiasService } from "../../services";

interface MateriasViewProps {
  onOpenEvaluationModal: (materiaId?: string) => void;
  onEditEvaluation?: (evaluation: InstanciaEvaluacion) => void;
  onOpenNoteModal?: (materiaId?: string) => void;
  onOpenMateriaModal?: () => void;
  onViewPdf: (title: string, url: string, cantPaginas?: number) => void;
}

export const MateriasView: React.FC<MateriasViewProps> = ({
  onOpenEvaluationModal,
  onEditEvaluation,
  onOpenNoteModal: _onOpenNoteModal,
  onOpenMateriaModal,
  onViewPdf,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const queryMateriaId = useMemo(() => {
    return (
      searchParams.get("materiaId") ||
      searchParams.get("id") ||
      searchParams.get("materia") ||
      (location.state as { selectedMateriaId?: string } | null)?.selectedMateriaId ||
      ""
    );
  }, [searchParams, location.state]);

  const queryCarreraId = useMemo(() => {
    return (
      searchParams.get("carreraId") ||
      searchParams.get("carrera_id") ||
      ""
    );
  }, [searchParams]);

  const { activeCarrera, selectCarrera } = useAuth();

  const [selectedYear, setSelectedYear] = useState<number | "TODOS">("TODOS");
  const [selectedCuatri, setSelectedCuatri] = useState<
    "TODOS" | "1C" | "2C" | "Anual"
  >("TODOS");
  const [selectedEstado, setSelectedEstado] = useState<string>("TODOS");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMateriaId, setSelectedMateriaId] = useState<string>(queryMateriaId);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditMaterialModalOpen, setIsEditMaterialModalOpen] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<MaterialEstudio | null>(null);
  const [isEditMateriaModalOpen, setIsEditMateriaModalOpen] = useState(false);
  const [isImportPlanModalOpen, setIsImportPlanModalOpen] = useState(false);

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

  // Si en la URL viene una carrera específica distinta a la activa, cambiar a esa carrera
  useEffect(() => {
    if (queryCarreraId && activeCarrera?.id && queryCarreraId !== activeCarrera.id) {
      selectCarrera(queryCarreraId);
    }
  }, [queryCarreraId, activeCarrera?.id, selectCarrera]);

  // Si viene un materiaId que no pertenece a la carrera actual, buscarla y cambiar automáticamente a su carrera
  useEffect(() => {
    if (!queryMateriaId || isMateriasLoading) return;
    const existsInCurrent = materias.some((m) => m.id === queryMateriaId);
    if (!existsInCurrent && materias.length > 0) {
      materiasService.getMateriaById(queryMateriaId).then((fetched) => {
        if (fetched) {
          const targetCarrera = fetched.carreraId || fetched.carrera_id;
          if (targetCarrera && activeCarrera?.id && targetCarrera !== activeCarrera.id) {
            selectCarrera(targetCarrera);
          }
        }
      }).catch(() => {});
    }
  }, [queryMateriaId, isMateriasLoading, materias, activeCarrera?.id, selectCarrera]);

  // Sincronizar materia seleccionada si viene por URL query param (?materiaId=...) o router state
  useEffect(() => {
    if (!queryMateriaId || materias.length === 0) return;

    const target = materias.find((m) => m.id === queryMateriaId);
    if (target) {
      setSelectedMateriaId(target.id);
      // Asegurar que ningún filtro activo oculte la materia requerida
      if (selectedEstado !== "TODOS" && target.estado !== selectedEstado) {
        setSelectedEstado("TODOS");
      }
      if (selectedYear !== "TODOS" && target.anio !== selectedYear) {
        setSelectedYear("TODOS");
      }
      if (selectedCuatri !== "TODOS" && target.cuatrimestre !== selectedCuatri) {
        setSelectedCuatri("TODOS");
      }
      if (searchQuery.trim() !== "") {
        setSearchQuery("");
      }
    }
  }, [queryMateriaId, materias]);

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

  // Selected materia prioritizes matching selected ID within filtered list,
  // then across all materias (in case filter adjustment is rendering),
  // and falls back to the first filtered item.
  const selectedMateria: Materia | undefined =
    filteredMaterias.find((m) => m.id === selectedMateriaId) ||
    materias.find((m) => m.id === selectedMateriaId) ||
    filteredMaterias[0];

  // Evaluations for this materia
  const { evaluaciones: materiaEvaluations, deleteEvaluacion } =
    useEvaluaciones(selectedMateria?.id);

  // Materials for this materia
  const {
    materiales: materiaMaterials,
    uploadMaterial,
    uploadBatchMaterials,
    updateMaterial,
    deleteMaterial,
  } = useMateriales(selectedMateria?.id);

  const existingUnits = useMemo(() => {
    return Array.from(
      new Set(
        materiaMaterials
          .map((m) => m.unidad?.trim())
          .filter((u): u is string => Boolean(u))
      )
    );
  }, [materiaMaterials]);

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
        <MateriasHeader
          onRegisterMateria={onOpenMateriaModal}
          onImportPlan={() => setIsImportPlanModalOpen(true)}
        />
        <div className={styles.emptyViewCard}>
          <div className={styles.emptyViewIcon}>
            <BookOpen size={28} />
          </div>
          <div>
            <h2 className={styles.emptyViewTitle}>
              No tenés materias registradas todavía
            </h2>
            <p className={styles.emptyViewDesc}>
              Registrá tus materias o importa tu plan de estudio universitario completo automáticamente con Inteligencia Artificial.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              className={styles.btnPrimary}
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none",
                boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
              }}
              onClick={() => setIsImportPlanModalOpen(true)}
            >
              <Sparkles size={16} />
              <span>Importar Plan de Estudio con IA</span>
            </button>
            {onOpenMateriaModal && (
              <button
                className={`${styles.btnPrimary} ${styles.emptyViewBtn}`}
                onClick={onOpenMateriaModal}
              >
                <Plus size={16} />
                <span>Registrar Materia Manualmente</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal para importar plan de estudios con IA */}
        <ImportPlanModal
          isOpen={isImportPlanModalOpen}
          onClose={() => setIsImportPlanModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 1. Header Area */}
      <MateriasHeader
        onRegisterMateria={onOpenMateriaModal}
        onImportPlan={() => setIsImportPlanModalOpen(true)}
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
          selectedMateriaId={selectedMateria?.id || ""}
          onSelectMateria={(id) => {
            setSelectedMateriaId(id);
            setSearchParams({ materiaId: id }, { replace: true });
          }}
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
              onOpenEvaluationModal={() => onOpenEvaluationModal(selectedMateria.id)}
              onEditEvaluation={onEditEvaluation}
              onDeleteEvaluation={handleDeleteEvaluation}
            />

            <MaterialsManager
              materials={materiaMaterials}
              materiaNombre={selectedMateria.nombre}
              onViewPdf={onViewPdf}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
              onEditMaterial={(mat) => {
                setMaterialToEdit(mat);
                setIsEditMaterialModalOpen(true);
              }}
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
          existingUnits={existingUnits}
          onUpload={(file, titulo, categoria, unidad) =>
            uploadMaterial(file, titulo, categoria, selectedMateria.id, unidad)
          }
          onUploadBatch={(items) =>
            uploadBatchMaterials(items, selectedMateria.id)
          }
        />
      )}

      {/* Modal para editar y recategorizar material de estudio */}
      {selectedMateria && isEditMaterialModalOpen && materialToEdit && (
        <EditMaterialModal
          isOpen={isEditMaterialModalOpen}
          onClose={() => {
            setIsEditMaterialModalOpen(false);
            setMaterialToEdit(null);
          }}
          material={materialToEdit}
          materiaNombre={selectedMateria.nombre}
          existingUnits={existingUnits}
          onSave={async (id, updates) => {
            await updateMaterial(id, updates);
          }}
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

      {/* Modal para importar plan de estudios con IA */}
      <ImportPlanModal
        isOpen={isImportPlanModalOpen}
        onClose={() => setIsImportPlanModalOpen(false)}
      />
    </div>
  );
};

export default MateriasView;
