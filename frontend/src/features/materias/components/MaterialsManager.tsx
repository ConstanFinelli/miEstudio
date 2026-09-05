import React from 'react';
import styles from '../MateriasView.module.css';
import { Eye, FileDown } from 'lucide-react';
import type { MaterialEstudio } from '../../../types/academic';

interface MaterialsManagerProps {
  materials: MaterialEstudio[];
  materiaNombre: string;
  onViewPdf: (title: string, url: string) => void;
}

export const MaterialsManager: React.FC<MaterialsManagerProps> = ({
  materials,
  materiaNombre,
  onViewPdf
}) => {
  return (
    <div className={styles.materialsSection}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
          MATERIALES DE ESTUDIO & VISOR DE PDFS ({materials.length})
        </div>
        <button
          className={styles.btnActionLight}
          onClick={() => alert('Subir nuevo PDF para ' + materiaNombre)}
        >
          + Subir PDF / Guía
        </button>
      </div>

      {materials.map((mat) => (
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
  );
};

export default MaterialsManager;
