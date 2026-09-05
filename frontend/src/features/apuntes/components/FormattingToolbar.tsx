import React from 'react';
import styles from '../ApuntesView.module.css';
import { X } from 'lucide-react';

interface FormattingToolbarProps {
  tags: string[];
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({ tags }) => {
  return (
    <div className={styles.formattingToolbar}>
      <div className={styles.toolbarGroup}>
        <button className={styles.toolBtn}>H1</button>
        <button className={styles.toolBtn}>H2</button>
        <button className={styles.toolBtn}>B</button>
        <button className={styles.toolBtn}>I</button>
        <button className={styles.toolBtn}>`code`</button>
        <button className={`${styles.toolBtn} ${styles.toolBtnKatex}`}>KaTeX $$</button>
        <button className={styles.toolBtn}>Lista</button>
        <button className={styles.toolBtn}>Tabla</button>
        <button className={styles.toolBtn}>&quot;Cita&quot;</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {tags.map(t => (
          <span key={t} className={styles.miniTag} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            #{t}
            <X size={10} style={{ cursor: 'pointer' }} />
          </span>
        ))}
        <span style={{ fontSize: '11px', color: 'var(--text-dim)', cursor: 'pointer' }}>+</span>
      </div>
    </div>
  );
};

export default FormattingToolbar;
