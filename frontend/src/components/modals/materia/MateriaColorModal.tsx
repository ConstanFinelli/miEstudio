import React, { useState, useEffect } from "react";
import styles from "./MateriaColorModal.module.css";
import { X, Palette, Clock, Building2, Save } from "lucide-react";
import { materiasService } from "../../../services";
import { ColorPickerRGB, PRESET_COLORS } from "../../common/ColorPickerRGB";

export { PRESET_COLORS };

interface MateriaColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  materia: {
    id: string;
    nombre: string;
    codigo?: string;
    color?: string;
  } | null;
  onSuccess?: (materiaId: string, newColor: string) => void;
}

export const MateriaColorModal: React.FC<MateriaColorModalProps> = ({
  isOpen,
  onClose,
  materia,
  onSuccess,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>(
    materia?.color || "#3b82f6"
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (materia?.color) {
      setSelectedColor(materia.color);
    }
  }, [materia]);

  if (!isOpen || !materia) return null;

  const handleSave = async (colorToSave?: string) => {
    const finalColor = colorToSave || selectedColor;
    try {
      setIsSaving(true);
      const updated = await materiasService.updateMateria(materia.id, {
        color: finalColor,
      });
      window.dispatchEvent(
        new CustomEvent("materias:updated", { detail: updated })
      );
      onSuccess?.(materia.id, finalColor);
      onClose();
    } catch (err) {
      console.error("Error al actualizar color de materia:", err);
      alert("No se pudo guardar el nuevo color.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.titleRow}>
            <div
              className={styles.iconSquare}
              style={{
                backgroundColor: `${selectedColor}25`,
                color: selectedColor,
              }}
            >
              <Palette size={16} />
            </div>
            <div>
              <h3 className={styles.title}>Color de la Materia</h3>
              <p className={styles.materiaSub}>
                {materia.codigo ? `[${materia.codigo}] ` : ""}
                {materia.nombre}
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            title="Cerrar (Esc)"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <ColorPickerRGB
            value={selectedColor}
            onChange={setSelectedColor}
            label="Selector de Color"
            hint="Elegí un color de la paleta o personalizá con sliders RGB, cuentagotas y código hexadecimal:"
            defaultExpandedSliders={true}
          />

          {/* Live Preview Card */}
          <div className={styles.previewSection}>
            <span className={styles.previewLabel}>
              Vista previa en Horarios de Cursada:
            </span>
            <div
              className={styles.previewCard}
              style={{
                backgroundColor: `${selectedColor}18`,
                border: `1px solid ${selectedColor}55`,
                borderLeft: `4px solid ${selectedColor}`,
              }}
            >
              <div className={styles.previewTop}>
                <span className={styles.previewMateriaTitle}>
                  {materia.nombre}
                </span>
                <span className={styles.previewCode}>
                  {materia.codigo || "MAT"}
                </span>
              </div>
              <div className={styles.previewMetaRow}>
                <Clock size={11} style={{ color: selectedColor }} />
                <span>08:00 - 12:00 hs • Teoría</span>
              </div>
              <div className={styles.previewMetaRow}>
                <Building2 size={11} style={{ color: "var(--text-dim)" }} />
                <span>Sede Central • Aula 204</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.btnCancel}
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.btnSave}
            onClick={() => handleSave()}
            disabled={isSaving}
            style={{ backgroundColor: selectedColor }}
          >
            <Save size={13} />
            <span>{isSaving ? "Guardando..." : "Aplicar Color"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MateriaColorModal;
