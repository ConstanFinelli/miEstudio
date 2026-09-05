import React, { useState, useMemo } from 'react';
import styles from '../ApuntesView.module.css';
import { Flame, Check, Copy } from 'lucide-react';
import katex from 'katex';
import type { ApunteNota } from '../../../types/academic';

interface NoteReaderContentProps {
  activeNote: ApunteNota;
  viewMode: 'render' | 'markdown' | 'split';
}

export const NoteReaderContent: React.FC<NoteReaderContentProps> = ({
  activeNote,
  viewMode
}) => {
  const [copied, setCopied] = useState(false);

  // Render KaTeX formula safely
  const renderedKatex = useMemo(() => {
    try {
      return katex.renderToString('Q = \\lfloor N / 2 \\rfloor + 1', {
        displayMode: true,
        throwOnError: false
      });
    } catch {
      return 'Q = floor(N/2) + 1';
    }
  }, []);

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const goCodeSnippet = `// Nodo Raft en Go
type RaftNode struct {
    mu          sync.Mutex
    peers       []*rpc.ClientEnd
    currentTerm int
    votedFor    int
    state       NodeRole // Follower, Candidate, Leader
}`;

  return (
    <div className={styles.editorScrollArea} style={{ flex: 1 }}>
      <h1 className={styles.noteDocTitle}># {activeNote.titulo}</h1>

      <div className={styles.docMetaGroup}>
        <div>Materia: <strong>{activeNote.materiaNombre}</strong></div>
        <div>Evaluación: <strong>{activeNote.evaluacionNombre || 'General'}</strong></div>
        <div>Modificado: {activeNote.fechaModificacion}</div>
      </div>

      {viewMode === 'markdown' ? (
        <textarea
          defaultValue={activeNote.contenidoMarkdown}
          style={{
            width: '100%',
            height: '400px',
            background: 'var(--surface-1)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            padding: '16px',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)'
          }}
        />
      ) : (
        <>
          {/* 1. Alerta Callout */}
          <div className={styles.calloutCritical}>
            <div className={styles.calloutHeader}>
              <Flame size={14} />
              <span>REGLA CRÍTICA PARA EL 1ER PARCIAL</span>
            </div>
            <p className={styles.calloutBody}>
              Memorizar condición de <strong>quórum mayoritaria estricta</strong>:{' '}
              <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--surface-3)', padding: '1px 4px', borderRadius: '2px' }}>
                Q = floor(N/2) + 1
              </code>. En un clúster de <strong>N=5</strong> nodos, tolera exactamente <strong>2 fallos simultáneos</strong> sin comprometer la liveness ni crear split-brain.
            </p>
          </div>

          {/* 2. KaTeX Math Block */}
          <div className={styles.mathDisplayBox}>
            <div className={styles.mathHeader}>KaTeX · Formal Definition</div>
            <div
              className={styles.mathFormula}
              dangerouslySetInnerHTML={{ __html: renderedKatex }}
            />
            <div style={{ display: 'flex', gap: '24px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
              <span>N = Servidores Activos</span>
              <span>Q = Mayoría Absoluta</span>
            </div>
          </div>

          {/* 3. Section 1 Heading */}
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>
            1. Introducción y Problema del Consenso
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            El consenso implica múltiples servidores acordando valores de estado. En presencia de desconexiones de red y demoras arbitrarias, Raft descompone la problemática en tres subproblemas independientes: <strong>Elección de Líder</strong>, <strong>Replicación de Logs</strong> y <strong>Seguridad</strong>.
          </p>

          {/* 4. Go Code Snippet */}
          <div className={styles.codeBlock}>
            <div className={styles.codeHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                <span style={{ marginLeft: '6px' }}>raft_node.go</span>
              </div>
              <button
                onClick={() => handleCopyCode(goCodeSnippet)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '11px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {copied ? <Check size={12} color="var(--emerald)" /> : <Copy size={12} />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <pre className={styles.codeContent}>
              <code>{goCodeSnippet}</code>
            </pre>
          </div>

          {/* 5. Summary Table */}
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '12px' }}>
            Tabla de Estados de un Nodo Raft:
          </h3>
          <table className={styles.markdownTable}>
            <thead>
              <tr>
                <th>Estado</th>
                <th>Responsabilidad</th>
                <th>Transición Si...</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Follower</strong></td>
                <td>Responde RPCs de candidatos y líderes</td>
                <td>Expira el election timeout sin heartbeat</td>
              </tr>
              <tr>
                <td><strong>Candidate</strong></td>
                <td>Solicita votos (<code>RequestVoteRPC</code>)</td>
                <td>Obtiene quórum mayoritario ($Q$) o vence timeout</td>
              </tr>
              <tr>
                <td><strong>Leader</strong></td>
                <td>Atiende clientes y replica logs</td>
                <td>Recibe RPC con un término mayor</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default NoteReaderContent;
