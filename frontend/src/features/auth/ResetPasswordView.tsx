import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import styles from './ResetPasswordView.module.css';

export const ResetPasswordView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenEmail, setTokenEmail] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsVerifying(false);
      setIsTokenValid(false);
      setErrorMessage('El enlace de recuperación no es válido.');
      return;
    }

    const checkToken = async () => {
      try {
        const resp = await authService.verifyResetToken(token);
        if (resp.valid) {
          setIsTokenValid(true);
          if (resp.email) setTokenEmail(resp.email);
        } else {
          setIsTokenValid(false);
          setErrorMessage('El enlace de recuperación ya expiró o ya fue utilizado.');
        }
      } catch (err: unknown) {
        setIsTokenValid(false);
        const msg = err instanceof Error ? err.message : 'El enlace de recuperación no es válido o ya ha expirado.';
        setErrorMessage(msg);
      } finally {
        setIsVerifying(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Por favor, asegurate de ingresarlas iguales.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(token, password);
      setIsSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No pudimos restablecer tu contraseña. Por favor, intentá nuevamente.';
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
            <ShieldCheck size={24} className={styles.logoIcon} />
          </div>
          <h1 className={styles.brandTitle}>Restablecer Contraseña</h1>
          <p className={styles.brandSubtitle}>
            {tokenEmail ? `Definí una nueva contraseña para ${tokenEmail}` : 'Elegí una nueva contraseña segura para tu cuenta'}
          </p>
        </div>

        {/* Verifying Token State */}
        {isVerifying && (
          <div className={styles.verifyingState}>
            <div className={styles.buttonSpinner} style={{ borderColor: 'rgba(59, 130, 246, 0.3)', borderTopColor: '#3b82f6' }} />
            <span>Validando enlace de recuperación...</span>
          </div>
        )}

        {/* Invalid Token State */}
        {!isVerifying && !isTokenValid && (
          <div className={styles.invalidTokenState}>
            <div className={styles.invalidBadge}>
              <XCircle size={32} />
            </div>
            <h2 className={styles.invalidTitle}>Enlace no disponible</h2>
            <p className={styles.invalidDesc}>
              {errorMessage || 'Este enlace de recuperación ha expirado, ya fue utilizado o no es válido.'}
            </p>
            <Link to="/forgot-password" className={styles.submitBtn} style={{ textDecoration: 'none' }}>
              <span>Solicitar un nuevo enlace</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* Error Alert on form */}
        {!isVerifying && isTokenValid && errorMessage && (
          <div className={styles.errorAlert}>
            <AlertCircle size={16} className={styles.errorIcon} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form State */}
        {!isVerifying && isTokenValid && !isSuccess && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fieldGroup}>
              <label htmlFor="new-password" className={styles.label}>
                Nueva Contraseña
              </label>
              <div className={styles.inputWrapper}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
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
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="confirm-password" className={styles.label}>
                Confirmar Nueva Contraseña
              </label>
              <div className={styles.inputWrapper}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Repetir contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className={styles.tipBox}>
              <ShieldCheck size={18} className={styles.tipIcon} />
              <div className={styles.tipContent}>
                <span className={styles.tipTitle}>Recomendación de seguridad</span>
                <p className={styles.tipText}>
                  Usá al menos <strong>6 caracteres</strong> combinando letras y números para proteger tu cuenta.
                </p>
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
                  <span>Actualizar contraseña</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Success State */}
        {!isVerifying && isSuccess && (
          <div className={styles.successState}>
            <div className={styles.successIconBadge}>
              <CheckCircle2 size={32} />
            </div>
            <h2 className={styles.successTitle}>¡Contraseña restablecida!</h2>
            <p className={styles.successDesc}>
              Tu contraseña ha sido actualizada con éxito. Todas tus sesiones anteriores fueron cerradas por seguridad. Ya podés ingresar con tu nueva clave.
            </p>
            <button
              type="button"
              className={styles.submitBtn}
              onClick={() => navigate('/login', { replace: true })}
            >
              <span>Iniciar Sesión</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Back to Login Footer */}
        <div className={styles.footer}>
          <Link to="/login" className={styles.backLink}>
            <ArrowLeft size={15} />
            <span>Volver al inicio de sesión</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordView;
