import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { CommandPalette } from './components/command/CommandPalette';
import { DashboardView } from './features/dashboard/DashboardView';
import { MateriasView } from './features/materias/MateriasView';
import { CalendarioView } from './features/calendario/CalendarioView';
import { ApuntesView } from './features/apuntes/ApuntesView';
import { EvaluationModal } from './components/modals/EvaluationModal';
import { NoteModal } from './components/modals/NoteModal';
import { PdfViewerModal } from './components/modals/PdfViewerModal';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'materias' | 'calendario' | 'apuntes'>('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [activePdf, setActivePdf] = useState<{ title: string; url: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Keyboard Shortcuts Listener (⌘K, ⌘N, ⌘E, ⌘P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd (Mac) or Ctrl (Windows/Linux)
      const isMeta = e.metaKey || e.ctrlKey;

      if (isMeta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      } else if (isMeta && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsNoteModalOpen(true);
      } else if (isMeta && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsEvaluationModalOpen(true);
      } else if (isMeta && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleStartPomodoro();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartPomodoro = () => {
    showToast('⏱️ Modo Enfoque Pomodoro iniciado (25:00)');
  };

  return (
    <AppLayout
      currentView={currentView}
      onNavigate={setCurrentView}
      onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      onOpenEvaluationModal={() => setIsEvaluationModalOpen(true)}
      onOpenNoteModal={() => setIsNoteModalOpen(true)}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--surface-3)',
          border: '1px solid var(--border-hover)',
          color: 'var(--text-primary)',
          padding: '10px 16px',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          zIndex: 200,
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease'
        }}>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Views */}
      {currentView === 'dashboard' && (
        <DashboardView
          onNavigate={setCurrentView}
          onOpenEvaluationModal={() => setIsEvaluationModalOpen(true)}
          onOpenNoteModal={() => setIsNoteModalOpen(true)}
          onStartPomodoro={handleStartPomodoro}
        />
      )}

      {currentView === 'materias' && (
        <MateriasView
          onOpenEvaluationModal={() => setIsEvaluationModalOpen(true)}
          onOpenNoteModal={() => setIsNoteModalOpen(true)}
          onViewPdf={(title, url) => setActivePdf({ title, url })}
        />
      )}

      {currentView === 'calendario' && (
        <CalendarioView
          onOpenEvaluationModal={() => setIsEvaluationModalOpen(true)}
        />
      )}

      {currentView === 'apuntes' && (
        <ApuntesView
          onOpenNoteModal={() => setIsNoteModalOpen(true)}
        />
      )}

      {/* Command Palette Modal (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setCurrentView}
        onOpenEvaluationModal={() => setIsEvaluationModalOpen(true)}
        onOpenNoteModal={() => setIsNoteModalOpen(true)}
        onStartPomodoro={handleStartPomodoro}
      />

      {/* Evaluation Modal (⌘E / screen 5.png) */}
      <EvaluationModal
        isOpen={isEvaluationModalOpen}
        onClose={() => setIsEvaluationModalOpen(false)}
        onSuccess={() => showToast('✓ Nueva instancia de evaluación registrada')}
      />

      {/* Note Modal (⌘N / screen 6.png) */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSuccess={(title) => {
          showToast(`✓ Apunte "${title.slice(0, 25)}..." creado`);
          setCurrentView('apuntes');
        }}
      />

      {/* PDF Viewer Modal (Herramienta de visualización de PDFs solicitada) */}
      <PdfViewerModal
        isOpen={!!activePdf}
        onClose={() => setActivePdf(null)}
        pdfTitle={activePdf?.title || ''}
        pdfUrl={activePdf?.url}
        onOpenSplitNote={() => {
          setActivePdf(null);
          setCurrentView('apuntes');
        }}
      />
    </AppLayout>
  );
};

export default App;
