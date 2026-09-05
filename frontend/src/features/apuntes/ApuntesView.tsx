import React, { useState, useMemo } from 'react';
import styles from './ApuntesView.module.css';
import {
  Folder,
  Plus,
  Search,
  Cloud,
  Share2,
  Download,
  Flame,
  Check,
  Copy,
  Columns,
  Eye,
  Code,
  X,
  BookOpen,
  ChevronLeft
} from 'lucide-react';
import katex from 'katex';
import { mockApuntes } from '../../data/mockData';
import type { ApunteNota } from '../../types/academic';

interface ApuntesViewProps {
  onOpenNoteModal: () => void;
}

export const ApuntesView: React.FC<ApuntesViewProps> = ({ onOpenNoteModal }) => {
  const [selectedFolder, setSelectedFolder] = useState('Sistemas Distribuidos');
  const [selectedSubFolder, setSelectedSubFolder] = useState<string | null>('1er Parcial');
  const [activeNoteId, setActiveNoteId] = useState('note-1');
  const [viewMode, setViewMode] = useState<'render' | 'markdown' | 'split'>('render');
  const [showPdfSplit, setShowPdfSplit] = useState(false);
  const [isFoldersCollapsed, setIsFoldersCollapsed] = useState(false);
  const [isNotesListCollapsed, setIsNotesListCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto-collapse sidebars when activating split mode for a spacious study layout
  const handleToggleSplit = () => {
    if (!showPdfSplit) {
      setShowPdfSplit(true);
      setIsFoldersCollapsed(true);
      setIsNotesListCollapsed(true);
    } else {
      setShowPdfSplit(false);
      setIsFoldersCollapsed(false);
      setIsNotesListCollapsed(false);
    }
  };

  const activeNote: ApunteNota = mockApuntes.find(n => n.id === activeNoteId) || mockApuntes[0];

  const filteredNotes = useMemo(() => {
    return mockApuntes.filter(n => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return n.titulo.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q));
      }
      return true;
    });
  }, [searchQuery]);

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
    <div className={styles.container}>
      {/* 1. Left Folders Column (Collapsible) */}
      {isFoldersCollapsed ? (
        <aside className={styles.foldersColumnCollapsed}>
          <button
            className={styles.railToggleBtn}
            onClick={() => setIsFoldersCollapsed(false)}
            title="Expandir Carpetas de Carrera"
          >
            <Folder size={14} color="var(--primary)" />
          </button>
          <span className={styles.railVerticalLabel}>Carpetas</span>
        </aside>
      ) : (
        <aside className={styles.foldersColumn}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 12px 4px 12px' }}>
            <span className={styles.folderSectionTitle} style={{ padding: 0 }}>Carpetas (4)</span>
            <button
              className={styles.toolBtn}
              style={{ padding: '2px 5px' }}
              onClick={() => setIsFoldersCollapsed(true)}
              title="Colapsar panel de carpetas"
            >
              <ChevronLeft size={12} />
            </button>
          </div>

          <div className={styles.foldersList}>
            {/* Sistemas Distribuidos */}
            <div>
              <div
                className={`${styles.folderItem} ${selectedFolder === 'Sistemas Distribuidos' ? styles.folderItemActive : ''}`}
                onClick={() => setSelectedFolder('Sistemas Distribuidos')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Folder size={13} color="var(--primary)" />
                  <span>Sistemas Distribuidos</span>
                </div>
                <span className={styles.countBadge}>5</span>
              </div>

              {selectedFolder === 'Sistemas Distribuidos' && (
                <div>
                  <div
                    className={styles.folderSubItem}
                    style={{ color: selectedSubFolder === '1er Parcial' ? 'var(--text-primary)' : undefined }}
                    onClick={() => setSelectedSubFolder('1er Parcial')}
                  >
                    <span>↳ 1er Parcial</span>
                    <span className={styles.countBadge}>3</span>
                  </div>
                  <div
                    className={styles.folderSubItem}
                    style={{ color: selectedSubFolder === 'Laboratorios Go' ? 'var(--text-primary)' : undefined }}
                    onClick={() => setSelectedSubFolder('Laboratorios Go')}
                  >
                    <span>↳ Laboratorios Go</span>
                    <span className={styles.countBadge}>2</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bases de Datos II */}
            <div
              className={`${styles.folderItem} ${selectedFolder === 'Bases de Datos II' ? styles.folderItemActive : ''}`}
              onClick={() => setSelectedFolder('Bases de Datos II')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Folder size={13} color="var(--blue)" />
                <span>Bases de Datos II</span>
              </div>
              <span className={styles.countBadge}>8</span>
            </div>

            {/* Algoritmos III */}
            <div
              className={`${styles.folderItem} ${selectedFolder === 'Algoritmos III' ? styles.folderItemActive : ''}`}
              onClick={() => setSelectedFolder('Algoritmos III')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Folder size={13} color="var(--purple)" />
                <span>Algoritmos III</span>
              </div>
              <span className={styles.countBadge}>3</span>
            </div>

            {/* Redes de Datos */}
            <div
              className={`${styles.folderItem} ${selectedFolder === 'Redes de Datos' ? styles.folderItemActive : ''}`}
              onClick={() => setSelectedFolder('Redes de Datos')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Folder size={13} color="var(--emerald)" />
                <span>Redes de Datos</span>
              </div>
              <span className={styles.countBadge}>2</span>
            </div>

            <div className={styles.folderSectionTitle} style={{ marginTop: '12px', padding: '0 8px' }}>Histórico</div>
            <div className={styles.folderItem}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Folder size={13} color="var(--text-dim)" />
                <span>Archivo de Materias</span>
              </div>
              <span className={styles.countBadge}>24</span>
            </div>
          </div>

          <div className={styles.foldersFooter}>
            <button className={styles.btnNewFolder} onClick={() => alert('Crear nueva carpeta')}>
              <Plus size={12} />
              <span>+ Nueva Carpeta / Materia</span>
            </button>
          </div>
        </aside>
      )}

      {/* 2. Middle Notes List Column (Collapsible) */}
      {isNotesListCollapsed ? (
        <section className={styles.notesColumnCollapsed}>
          <button
            className={styles.railToggleBtn}
            onClick={() => setIsNotesListCollapsed(false)}
            title="Expandir Lista de Apuntes"
          >
            <BookOpen size={14} color="var(--text-secondary)" />
          </button>
          <span className={styles.railVerticalLabel}>Apuntes</span>
        </section>
      ) : (
        <section className={styles.notesColumn}>
          <div className={styles.notesHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className={styles.searchNoteRow} style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Search size={12} color="var(--text-muted)" />
                  <input
                    type="text"
                    placeholder="Buscar apunte..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ border: 'none', background: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '11px', width: '100%' }}
                  />
                </div>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>ESC</span>
              </div>
              <button
                className={styles.toolBtn}
                style={{ padding: '4px 6px' }}
                onClick={() => setIsNotesListCollapsed(true)}
                title="Colapsar lista de notas"
              >
                <ChevronLeft size={12} />
              </button>
            </div>

            <div className={styles.notesListStats}>
              <span>{filteredNotes.length} apuntes</span>
              <span style={{ cursor: 'pointer' }}>Cronológico ▾</span>
            </div>
          </div>

          <div className={styles.notesList}>
            {filteredNotes.map((note) => {
              const isActive = note.id === activeNote.id;
              return (
                <div
                  key={note.id}
                  className={`${styles.noteCard} ${isActive ? styles.noteCardActive : ''}`}
                  onClick={() => setActiveNoteId(note.id)}
                >
                  <div className={styles.noteCardTop}>
                    <h4 className={styles.noteCardTitle}>{note.titulo}</h4>
                    {isActive && <span className={styles.activeTag}>ACTIVO</span>}
                  </div>

                  <p className={styles.noteCardExcerpt}>{note.resumen}</p>

                  <div className={styles.noteCardFooter}>
                    <span>{note.fechaModificacion}</span>
                    <div className={styles.tagPillsRow}>
                      {note.tags.map(tag => (
                        <span key={tag} className={styles.miniTag}>#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.notesFooter}>
            <button className={styles.btnNewFolder} onClick={onOpenNoteModal}>
              <Plus size={12} />
              <span>+ Nueva Nota en esta Materia</span>
            </button>
          </div>
        </section>
      )}

      {/* 3. Right Editor / Visualizer Column */}
      <main className={styles.editorColumn}>
        {/* Editor Top Bar */}
        <header className={styles.editorTopBar}>
          <div className={styles.editorBreadcrumbs}>
            <span>WORKSPACE</span>
            <span>/</span>
            <span>{activeNote.materiaNombre}</span>
            <span>/</span>
            <span className={styles.parcialBadge}>Parcial 1</span>
            <span>·</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--emerald)' }}>
              <Cloud size={12} />
              <span>Autoguardado 15:42</span>
            </div>
          </div>

          <div className={styles.editorActionsRight}>
            {/* View Mode Toggle */}
            <div className={styles.viewModeToggle}>
              <button
                className={`${styles.viewModeBtn} ${viewMode === 'render' ? styles.viewModeBtnActive : ''}`}
                onClick={() => setViewMode('render')}
              >
                <Eye size={12} />
                <span>Render</span>
              </button>
              <button
                className={`${styles.viewModeBtn} ${viewMode === 'markdown' ? styles.viewModeBtnActive : ''}`}
                onClick={() => setViewMode('markdown')}
              >
                <Code size={12} />
                <span>Markdown</span>
              </button>
              <button
                className={`${styles.viewModeBtn} ${viewMode === 'split' ? styles.viewModeBtnActive : ''}`}
                onClick={() => setViewMode('split')}
              >
                <Columns size={12} />
                <span>Split</span>
              </button>
            </div>

            {/* Split PDF Mode Toggle Button */}
            <button
              className={`${styles.viewModeBtn} ${showPdfSplit ? styles.viewModeBtnActive : ''}`}
              onClick={handleToggleSplit}
              title="Abrir visor de material PDF lado a lado con notas (auto-colapsa barras laterales para máxima amplitud)"
            >
              <BookOpen size={12} />
              <span>{showPdfSplit ? 'Cerrar PDF' : 'Ver PDF al lado'}</span>
            </button>

            <button className={styles.btnNewFolder} style={{ width: 'auto', padding: '4px 8px' }}>
              <Download size={12} />
              <span>Exportar PDF</span>
            </button>

            <button className={styles.btnNewFolder} style={{ width: 'auto', padding: '4px 8px' }}>
              <Share2 size={12} />
              <span>Compartir</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--emerald)', fontFamily: 'var(--font-mono)' }}>
              <span>●</span>
              <span>Sincronizado</span>
            </div>
          </div>
        </header>

        {/* Formatting Toolbar */}
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
            {activeNote.tags.map(t => (
              <span key={t} className={styles.miniTag} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                #{t}
                <X size={10} style={{ cursor: 'pointer' }} />
              </span>
            ))}
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', cursor: 'pointer' }}>+</span>
          </div>
        </div>

        {/* Main Document Body or Split View */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Note Area */}
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
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '11px' }}
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

          {/* PDF Split-View Pane (50% real estate, realistic reader controls) */}
          {showPdfSplit && (
            <div className={styles.pdfPane} style={{ flex: 1, minWidth: '400px' }}>
              <div className={styles.pdfHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
                  <span style={{ background: 'var(--red)', color: 'white', fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '2px' }}>PDF</span>
                  <span style={{ color: 'var(--text-primary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Paper Raft (Ongaro & Ousterhout)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', background: 'var(--surface-3)', padding: '2px 6px', borderRadius: '3px' }}>
                    Pág. 1 / 18 · 100%
                  </span>
                  <button
                    className={styles.toolBtn}
                    style={{ padding: '3px 6px' }}
                    onClick={handleToggleSplit}
                    title="Cerrar visor PDF y restaurar paneles laterales"
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
                  backgroundColor: '#0d0d11',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  padding: '28px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '6px', lineHeight: 1.3 }}>
                      In Search of an Understandable Consensus Algorithm
                    </h2>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      Diego Ongaro and John Ousterhout · Stanford University
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: 'var(--surface-2)',
                    borderLeft: '2px solid var(--primary)',
                    padding: '8px 12px',
                    borderRadius: '2px',
                    fontSize: '11px',
                    fontStyle: 'italic',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5
                  }}>
                    <strong>Abstract —</strong> Raft is a consensus algorithm for managing a replicated log. It produces a result equivalent to (multi-Paxos), and it is as efficient as Paxos, but its structure makes it more understandable.
                  </div>

                  <div style={{ fontSize: '11px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>1. Introduction</strong>
                    Consensus algorithms allow a collection of machines to work as a coherent group that can survive the failures of some of its members. Raft decomposes consensus into relatively independent subproblems: Leader election, Log replication, and Safety...
                  </div>

                  <div style={{
                    border: '1px dashed var(--border-hover)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '10px',
                    textAlign: 'center',
                    backgroundColor: 'var(--surface-1)'
                  }}>
                    <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--emerald)', marginBottom: '4px' }}>
                      [Figure 3: Raft Server States & Transitions]
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Follower ⇄ Candidate ⇄ Leader
                    </div>
                  </div>

                  <div style={{ fontSize: '10px', color: 'var(--text-dim)', textAlign: 'center', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>
                    — Fin de Página 1 de 18 · Material de Estudio Oficial —
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
