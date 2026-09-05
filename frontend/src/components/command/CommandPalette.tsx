import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CommandPalette.module.css';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileText,
  PlusCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEvaluationModal: () => void;
  onOpenNoteModal: () => void;
  onStartPomodoro: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenEvaluationModal,
  onOpenNoteModal,
  onStartPomodoro
}) => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  interface CommandItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string; color?: string }>;
    kbd?: string;
    action: () => void;
  }

  interface CommandGroup {
    group: string;
    items: CommandItem[];
  }

  const commands: CommandGroup[] = [
    {
      group: 'Navegación Rápida',
      items: [
        { id: 'nav-dash', label: 'Ir al Dashboard', icon: LayoutDashboard, action: () => { navigate('/dashboard'); onClose(); } },
        { id: 'nav-mat', label: 'Ver Materias & Cursadas', icon: BookOpen, action: () => { navigate('/materias'); onClose(); } },
        { id: 'nav-cal', label: 'Abrir Calendario & Fechas', icon: Calendar, action: () => { navigate('/calendario'); onClose(); } },
        { id: 'nav-notes', label: 'Explorar Apuntes & Notas', icon: FileText, action: () => { navigate('/apuntes'); onClose(); } }
      ]
    },
    {
      group: 'Acciones del Sistema',
      items: [
        { id: 'act-eval', label: 'Registrar Nueva Instancia de Evaluación', icon: PlusCircle, kbd: '⌘E', action: () => { onOpenEvaluationModal(); onClose(); } },
        { id: 'act-note', label: 'Crear Nuevo Apunte Markdown', icon: PlusCircle, kbd: '⌘N', action: () => { onOpenNoteModal(); onClose(); } },
        { id: 'act-pomo', label: 'Iniciar Modo Enfoque Pomodoro (25m)', icon: Clock, kbd: '⌘P', action: () => { onStartPomodoro(); onClose(); } }
      ]
    },
    {
      group: 'Apariencia y Tema (Editorial Ivy)',
      items: [
        {
          id: 'act-theme',
          label: theme === 'dark' ? 'Cambiar a Modo Claro (Papel Editorial)' : 'Cambiar a Modo Oscuro (Oxford Navy)',
          icon: theme === 'dark' ? Sun : Moon,
          kbd: '⌘T',
          action: () => { toggleTheme(); onClose(); }
        }
      ]
    },
    {
      group: 'Materias Frecuentes',
      items: [
        { id: 'mat-sd', label: 'Sistemas Distribuidos (SIS-304)', icon: ArrowRight, action: () => { navigate('/materias'); onClose(); } },
        { id: 'mat-bd', label: 'Bases de Datos II (DAT-301)', icon: ArrowRight, action: () => { navigate('/materias'); onClose(); } },
        { id: 'mat-alg', label: 'Algoritmos y Estructuras III (ALG-302)', icon: ArrowRight, action: () => { navigate('/materias'); onClose(); } }
      ]
    }
  ];

  const filteredGroups = commands.map(group => ({
    ...group,
    items: group.items.filter(item => item.label.toLowerCase().includes(search.toLowerCase()))
  })).filter(group => group.items.length > 0);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.inputWrapper}>
          <span className={styles.terminalIcon}>&gt;</span>
          <input
            type="text"
            className={styles.input}
            placeholder="Escribe un comando o busca materias, exámenes y notas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <span className={styles.itemKbd}>ESC</span>
        </div>

        <div className={styles.results}>
          {filteredGroups.map((group) => (
            <div key={group.group}>
              <div className={styles.groupTitle}>{group.group}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={styles.item}
                    onClick={item.action}
                  >
                    <div className={styles.itemLeft}>
                      <Icon className={styles.itemIcon} />
                      <span>{item.label}</span>
                    </div>
                    {item.kbd && <span className={styles.itemKbd}>{item.kbd}</span>}
                  </div>
                );
              })}
            </div>
          ))}
          {filteredGroups.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No se encontraron comandos para &quot;{search}&quot;
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerKeyHint}>
            <span>Navegar con</span>
            <span className={styles.itemKbd}>↑</span>
            <span className={styles.itemKbd}>↓</span>
            <span>Seleccionar</span>
            <span className={styles.itemKbd}>↵</span>
          </div>
          <div className={styles.footerKeyHint}>
            <Sparkles size={12} color="var(--primary)" />
            <span>Terminal Scholar Console</span>
          </div>
        </div>
      </div>
    </div>
  );
};
