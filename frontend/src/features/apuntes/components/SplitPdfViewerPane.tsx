import React from 'react';
import styles from '../ApuntesView.module.css';
import { X } from 'lucide-react';

interface SplitPdfViewerPaneProps {
  onClose: () => void;
}

export const SplitPdfViewerPane: React.FC<SplitPdfViewerPaneProps> = ({ onClose }) => {
  return (
    <div className={styles.pdfPane} style={{ flex: 1, minWidth: '400px' }}>
      <div className={styles.pdfHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
          <span style={{ background: 'var(--primary)', color: 'white', fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '2px' }}>DOC</span>
          <span style={{ color: 'var(--text-primary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Visor de Documentos de Cátedra
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', background: 'var(--surface-3)', padding: '2px 6px', borderRadius: '3px' }}>
            Modo Estudio Paralelo
          </span>
          <button
            className={styles.toolBtn}
            style={{ padding: '3px 6px' }}
            onClick={onClose}
            title="Cerrar visor y restaurar paneles laterales"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Reader Canvas Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: 'var(--bg-canvas)', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-md)',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '6px', lineHeight: 1.3 }}>
              Lectura y Apuntes en Paralelo
            </h2>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              Visor split-view para consulta bibliográfica activa
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--surface-2)',
            borderLeft: '2px solid var(--primary)',
            padding: '10px 14px',
            borderRadius: '2px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            lineHeight: 1.5
          }}>
            <strong>Modo Split-View Activado:</strong> Las columnas laterales se han replegado automáticamente para brindarte el máximo espacio visual. Puedes cargar archivos PDF desde la sección de <em>Materias &gt; Materiales</em> para consultarlos aquí mientras redactas.
          </div>

          <div style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>Técnica de Estudio Efectiva</strong>
            Alinea conceptos teóricos con demostraciones prácticas. Cuando formules hipótesis o extraigas resúmenes, usa la barra de herramientas superior para insertar bloques KaTeX y snippets de código copiables con un clic.
          </div>

          <div style={{
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            padding: '14px',
            textAlign: 'center',
            backgroundColor: 'var(--surface-2)'
          }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--primary-glow)', marginBottom: '4px' }}>
              [Espacio de Lectura y Referencias]
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              Sincronizado con el apunte activo en pantalla
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplitPdfViewerPane;
