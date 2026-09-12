import React, { useState } from "react";
import { NavLink, useLocation, Outlet, useNavigate } from "react-router-dom";
import styles from "./AppLayout.module.css";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Settings,
  PlusCircle,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  Plus,
  TrendingUp,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  PanelLeft,
} from "lucide-react";
import { mockPerfil } from "../../data/mockData";
import { isMocksEnabled } from "../../config/mockConfig";
import { useTheme, useAuth, useLayout } from "../../context";
import { usePerfil } from "../../hooks";
import { CarreraModal, EditUserModal } from "../modals";
import type { EstadoMateria } from "../../types/academic";
import type { Carrera } from "../../types/auth";
import getInitials from "../../utils/getInitials";

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
  onOpenEvaluationModal?: () => void;
  onOpenNoteModal?: (materiaId?: string) => void;
  onOpenMateriaModal?: (
    materiaToEdit?: any,
    initialEstado?: EstadoMateria
  ) => void;
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  onOpenEvaluationModal,
  onOpenNoteModal,
  onOpenMateriaModal: _onOpenMateriaModal,
  children,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { isSidebarCollapsed, toggleSidebar } = useLayout();
  const location = useLocation();
  const navigate = useNavigate();
  const { perfil } = usePerfil();
  const { user, activeCarrera, carreras, selectCarrera, logout } = useAuth();

  const [isCareerMenuOpen, setIsCareerMenuOpen] = useState(false);
  const [isCarreraModalOpen, setIsCarreraModalOpen] = useState(false);
  const [carreraToEdit, setCarreraToEdit] = useState<Carrera | null>(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);

  const currentPerfil =
    perfil || (isMocksEnabled() ? mockPerfil : defaultEmptyPerfil);

  const displayNombre = user?.nombre || currentPerfil.nombre;
  const displayLegajo = activeCarrera?.legajo || currentPerfil.legajo;
  const displayCarrera = activeCarrera?.nombre || currentPerfil.carrera;
  const displayPromedio =
    activeCarrera?.promedio_general ?? currentPerfil.promedioGeneral;

  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path.startsWith("/dashboard")) return "Dashboard";
    if (path.startsWith("/plan-de-estudio")) return "Plan de Estudio";
    if (path.startsWith("/progreso")) return "Progreso & Estadísticas";
    if (path.startsWith("/materias")) return "Materias";
    if (path.startsWith("/horarios")) return "Horarios";
    if (path.startsWith("/calendario")) return "Calendario";
    if (path.startsWith("/apuntes")) return "Apuntes";
    return "Workspace";
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${
          isSidebarCollapsed ? styles.sidebarCollapsed : ""
        }`}
      >
        <div className={styles.sidebarTop}>
          {/* Brand */}
          <div className={styles.brand}>
            <div
              className={styles.brandIcon}
              onClick={isSidebarCollapsed ? toggleSidebar : undefined}
              title={isSidebarCollapsed ? "Expandir navegación" : undefined}
              style={{ cursor: isSidebarCollapsed ? "pointer" : "default" }}
            >
              <BookOpen size={16} />
            </div>
            {!isSidebarCollapsed && (
              <div className={styles.brandInfo}>
                <div className={styles.brandTitleRow}>
                  <span className={styles.brandName}>miEstudio</span>
                  <button
                    type="button"
                    className={styles.sidebarCollapseBtn}
                    onClick={toggleSidebar}
                    title="Contraer barra de navegación"
                    aria-label="Contraer barra de navegación"
                  >
                    <PanelLeftClose size={14} />
                  </button>
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
                                <span className={styles.activeBadge}>
                                  Activa
                                </span>
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
                        {activeCarrera && (
                          <button
                            type="button"
                            className={styles.dropdownActionBtn}
                            onClick={() => {
                              setIsCareerMenuOpen(false);
                              setCarreraToEdit(activeCarrera);
                              setIsCarreraModalOpen(true);
                            }}
                            title="Editar datos y plan de la carrera activa"
                          >
                            <Settings size={13} />
                            <span>Configurar Carrera</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className={styles.dropdownActionBtn}
                          onClick={() => {
                            setIsCareerMenuOpen(false);
                            setCarreraToEdit(null);
                            setIsCarreraModalOpen(true);
                          }}
                        >
                          <Plus size={13} />
                          <span>Nueva Carrera</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className={styles.navSection}>
            {!isSidebarCollapsed && (
              <span className={styles.navHeader}>Navegación</span>
            )}
            <NavLink
              to="/dashboard"
              title={isSidebarCollapsed ? "Dashboard" : undefined}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
              }
            >
              <LayoutDashboard className={styles.navIcon} />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </NavLink>
            <NavLink
              to="/materias"
              title={isSidebarCollapsed ? "Materias" : undefined}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
              }
            >
              <BookOpen className={styles.navIcon} />
              {!isSidebarCollapsed && <span>Materias</span>}
            </NavLink>
            <NavLink
              to="/plan-de-estudio"
              title={isSidebarCollapsed ? "Plan de Estudio" : undefined}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
              }
            >
              <Network className={styles.navIcon} />
              {!isSidebarCollapsed && <span>Plan de Estudio</span>}
            </NavLink>
            <NavLink
              to="/progreso"
              title={isSidebarCollapsed ? "Progreso & Estadísticas" : undefined}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
              }
            >
              <TrendingUp className={styles.navIcon} />
              {!isSidebarCollapsed && <span>Progreso & Estadísticas</span>}
            </NavLink>
            <NavLink
              to="/horarios"
              title={isSidebarCollapsed ? "Horarios de Cursada" : undefined}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
              }
            >
              <Clock className={styles.navIcon} />
              {!isSidebarCollapsed && <span>Horarios de Cursada</span>}
            </NavLink>
            <NavLink
              to="/calendario"
              title={isSidebarCollapsed ? "Calendario" : undefined}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
              }
            >
              <Calendar className={styles.navIcon} />
              {!isSidebarCollapsed && <span>Calendario</span>}
            </NavLink>
            <NavLink
              to="/apuntes"
              title={isSidebarCollapsed ? "Apuntes y Notas" : undefined}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
              }
            >
              <FileText className={styles.navIcon} />
              {!isSidebarCollapsed && <span>Apuntes y Notas</span>}
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className={styles.sidebarFooter}>
          {!isSidebarCollapsed ? (
            <div className={styles.cycleInfo}>
              <span className={styles.cycleTitle}>Promedio General</span>
              <span className={styles.cycleScore}>
                {displayPromedio.toFixed(2)}
              </span>
            </div>
          ) : (
            <div
              className={styles.cycleInfoCollapsed}
              title={`Promedio General: ${displayPromedio.toFixed(2)}`}
            >
              <span className={styles.cycleScore}>
                {displayPromedio.toFixed(1)}
              </span>
            </div>
          )}

          <div className={styles.userProfile}>
            <div
              className={styles.userInfo}
              title={
                isSidebarCollapsed
                  ? `${displayNombre} (Legajo: ${displayLegajo})`
                  : undefined
              }
            >
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
                  <div className={styles.avatar}>
                    {getInitials(user?.nombre || displayNombre)}
                  </div>
                </div>
              )}
              {!isSidebarCollapsed && (
                <div className={styles.userDetails}>
                  <span className={styles.userName}>{displayNombre}</span>
                  <span className={styles.userSub}>
                    Legajo: {displayLegajo}
                  </span>
                </div>
              )}
            </div>
            {!isSidebarCollapsed ? (
              <div className={styles.userActions}>
                <button
                  className={styles.settingsBtn}
                  onClick={() => setIsEditUserModalOpen(true)}
                  title="Editar Usuario y Perfil"
                  aria-label="Editar usuario"
                >
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
            ) : (
              <div className={styles.userActionsCollapsed}>
                <button
                  className={styles.logoutBtn}
                  onClick={handleLogout}
                  title="Cerrar Sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogOut size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className={styles.mainCanvas}>
        {/* Top Header */}
        <header className={styles.topHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              className={styles.headerToggleSidebarBtn}
              onClick={toggleSidebar}
              title={
                isSidebarCollapsed
                  ? "Expandir barra de navegación"
                  : "Contraer barra de navegación"
              }
              aria-label="Alternar barra de navegación"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen size={16} />
              ) : (
                <PanelLeft size={16} />
              )}
            </button>
            <div className={styles.breadcrumbs}>
              <span className={styles.crumbProject}>miEstudio</span>
              <span className={styles.crumbSeparator}>/</span>
              <div className={styles.crumbCurrent}>
                <span className={styles.crumbDot} />
                <span>{getBreadcrumbTitle()}</span>
              </div>
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
              onClick={() => onOpenNoteModal?.()}
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
          </div>
        </header>

        {/* Content Body */}
        <main className={styles.contentBody}>{children || <Outlet />}</main>
      </div>

      {/* Carrera Modal */}
      <CarreraModal
        isOpen={isCarreraModalOpen}
        onClose={() => {
          setIsCarreraModalOpen(false);
          setCarreraToEdit(null);
        }}
        carreraToEdit={carreraToEdit}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
      />
    </div>
  );
};
export default AppLayout;
