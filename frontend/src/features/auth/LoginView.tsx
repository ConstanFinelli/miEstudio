import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  BookOpen,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import styles from "./LoginView.module.css";

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from =
    (location.state as { from?: { pathname?: string } })?.from?.pathname ||
    "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Por favor ingresá tu correo y contraseña");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Credenciales inválidas o error de conexión";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const demoEmail = "demo@miestudio.local";
    const demoPass = "demo12345";

    try {
      // Intentar login con credenciales demo
      await login({ email: demoEmail, password: demoPass });
      navigate(from, { replace: true });
    } catch {
      // Si el usuario demo no existe todavía en la base de datos, registrarlo automáticamente
      try {
        await register({
          email: demoEmail,
          password: demoPass,
          nombre: "Estudiante Demo",
          carrera_nombre: "Ingeniería en Informática",
          facultad_sede: "Facultad de Ingeniería",
          legajo: "INFO-2026",
        });
        navigate(from, { replace: true });
      } catch (regErr: unknown) {
        setErrorMessage(
          regErr instanceof Error
            ? regErr.message
            : "Error al inicializar sesión de demostración",
        );
      }
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
          <h1 className={styles.brandTitle}>miEstudio</h1>
          <p className={styles.brandSubtitle}>
            Workspace académico integral para estudiantes universitarios
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className={styles.errorAlert}>
            <AlertCircle size={16} className={styles.errorIcon} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label htmlFor="login-email" className={styles.label}>
              Correo Electrónico
            </label>
            <div className={styles.inputWrapper}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                id="login-email"
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

          <div className={styles.fieldGroup}>
            <div className={styles.passwordHeader}>
              <label htmlFor="login-password" className={styles.label}>
                Contraseña
              </label>
            </div>
            <div className={styles.inputWrapper}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Ver contraseña"
                }
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
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
                <span>Ingresar</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <span className={styles.footerText}>¿Primera vez en miEstudio?</span>
          <Link to="/register" className={styles.registerLink}>
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
