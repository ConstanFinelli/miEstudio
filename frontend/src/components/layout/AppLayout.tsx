import React, { useState } from "react";
import { NavLink, useLocation, Outlet, useNavigate } from "react-router-dom";
import styles from "./AppLayout.module.css";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Bell,
  Settings,
  PlusCircle,
  User,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  Plus,
  Award,
} from "lucide-react";
import { mockPerfil } from "../../data/mockData";
import { isMocksEnabled } from "../../config/mockConfig";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { usePerfil } from "../../hooks";
import { CarreraModal } from "../modals";
import type { EstadoMateria } from "../../types/academic";

const defaultEmptyPerfil = {
  nombre: "Estudiante",
  legajo: "---",
  carrera: "Carrera de Grado",
  semestreActual: "Ciclo Lectivo",
  cicloActivo: "Cuatrimestre en Curso",
  promedioGeneral: 0.0,
  deltaPromedio: 0.0,
  puestoCohorte: 0,
  percentil: 0,
  materiasAprobadas: 0,
  materiasTotales: 0,
  creditosAprobados: 0,
  creditosTotales: 0,
  promedioHistorico: [],
};

interface AppLayoutProps {
  onOpenEvaluationModal: () => void;
  onOpenNoteModal: () => void;
  onOpenMateriaModal?: (initialEstado?: EstadoMateria) => void;
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  onOpenEvaluationModal,
  onOpenNoteModal,
  onOpenMateriaModal,
  children,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { perfil } = usePerfil();
  const { user, activeCarrera, carreras, selectCarrera, logout } = useAuth();

  const [isCareerMenuOpen, setIsCareerMenuOpen] = useState(false);
  const [isCarreraModalOpen, setIsCarreraModalOpen] = useState(false);

  const currentPerfil =
    perfil || (isMocksEnabled() ? mockPerfil : defaultEmptyPerfil);

