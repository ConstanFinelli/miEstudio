import React, { useState, useRef, useEffect } from 'react';
import styles from './ImportPlanModal.module.css';
import {
  Sparkles,
  X,
  UploadCloud,
  FileText,
  File,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Plus,
  ArrowLeft,
  Loader2,
  Check
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { aiService } from '../../../../services/aiService';
import { materiasService } from '../../../../services/materiasService';
import type { ParsedSubjectItem, ParseStudyPlanResponse } from '../../../../types/academic';
import { GeminiApiKeyModal } from '../../../../components/modals';

interface ImportPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ImportPlanModal: React.FC<ImportPlanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, activeCarrera, carreras, reloadCarreras } = useAuth();

  // Navigation steps
  const [step, setStep] = useState<'upload' | 'review'>('upload');

  // Step 1: Upload state
  const [sourceTab, setSourceTab] = useState<'file' | 'text'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [texto, setTexto] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCarreraId, setSelectedCarreraId] = useState('');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // Parsing & Loading state
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Step 2: Confirmation & Review state
  const [carreraNombre, setCarreraNombre] = useState('');
  const [duracionAnios, setDuracionAnios] = useState(5);
  const [replacePlan, setReplacePlan] = useState(true);
  const [subjects, setSubjects] = useState<ParsedSubjectItem[]>([]);

  // Ref for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('upload');
      setFile(null);
      setTexto('');
      setErrorMessage(null);
      setSuccessMessage(null);
      setSelectedCarreraId(activeCarrera?.id || carreras[0]?.id || '');
      setCarreraNombre(activeCarrera?.nombre || '');
    }
  }, [isOpen, activeCarrera, carreras]);

  if (!isOpen) return null;

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      setErrorMessage(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  // Step 1: Start AI Extraction
  const handleStartExtraction = async () => {
    if (sourceTab === 'file' && !file) {
      setErrorMessage('Por favor, selecciona un archivo PDF o imagen del plan de estudio.');
      return;
    }
    if (sourceTab === 'text' && !texto.trim()) {
      setErrorMessage('Por favor, ingresa el texto con las materias del plan.');
      return;
    }

    setIsParsing(true);
    setErrorMessage(null);

    try {
      const resp: ParseStudyPlanResponse = await aiService.parseStudyPlan({
        file: sourceTab === 'file' && file ? file : undefined,
        texto: sourceTab === 'text' ? texto : undefined,
      });

      if (!resp.materias || resp.materias.length === 0) {
        throw new Error('La IA no pudo detectar materias en el contenido proporcionado. Intenta con un documento más claro o copia el texto.');
      }

      const normalizedMaterias = (resp.materias || []).map(m => {
        let cuatri = '1C';
        const cUpper = (m.cuatrimestre || '').toUpperCase().trim();
        if (cUpper === 'ANUAL' || cUpper === 'A' || cUpper.includes('ANUAL')) {
          cuatri = 'Anual';
        } else if (cUpper === '2C' || cUpper === 'SEGUNDO' || cUpper === '2' || cUpper.includes('2')) {
          cuatri = '2C';
        } else {
          cuatri = '1C';
        }

        return {
          ...m,
          cuatrimestre: cuatri,
        };
      });

      setSubjects(normalizedMaterias);
      setDuracionAnios(resp.duracion_anios || 5);
      if (resp.carrera_sugerida) {
        setCarreraNombre(resp.carrera_sugerida);
      }
      setStep('review');
    } catch (err: any) {
      console.error('Error extrayendo plan:', err);
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        'Ocurrió un error al procesar el plan de estudio con Gemini.';
      setErrorMessage(msg);
    } finally {
      setIsParsing(false);
    }
  };

  // Step 2: Subject Card Edits
  const handleUpdateSubject = (index: number, field: keyof ParsedSubjectItem, value: any) => {
    setSubjects(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleDeleteSubject = (index: number) => {
    setSubjects(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddSubjectToYear = (anio: number) => {
    const newSub: ParsedSubjectItem = {
      temp_id: `manual_${Date.now()}`,
      codigo: '',
      nombre: 'Nueva Asignatura',
      anio,
      cuatrimestre: '1C',
      modalidad: 'Presencial',
      correlativas_cursar: [],
      correlativas_rendir: [],
      estado: 'PENDIENTE',
    };
    setSubjects(prev => [...prev, newSub]);
  };

  const handleRemoveCorrelativa = (
    subjectIndex: number,
    tipo: 'cursar' | 'rendir',
    refIndex: number
  ) => {
    setSubjects(prev => {
      const copy = [...prev];
      const target = { ...copy[subjectIndex] };
      if (tipo === 'cursar') {
        target.correlativas_cursar = target.correlativas_cursar.filter((_, i) => i !== refIndex);
      } else {
        target.correlativas_rendir = target.correlativas_rendir.filter((_, i) => i !== refIndex);
      }
      copy[subjectIndex] = target;
      return copy;
    });
  };

  const handleAddCorrelativa = (
    subjectIndex: number,
    tipo: 'cursar' | 'rendir',
    refName: string
  ) => {
    if (!refName.trim()) return;
    setSubjects(prev => {
      const copy = [...prev];
      const target = { ...copy[subjectIndex] };
      if (tipo === 'cursar') {
        if (!target.correlativas_cursar.includes(refName.trim())) {
          target.correlativas_cursar = [...target.correlativas_cursar, refName.trim()];
        }
      } else {
        if (!target.correlativas_rendir.includes(refName.trim())) {
          target.correlativas_rendir = [...target.correlativas_rendir, refName.trim()];
        }
      }
      copy[subjectIndex] = target;
      return copy;
    });
  };

  // Step 2: Final Commit
  const handleConfirmImport = async () => {
    if (!selectedCarreraId) {
      setErrorMessage('Debes seleccionar la carrera a la que pertenece este plan de estudio.');
      return;
    }
    if (subjects.length === 0) {
      setErrorMessage('No hay materias en el plan para importar.');
      return;
    }

    setIsImporting(true);
    setErrorMessage(null);

    try {
      await materiasService.batchImportPlan({
        carrera_id: selectedCarreraId,
        replace_plan: replacePlan,
        duracion_anios: duracionAnios,
        materias: subjects,
      });

      await reloadCarreras();
      // Notificar a toda la app que se actualizaron materias
      window.dispatchEvent(new CustomEvent('materias:updated'));

      setSuccessMessage(`¡${subjects.length} materias importadas exitosamente!`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Error importando plan:', err);
      setErrorMessage(
        err?.response?.data?.error ||
        err?.message ||
        'Error al guardar el plan en la base de datos.'
      );
    } finally {
      setIsImporting(false);
    }
  };

  // Group subjects by year for the review step
  const yearsSet = new Set<number>();
  for (let y = 1; y <= duracionAnios; y++) {
    yearsSet.add(y);
  }
  subjects.forEach(s => {
    if (s.anio > 0) yearsSet.add(s.anio);
  });
  const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          {/* Top Header */}
          <div className={styles.header}>
            <div className={styles.headerTitleWrapper}>
              <div className={styles.iconWrapper}>
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className={styles.title}>
                  {step === 'upload' ? 'Importar Plan de Estudio con IA' : 'Revisión y Confirmación del Plan'}
                </h2>
                <p className={styles.subtitle}>
                  {step === 'upload'
                    ? 'Sube el programa oficial para extraer automáticamente materias y correlatividades'
                    : `Revisa y ajusta las ${subjects.length} materias antes de incorporarlas a tu carrera`}
                </p>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={onClose} title="Cerrar modal">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className={styles.body}>
            {/* Messages */}
            {errorMessage && (
              <div className={styles.keyAlertWarning}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}
            {successMessage && (
              <div className={styles.keyAlertSuccess}>
                <CheckCircle2 size={16} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* =======================================================
                STEP 1: UPLOAD & EXTRACTION
                ======================================================= */}
            {step === 'upload' && !isParsing && (
              <>
                {/* Key Status Banner */}
                {user?.has_gemini_key ? (
                  <div className={styles.keyAlertSuccess}>
                    <CheckCircle2 size={16} />
                    <span>Clave personal de Google Gemini conectada. Se usará para procesar el plan.</span>
                  </div>
                ) : (
                  <div className={styles.keyAlertSuccess}>
                    <Sparkles size={16} />
                    <span>Extracción inteligente con IA del servidor habilitada.</span>
                  </div>
                )}

                {/* Target Carrera Selection */}
                <div className={styles.targetCarreraRow}>
                  <label className={styles.metaLabel}>Carrera de Destino</label>
                  <select
                    className={styles.carreraSelect}
                    value={selectedCarreraId}
                    onChange={e => {
                      setSelectedCarreraId(e.target.value);
                      const c = carreras.find(x => x.id === e.target.value);
                      if (c) setCarreraNombre(c.nombre);
                    }}
                  >
                    {carreras.map(c => (
                      <option key={c.id} value={c.id}>
                        🎓 {c.nombre} ({c.facultad_sede})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Source Selection Tabs */}
                <div className={styles.sourceToggleRow}>
                  <button
                    type="button"
                    className={`${styles.sourceTabBtn} ${sourceTab === 'file' ? styles.sourceTabBtnActive : ''}`}
                    onClick={() => setSourceTab('file')}
                  >
                    <File size={15} /> Subir PDF o Imagen
                  </button>
                  <button
                    type="button"
                    className={`${styles.sourceTabBtn} ${sourceTab === 'text' ? styles.sourceTabBtnActive : ''}`}
                    onClick={() => setSourceTab('text')}
                  >
                    <FileText size={15} /> Pegar Texto del Plan
                  </button>
                </div>

                {/* File Dropzone */}
                {sourceTab === 'file' && (
                  <>
                    {!file ? (
                      <div
                        className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          accept=".pdf,image/png,image/jpeg,image/webp"
                          onChange={handleFileChange}
                        />
                        <div className={styles.dropzoneIcon}>
                          <UploadCloud size={26} />
                        </div>
                        <p className={styles.dropzoneText}>
                          Arrastra aquí el PDF o imagen del Plan de Estudios, o{' '}
                          <span style={{ color: '#818cf8', textDecoration: 'underline' }}>
                            haz clic para examinar
                          </span>
                        </p>
                        <p className={styles.dropzoneSubtext}>
                          Soporta PDF oficial de cátedra, organigramas o capturas de la malla curricular (hasta 15MB)
                        </p>
                      </div>
                    ) : (
                      <div className={styles.filePreviewCard}>
                        <div className={styles.filePreviewInfo}>
                          <File size={24} color="#818cf8" />
                          <div>
                            <div className={styles.fileName}>{file.name}</div>
                            <div className={styles.fileMeta}>
                              {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Documento'}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={styles.removeFileBtn}
                          onClick={() => setFile(null)}
                          title="Quitar archivo"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Text Input Option */}
                {sourceTab === 'text' && (
                  <div>
                    <textarea
                      className={styles.textInputArea}
                      value={texto}
                      onChange={e => setTexto(e.target.value)}
                      placeholder="Pega aquí el listado de materias, años, cuatrimestres y correlatividades copiado de la web de tu universidad o facultad..."
                    />
                  </div>
                )}
              </>
            )}

            {/* Parsing Loading State */}
            {isParsing && (
              <div className={styles.loadingOverlay}>
                <Loader2 size={40} className={styles.spinner} />
                <h3 style={{ margin: '0', color: '#f8fafc', fontSize: '1.1rem' }}>
                  Gemini está analizando la malla curricular...
                </h3>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.86rem', maxWidth: '420px' }}>
                  Extrayendo asignaturas, códigos, cuatrimestres y correlatividades para cursada y examen final.
                </p>
              </div>
            )}

            {/* =======================================================
                STEP 2: CONFIRMATION & INTERACTIVE REVIEW
                ======================================================= */}
            {step === 'review' && !isImporting && (
              <>
                {/* Summary Meta Bar */}
                <div className={styles.summaryBar}>
                  <div className={styles.summaryMeta}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Carrera</span>
                      <span className={styles.metaValue}>{carreraNombre || 'Carrera Universitaria'}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Materias Detectadas</span>
                      <span className={styles.metaValue} style={{ color: '#34d399' }}>
                        {subjects.length} asignaturas
                      </span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Duración en Años</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={duracionAnios}
                        onChange={e => setDuracionAnios(parseInt(e.target.value) || 5)}
                        style={{
                          width: '55px',
                          background: 'rgba(15, 23, 42, 0.6)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '6px',
                          color: '#f8fafc',
                          padding: '2px 6px',
                          fontWeight: 'bold',
                        }}
                      />
                    </div>
                  </div>

                  {/* Replace Mode Toggle */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <label className={styles.replacePlanToggle}>
                      <input
                        type="checkbox"
                        className={styles.replaceCheckbox}
                        checked={replacePlan}
                        onChange={e => setReplacePlan(e.target.checked)}
                      />
                      <span>Reemplazar / sincronizar plan actual</span>
                    </label>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8', paddingLeft: '24px' }}>
                      {replacePlan
                        ? 'Sincroniza el plan: actualiza correlatividades y materias existentes (conservando apuntes y notas) y quita las que ya no pertenezcan al plan.'
                        : 'Fusionar: agrega materias nuevas y actualiza existentes sin eliminar ninguna materia previa.'}
                    </span>
                  </div>
                </div>

                {/* Years & Subjects List */}
                <div className={styles.yearsContainer}>
                  {sortedYears.map(anio => {
                    const yearSubjects = subjects.filter(s => s.anio === anio);

                    return (
                      <div key={anio} className={styles.yearGroup}>
                        <div className={styles.yearHeader}>
                          <div className={styles.yearTitle}>
                            <span>{anio}° Año</span>
                            <span className={styles.yearBadge}>{yearSubjects.length} materias</span>
                          </div>
                        </div>

                        <div className={styles.subjectsTable}>
                          {yearSubjects.map(subject => {
                            const globalIndex = subjects.findIndex(s => s.temp_id === subject.temp_id);

                            return (
                              <div key={subject.temp_id} className={styles.subjectCard}>
                                <div className={styles.cardMainRow}>
                                  <input
                                    type="text"
                                    className={styles.codeField}
                                    value={subject.codigo}
                                    placeholder="Cód."
                                    onChange={e => handleUpdateSubject(globalIndex, 'codigo', e.target.value)}
                                    title="Código de la asignatura"
                                  />
                                  <input
                                    type="text"
                                    className={styles.nameField}
                                    value={subject.nombre}
                                    placeholder="Nombre de la materia"
                                    onChange={e => handleUpdateSubject(globalIndex, 'nombre', e.target.value)}
                                  />
                                  <select
                                    className={styles.cuatriSelect}
                                    value={
                                      (subject.cuatrimestre || '').toUpperCase().includes('ANUAL') || subject.cuatrimestre === 'A'
                                        ? 'Anual'
                                        : (subject.cuatrimestre || '').toUpperCase().includes('2')
                                        ? '2C'
                                        : '1C'
                                    }
                                    onChange={e => handleUpdateSubject(globalIndex, 'cuatrimestre', e.target.value)}
                                  >
                                    <option value="1C">1° Cuat.</option>
                                    <option value="2C">2° Cuat.</option>
                                    <option value="Anual">Anual</option>
                                  </select>
                                  <select
                                    className={styles.cuatriSelect}
                                    value={subject.modalidad || 'Presencial'}
                                    onChange={e => handleUpdateSubject(globalIndex, 'modalidad', e.target.value)}
                                  >
                                    <option value="Presencial">Presencial</option>
                                    <option value="Virtual">Virtual</option>
                                    <option value="Híbrida">Híbrida</option>
                                  </select>
                                  <button
                                    type="button"
                                    className={styles.deleteSubjectBtn}
                                    onClick={() => handleDeleteSubject(globalIndex)}
                                    title="Eliminar materia del plan"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>

                                {/* Correlatividades */}
                                <div className={styles.cardCorrelativasRow}>
                                  {/* Cursar */}
                                  <div className={styles.correlativasGroup}>
                                    <span className={styles.correlativasLabel}>Para Cursar:</span>
                                    {subject.correlativas_cursar.length === 0 ? (
                                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Ninguna</span>
                                    ) : (
                                      subject.correlativas_cursar.map((correlativa, cIdx) => (
                                        <span key={cIdx} className={styles.chip}>
                                          {correlativa}
                                          <button
                                            type="button"
                                            className={styles.chipRemoveBtn}
                                            onClick={() => handleRemoveCorrelativa(globalIndex, 'cursar', cIdx)}
                                          >
                                            ×
                                          </button>
                                        </span>
                                      ))
                                    )}
                                    <button
                                      type="button"
                                      className={styles.addChipBtn}
                                      onClick={() => {
                                        const val = window.prompt('Nombre o código de la materia correlativa para cursar:');
                                        if (val) handleAddCorrelativa(globalIndex, 'cursar', val);
                                      }}
                                      title="Agregar correlativa para cursar"
                                    >
                                      + Correlativa
                                    </button>
                                  </div>

                                  {/* Rendir */}
                                  <div className={styles.correlativasGroup}>
                                    <span className={styles.correlativasLabel}>Para Final:</span>
                                    {subject.correlativas_rendir.length === 0 ? (
                                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Ninguna</span>
                                    ) : (
                                      subject.correlativas_rendir.map((correlativa, rIdx) => (
                                        <span key={rIdx} className={`${styles.chip} ${styles.chipRendir}`}>
                                          {correlativa}
                                          <button
                                            type="button"
                                            className={styles.chipRemoveBtn}
                                            onClick={() => handleRemoveCorrelativa(globalIndex, 'rendir', rIdx)}
                                          >
                                            ×
                                          </button>
                                        </span>
                                      ))
                                    )}
                                    <button
                                      type="button"
                                      className={styles.addChipBtn}
                                      onClick={() => {
                                        const val = window.prompt('Nombre o código de la materia correlativa para final:');
                                        if (val) handleAddCorrelativa(globalIndex, 'rendir', val);
                                      }}
                                      title="Agregar correlativa para rendir final"
                                    >
                                      + Correlativa
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          className={styles.addSubjectBtn}
                          onClick={() => handleAddSubjectToYear(anio)}
                        >
                          <Plus size={13} /> Agregar Materia a {anio}° Año
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Importing Loading State */}
            {isImporting && (
              <div className={styles.loadingOverlay}>
                <Loader2 size={40} className={styles.spinner} />
                <h3 style={{ margin: '0', color: '#f8fafc', fontSize: '1.1rem' }}>
                  Guardando plan de estudio y vinculando correlatividades...
                </h3>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.86rem' }}>
                  Creando asignaturas en la base de datos y resolviendo dependencias cruzadas.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            {step === 'upload' ? (
              <>
                <button type="button" className={styles.cancelBtn} onClick={onClose}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className={styles.primaryActionBtn}
                  onClick={handleStartExtraction}
                  disabled={isParsing || (!file && !texto.trim())}
                >
                  <Sparkles size={15} />
                  Extraer Plan con IA
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setStep('upload')}
                  disabled={isImporting}
                >
                  <ArrowLeft size={14} style={{ display: 'inline', marginRight: 4 }} />
                  Volver a Cargar
                </button>
                <button
                  type="button"
                  className={styles.primaryActionBtn}
                  onClick={handleConfirmImport}
                  disabled={isImporting || subjects.length === 0}
                >
                  {isImporting ? (
                    <>
                      <Loader2 size={15} className={styles.spinner} />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      Confirmar e Importar {subjects.length} Materias
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <GeminiApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
      />
    </>
  );
};
