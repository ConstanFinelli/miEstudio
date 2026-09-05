import React from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import styles from './AppLayout.module.css';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileText,
  Search,
  Bell,
  Settings,
  PlusCircle,
  Sun,
  Moon
} from 'lucide-react';
import { mockPerfil } from '../../data/mockData';
import { useTheme } from '../../context/ThemeContext';
import { usePerfil } from '../../hooks';

interface AppLayoutProps {
  onOpenCommandPalette: () => void;
  onOpenEvaluationModal: () => void;
  onOpenNoteModal: () => void;
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  onOpenCommandPalette,
  onOpenEvaluationModal,
  onOpenNoteModal,
  children
}) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { perfil } = usePerfil();
  const currentPerfil = perfil || mockPerfil;

  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard General';
    if (path.startsWith('/materias')) return 'Materias & Cursadas';
    if (path.startsWith('/calendario')) return 'Calendario Académico';
    if (path.startsWith('/apuntes')) return 'Repositorio de Apuntes';
    return 'Workspace';
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
                <span>{currentPerfil.carrera}</span>
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
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <LayoutDashboard className={styles.navIcon} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/materias"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <BookOpen className={styles.navIcon} />
              <span>Materias y Evaluaciones</span>
            </NavLink>
            <NavLink
              to="/calendario"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <Calendar className={styles.navIcon} />
              <span>Calendario y Fechas</span>
            </NavLink>
            <NavLink
              to="/apuntes"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <FileText className={styles.navIcon} />
              <span>Apuntes y Notas</span>
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.cycleInfo}>
            <span className={styles.cycleTitle}>Promedio General</span>
            <span className={styles.cycleScore}>{currentPerfil.promedioGeneral.toFixed(2)}</span>
          </div>

          <div className={styles.userProfile}>
            <div className={styles.userInfo}>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                alt={currentPerfil.nombre}
                className={styles.avatar}
              />
              <div className={styles.userDetails}>
                <span className={styles.userName}>{currentPerfil.nombre}</span>
                <span className={styles.userSub}>Legajo: {currentPerfil.legajo}</span>
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

            <button
              className={styles.iconBtn}
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              aria-label="Alternar tema claro u oscuro"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
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
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
export default AppLayout;

