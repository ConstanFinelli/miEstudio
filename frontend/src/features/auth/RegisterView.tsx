import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Lock,
  Mail,
  User,
  GraduationCap,
  Building2,
  Hash,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Clock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import styles from "./RegisterView.module.css";

export const RegisterView: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Datos de la Carrera Inicial
  const [carreraNombre, setCarreraNombre] = useState("");
  const [duracionAnios, setDuracionAnios] = useState<number>(5);
  const [facultadSede, setFacultadSede] = useState("");
  const [legajo, setLegajo] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        nombre: nombre.trim(),
        email: email.trim(),
        password,
        carrera_nombre: carreraNombre.trim() || "Mi Carrera Universitaria",
        duracion_anios: duracionAnios,
        facultad_sede: facultadSede.trim() || "Facultad / Universidad",
        legajo: legajo.trim() || "S/N",
      });
      setIsSuccess(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al registrar usuario";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundGradients}>
        <div className={styles.glowOrbPrimary} />
        <div className={styles.glowOrbSecondary} />
      </div>

      <div className={styles.card}>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <div className={styles.brandLogo}>
            <BookOpen size={24} className={styles.logoIcon} />
          </div>
          <h1 className={styles.brandTitle}>Crear Cuenta</h1>
          <p className={styles.brandSubtitle}>
            Configurá tu perfil y comenzá a organizar tu trayectoria
            universitaria
          </p>
        </div>

        {isSuccess ? (
          <div className={styles.successState}>
            <div className={styles.successBadge}>
              <CheckCircle2 size={32} />
            </div>
            <h2 className={styles.successTitle}>¡Bienvenido a miEstudio, {nombre}!</h2>
            <p className={styles.successDesc}>
              Tu cuenta ha sido creada exitosamente. Te enviamos un correo de bienvenida a <span className={styles.emailHighlight}>{email}</span> con información útil para tu trayectoria académica.
            </p>
            <div className={styles.successTip}>
              <GraduationCap size={18} className={styles.tipIcon} />
              <div className={styles.tipContent}>
                <span className={styles.tipTitle}>Carrera configurada</span>
                <p className={styles.tipText}>
                  Registramos <em>"{carreraNombre || 'Mi Carrera'}"</em> como tu carrera activa. Ya tenés acceso a tu panel de materias, calendario de evaluaciones y apuntes asistidos por IA.
                </p>
              </div>
            </div>
            <button
              type="button"
              className={styles.submitBtn}
              onClick={() => navigate("/dashboard", { replace: true })}
            >
              <span>Comenzar en miEstudio</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            {/* Error Alert */}
            {errorMessage && (
              <div className={styles.errorAlert}>
                <AlertCircle size={16} className={styles.errorIcon} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Section: Datos Personales */}
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>1. Datos Personales</span>
              </div>

              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="reg-nombre" className={styles.label}>
                    Nombre Completo
                  </label>
                  <div className={styles.inputWrapper}>
                    <User size={16} className={styles.inputIcon} />
                    <input
                      id="reg-nombre"
                      type="text"
                      className={styles.input}
                      placeholder="Ej: Juan Peréz"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="reg-email" className={styles.label}>
                    Email Universitario o Personal
                  </label>
                  <div className={styles.inputWrapper}>
                    <Mail size={16} className={styles.inputIcon} />
                    <input
                      id="reg-email"
                      type="email"
                      className={styles.input}
                      placeholder="estudiante@universidad.edu.ar"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="reg-password" className={styles.label}>
                    Contraseña
                  </label>
                  <div className={styles.inputWrapper}>
                    <Lock size={16} className={styles.inputIcon} />
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      className={styles.input}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="reg-confirm" className={styles.label}>
                    Confirmar Contraseña
                  </label>
                  <div className={styles.inputWrapper}>
                    <Lock size={16} className={styles.inputIcon} />
                    <input
                      id="reg-confirm"
                      type={showPassword ? "text" : "password"}
                      className={styles.input}
                      placeholder="Repetir contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Section: Carrera Inicial */}
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>
                  2. Tu Carrera Universitaria
                </span>
                <span className={styles.sectionHint}>
                  (Podrás agregar más después)
                </span>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="reg-carrera" className={styles.label}>
                  Nombre de la Carrera
                </label>
                <div className={styles.inputWrapper}>
                  <GraduationCap size={16} className={styles.inputIcon} />
                  <input
                    id="reg-carrera"
                    type="text"
                    className={styles.input}
                    placeholder="Ej: Licenciatura en Sistemas / Medicina / Abogacía"
                    value={carreraNombre}
                    onChange={(e) => setCarreraNombre(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="reg-duracion" className={styles.label}>
                    Duración del Plan
                  </label>
                  <div className={styles.inputWrapper}>
                    <Clock size={16} className={styles.inputIcon} />
                    <select
                      id="reg-duracion"
                      className={styles.input}
                      value={duracionAnios}
                      onChange={(e) => setDuracionAnios(Number(e.target.value))}
                      disabled={isLoading}
                    >
                      <option value={1}>1 Año</option>
                      <option value={2}>2 Años</option>
                      <option value={3}>3 Años</option>
                      <option value={4}>4 Años</option>
                      <option value={5}>5 Años</option>
                      <option value={6}>6 Años</option>
                    </select>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="reg-legajo" className={styles.label}>
                    Nº de Legajo o Matrícula
                  </label>
                  <div className={styles.inputWrapper}>
                    <Hash size={16} className={styles.inputIcon} />
                    <input
                      id="reg-legajo"
                      type="text"
                      className={styles.input}
                      placeholder="Ej: 104822"
                      value={legajo}
                      onChange={(e) => setLegajo(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="reg-facultad" className={styles.label}>
                  Universidad / Facultad / Sede
                </label>
                <div className={styles.inputWrapper}>
                  <Building2 size={16} className={styles.inputIcon} />
                  <input
                    id="reg-facultad"
                    type="text"
                    className={styles.input}
                    placeholder="Ej: UBA / UTN / UNLP"
                    value={facultadSede}
                    onChange={(e) => setFacultadSede(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className={styles.buttonSpinner} />
                ) : (
                  <>
                    <span>Crear Cuenta</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Login Footer */}
            <div className={styles.footer}>
              <span className={styles.footerText}>
                ¿Ya tenés una cuenta registrada?
              </span>
              <Link to="/login" className={styles.loginLink}>
                Iniciar sesión
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterView;
