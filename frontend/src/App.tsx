import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardView } from './features/dashboard/DashboardView';
import { MateriasView } from './features/materias/MateriasView';
import { CalendarioView } from './features/calendario/CalendarioView';
import { HorariosView } from './features/horarios';
import { ApuntesView } from './features/apuntes/ApuntesView';
import { LoginView, RegisterView } from './features/auth';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { EvaluationModal, NoteModal, PdfViewerModal, MateriaModal } from './components/modals';
import { Toast } from './features/components';
import type { EstadoMateria } from './types/academic';

export const App: React.FC = () => {
  const navigate = useNavigate();
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isMateriaModalOpen, setIsMateriaModalOpen] = useState(false);
  const [materiaInitialEstado, setMateriaInitialEstado] = useState<EstadoMateria | undefined>(undefined);
  const [activePdf, setActivePdf] = useState<{ title: string; url: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginView />} />
      <Route path="/register" element={<RegisterView />} />

      {/* Protected Academic Workspace Routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout
              onOpenEvaluationModal={() => setIsEvaluationModalOpen(true)}
              onOpenNoteModal={() => setIsNoteModalOpen(true)}
              onOpenMateriaModal={(estado) => {
                setMateriaInitialEstado(estado);
                setIsMateriaModalOpen(true);
              }}
            >
              {/* Toast Notification */}
              <Toast message={toastMessage} />

              {/* Main Routed Views */}
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="/dashboard"
                  element={<DashboardView />}
                />
                <Route
                  path="/materias"
                  element={
                    <MateriasView
                      onOpenEvaluationModal={() => setIsEvaluationModalOpen(true)}
                      onOpenMateriaModal={() => {
                        setMateriaInitialEstado(undefined);
                        setIsMateriaModalOpen(true);
                      }}
                      onOpenNoteModal={() => setIsNoteModalOpen(true)}
                      onViewPdf={(title, url) => setActivePdf({ title, url })}
                    />
                  }
                />
                <Route path="/horarios" element={<HorariosView />} />
                <Route
                  path="/calendario"
                  element={
                    <CalendarioView
                      onOpenEvaluationModal={() => setIsEvaluationModalOpen(true)}
                    />
                  }
                />
                <Route
                  path="/apuntes"
                  element={
                    <ApuntesView
                      onOpenNoteModal={() => setIsNoteModalOpen(true)}
                    />
                  }
                />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>

              {/* Materia Modal (Registro de Cursada & Materias Aprobadas) */}
              <MateriaModal
                isOpen={isMateriaModalOpen}
                onClose={() => {
                  setIsMateriaModalOpen(false);
                  setMateriaInitialEstado(undefined);
                }}
                initialEstado={materiaInitialEstado}
                onSuccess={(created) => {
                  showToast(`✓ Materia "${created.nombre}" registrada con éxito`);
                  navigate('/materias');
                }}
              />

              {/* Evaluation Modal */}
              <EvaluationModal
                isOpen={isEvaluationModalOpen}
                onClose={() => setIsEvaluationModalOpen(false)}
                onSuccess={() => showToast('✓ Nueva instancia de evaluación registrada')}
              />

              {/* Note Modal */}
              <NoteModal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                onSuccess={(title) => {
                  showToast(`✓ Apunte "${title.slice(0, 25)}..." creado`);
                  navigate('/apuntes');
                }}
              />

              {/* PDF Viewer Modal */}
              <PdfViewerModal
                isOpen={!!activePdf}
                onClose={() => setActivePdf(null)}
                pdfTitle={activePdf?.title || ''}
                pdfUrl={activePdf?.url}
                onOpenSplitNote={() => {
                  setActivePdf(null);
                  navigate('/apuntes');
                }}
              />
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
