import React from 'react';
import styles from './AppLayout.module.css';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileText,
  Search,
  Bell,
  Settings,
  PlusCircle
} from 'lucide-react';
import { mockPerfil } from '../../data/mockData';

interface AppLayoutProps {
  currentView: 'dashboard' | 'materias' | 'calendario' | 'apuntes';
  onNavigate: (view: 'dashboard' | 'materias' | 'calendario' | 'apuntes') => void;
  onOpenCommandPalette: () => void;
  onOpenEvaluationModal: () => void;
  onOpenNoteModal: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentView,
  onNavigate,
  onOpenCommandPalette,
  onOpenEvaluationModal,
  onOpenNoteModal,
  children
}) => {
  const getBreadcrumbTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Dashboard General';
      case 'materias':
        return 'Materias & Cursadas';
      case 'calendario':
        return 'Calendario Académico';
      case 'apuntes':
        return 'Repositorio de Apuntes';
      default:
        return 'Workspace';
    }
  };

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <BookOpen size={16} />
            </div>
            <div className={styles.brandInfo}>
              <div className={styles.brandTitleRow}>
                <span className={styles.brandName}>miEstudio</span>
              </div>
              <div className={styles.careerTag}>
                <span className={styles.liveDot} />
                <span>{mockPerfil.carrera}</span>
              </div>
            </div>
          </div>

          {/* Search Trigger */}
          <button className={styles.searchTrigger} onClick={onOpenCommandPalette}>
            <div className={styles.searchLeft}>
              <Search size={14} />
              <span>Buscar o comando...</span>
            </div>
            <span className={styles.kbd}>⌘K</span>
          </button>

          {/* Navigation Menu */}
          <nav className={styles.navSection}>
            <span className={styles.navHeader}>Navegación</span>
            <button
              className={`${styles.navItem} ${currentView === 'dashboard' ? styles.navItemActive : ''}`}
              onClick={() => onNavigate('dashboard')}
            >
              <LayoutDashboard className={styles.navIcon} />
              <span>Dashboard</span>
            </button>
            <button
              className={`${styles.navItem} ${currentView === 'materias' ? styles.navItemActive : ''}`}
              onClick={() => onNavigate('materias')}
            >
              <BookOpen className={styles.navIcon} />
              <span>Materias y Evaluaciones</span>
            </button>
            <button
              className={`${styles.navItem} ${currentView === 'calendario' ? styles.navItemActive : ''}`}
              onClick={() => onNavigate('calendario')}
            >
              <Calendar className={styles.navIcon} />
              <span>Calendario y Fechas</span>
            </button>
            <button
              className={`${styles.navItem} ${currentView === 'apuntes' ? styles.navItemActive : ''}`}
              onClick={() => onNavigate('apuntes')}
            >
              <FileText className={styles.navIcon} />
              <span>Apuntes y Notas</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.cycleInfo}>
            <span className={styles.cycleTitle}>Promedio General</span>
            <span className={styles.cycleScore}>{mockPerfil.promedioGeneral.toFixed(2)}</span>
          </div>

          <div className={styles.userProfile}>
            <div className={styles.userInfo}>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                alt="Sofía Chen"
                className={styles.avatar}
              />
              <div className={styles.userDetails}>
                <span className={styles.userName}>{mockPerfil.nombre}</span>
                <span className={styles.userSub}>Legajo: {mockPerfil.legajo}</span>
              </div>
            </div>
            <button className={styles.settingsBtn} title="Configuración">
              <Settings size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className={styles.mainCanvas}>
        {/* Top Header */}
        <header className={styles.topHeader}>
          <div className={styles.breadcrumbs}>
            <span className={styles.crumbProject}>miEstudio</span>
            <span className={styles.crumbSeparator}>/</span>
            <div className={styles.crumbCurrent}>
              <span className={styles.crumbDot} />
              <span>{getBreadcrumbTitle()}</span>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.btnActionOutline} onClick={onOpenEvaluationModal}>
              <PlusCircle size={14} />
              <span>+ Nueva Evaluación</span>
            </button>

            <button className={styles.btnActionPrimary} onClick={onOpenNoteModal}>
              <PlusCircle size={14} />
              <span>+ Nuevo Apunte</span>
            </button>

            <button className={styles.iconBtn} title="Notificaciones">
              <Bell size={16} />
            </button>

            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
              alt="Sofía Chen"
              className={styles.avatar}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </header>

        {/* Content Body */}
        <main className={styles.contentBody}>
          {children}
        </main>
      </div>
    </div>
  );
};