  const displayNombre = user?.nombre || currentPerfil.nombre;
  const displayLegajo = activeCarrera?.legajo || currentPerfil.legajo;
  const displayCarrera = activeCarrera?.nombre || currentPerfil.carrera;
  const displayPromedio = activeCarrera?.promedio_general ?? currentPerfil.promedioGeneral;

  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path.startsWith("/dashboard")) return "Dashboard General";
    if (path.startsWith("/materias")) return "Materias & Cursadas";
    if (path.startsWith("/horarios")) return "Horarios de Cursada";
    if (path.startsWith("/calendario")) return "Calendario Académico";
    if (path.startsWith("/apuntes")) return "Repositorio de Apuntes";
    return "Workspace";
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
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
              <div className={styles.careerSelectorWrapper}>
                <button
                  type="button"
                  className={styles.careerTagBtn}
                  onClick={() => setIsCareerMenuOpen(!isCareerMenuOpen)}
                  title="Cambiar carrera o gestionar carreras"
                  aria-expanded={isCareerMenuOpen}
                >
                  <span className={styles.liveDot} />
                  <span className={styles.careerText}>{displayCarrera}</span>
                  <ChevronDown
                    size={11}
                    className={`${styles.chevron} ${
                      isCareerMenuOpen ? styles.chevronOpen : ""
                    }`}
                  />
                </button>

                {isCareerMenuOpen && (
                  <div className={styles.careerDropdown}>
                    <div className={styles.dropdownHeader}>
                      <span>Tus Carreras</span>
                    </div>
                    <div className={styles.dropdownList}>
                      {carreras.length > 0 ? (
                        carreras.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className={`${styles.careerOption} ${
                              c.id === activeCarrera?.id
                                ? styles.careerOptionActive
                                : ""
                            }`}
                            onClick={async () => {
                              await selectCarrera(c.id);
                              setIsCareerMenuOpen(false);
                            }}
                          >
                            <div className={styles.careerOptionInfo}>
                              <span className={styles.careerOptionName}>
                                {c.nombre}
                              </span>
                              <span className={styles.careerOptionSub}>
                                {c.facultad_sede} • Prom:{" "}
                                {c.promedio_general > 0
                                  ? c.promedio_general.toFixed(2)
                                  : "---"}
                              </span>
                            </div>
                            {c.id === activeCarrera?.id && (
                              <span className={styles.activeBadge}>Activa</span>
                            )}
                          </button>
                        ))
                      ) : (
                        <div
                          style={{
                            padding: "8px",
                            fontSize: "11px",
                            color: "var(--text-muted)",
                          }}
                        >
                          {displayCarrera}
                        </div>
                      )}
                    </div>
                    <div className={styles.dropdownActions}>
                      <button
                        type="button"
                        className={styles.dropdownActionBtn}
                        onClick={() => {
                          setIsCareerMenuOpen(false);
                          setIsCarreraModalOpen(true);
                        }}
                      >
                        <Plus size={13} />
                        <span>Nueva Carrera</span>
                      </button>
                      <button
                        type="button"
                        className={styles.dropdownActionBtn}
                        onClick={() => {
                          setIsCareerMenuOpen(false);
                          if (onOpenMateriaModal) {
                            onOpenMateriaModal('APROBADA');
                          }
                        }}
                      >
                        <Award size={13} />
                        <span>Cargar Materia Aprobada</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className={styles.navSection}>
            <span className={styles.navHeader}>Navegación</span>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
              }
            >
              <LayoutDashboard className={styles.navIcon} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/materias"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
              }
            >
              <BookOpen className={styles.navIcon} />
              <span>Materias y Evaluaciones</span>
            </NavLink>
            <NavLink
              to="/horarios"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
              }
            >
              <Clock className={styles.navIcon} />
              <span>Horarios de Cursada</span>
            </NavLink>
            <NavLink
              to="/calendario"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
              }
            >
              <Calendar className={styles.navIcon} />
              <span>Calendario y Fechas</span>
            </NavLink>
            <NavLink
              to="/apuntes"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
              }
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
            <span className={styles.cycleScore}>
              {displayPromedio.toFixed(2)}
            </span>
          </div>

          <div className={styles.userProfile}>
            <div className={styles.userInfo}>
              {isMocksEnabled() ? (
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                  alt={displayNombre}
                  className={styles.avatar}
                />
              ) : (
                <div
                  className={styles.avatar}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--surface-3)",
                    color: "var(--primary)",
                    fontWeight: 700,
                    fontSize: "11px",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <User size={15} />
                </div>
              )}
              <div className={styles.userDetails}>
                <span className={styles.userName}>{displayNombre}</span>
                <span className={styles.userSub}>
                  Legajo: {displayLegajo}
                </span>
              </div>
            </div>
            <div className={styles.userActions}>
              <button className={styles.settingsBtn} title="Configuración">
                <Settings size={15} />
              </button>
              <button
                className={styles.logoutBtn}
                onClick={handleLogout}
                title="Cerrar Sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut size={15} />
              </button>
            </div>
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
            <button
              className={styles.btnActionOutline}
              onClick={onOpenEvaluationModal}
            >
              <PlusCircle size={14} />
              <span>Nueva Evaluación</span>
            </button>

            <button
              className={styles.btnActionPrimary}
              onClick={onOpenNoteModal}
            >
              <PlusCircle size={14} />
              <span>Nuevo Apunte</span>
            </button>

            <button
              className={styles.iconBtn}
              onClick={toggleTheme}
              title={
                theme === "dark"
                  ? "Cambiar a Modo Claro"
                  : "Cambiar a Modo Oscuro"
              }
              aria-label="Alternar tema claro u oscuro"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button className={styles.iconBtn} title="Notificaciones">
              <Bell size={16} />
            </button>

            {isMocksEnabled() ? (
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                alt={displayNombre}
                className={styles.avatar}
                style={{ cursor: "pointer" }}
              />
            ) : (
              <div
                className={styles.avatar}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--surface-2)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                }}
                title={displayNombre}
              >
                <User size={14} />
              </div>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className={styles.contentBody}>{children || <Outlet />}</main>
      </div>

      {/* Carrera Modal */}
      <CarreraModal
        isOpen={isCarreraModalOpen}
        onClose={() => setIsCarreraModalOpen(false)}
      />
    </div>
  );
};
export default AppLayout;
