import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, Mail } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import styles from './VerifyEmailView.module.css';

export const VerifyEmailView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, reloadProfile } = useAuth();
  const token = searchParams.get('token') || '';

  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Resend form
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setIsSuccess(false);
      setErrorMessage('No se proporcionó un token de confirmación.');
      return;
    }

    const confirmAccount = async () => {
      try {
        await authService.verifyEmail(token);
        setIsSuccess(true);
        if (isAuthenticated) {
          reloadProfile().catch(() => {});
        }
      } catch (err: unknown) {
        setIsSuccess(false);
        const msg = err instanceof Error ? err.message : 'Enlace de confirmación inválido o expirado';
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    };

    confirmAccount();
  }, [token, isAuthenticated, reloadProfile]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setIsResending(true);
    setResendFeedback(null);

    try {
      const resp = await authService.resendVerification(resendEmail.trim());
      setResendFeedback(resp.message || 'Se envió un nuevo correo de confirmación.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al reenviar la confirmación';
      setErrorMessage(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundGradients}>
        <div className={styles.glowOrbPrimary} />
        <div className={styles.glowOrbSecondary} />
      </div>

      <div className={styles.card}>
        {isLoading && (
          <div>
            <div className={`${styles.badge} ${styles.badgeLoading}`}>
              <div className={styles.buttonSpinner} style={{ borderColor: 'rgba(59, 130, 246, 0.3)', borderTopColor: '#3b82f6' }} />
            </div>
            <h1 className={styles.title}>Confirmando cuenta...</h1>
            <p className={styles.desc}>Estamos validando tu correo electrónico en miEstudio.</p>
          </div>
        )}

        {!isLoading && isSuccess && (
          <div>
            <div className={`${styles.badge} ${styles.badgeSuccess}`}>
              <CheckCircle2 size={36} />
            </div>
            <h1 className={styles.title}>¡Cuenta Confirmada!</h1>
            <p className={styles.desc}>
              Tu dirección de correo electrónico ha sido verificada exitosamente. Tu cuenta está activa y lista para potenciar tu estudio universitario.
            </p>
            <div className={styles.tipBox}>
              🚀 <strong>Todo listo:</strong> Podés acceder a tu plan de materias, apuntes inteligentes con IA y seguimiento de cursada.
            </div>
            <button
              type="button"
              className={styles.submitBtn}
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login', { replace: true })}
            >
              <span>{isAuthenticated ? 'Ir a mi Workspace' : 'Iniciar Sesión'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {!isLoading && !isSuccess && (
          <div>
            <div className={`${styles.badge} ${styles.badgeError}`}>
              <XCircle size={36} />
            </div>
            <h1 className={styles.title}>Enlace No Disponible</h1>
            <p className={styles.desc}>
              {errorMessage || 'El enlace de confirmación es inválido o ha expirado.'}
            </p>

            <form onSubmit={handleResend} className={styles.resendSection}>
              <label htmlFor="resend-email" className={styles.resendLabel}>
                ¿Necesitás un nuevo enlace de activación?
              </label>
              <div className={styles.inputWrapper}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  id="resend-email"
                  type="email"
                  className={styles.input}
                  placeholder="estudiante@universidad.edu.ar"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isResending}
              >
                {isResending ? 'Enviando...' : 'Reenviar enlace de confirmación'}
              </button>
              {resendFeedback && (
                <div className={styles.resendFeedback}>
                  ✓ {resendFeedback}
                </div>
              )}
            </form>
          </div>
        )}

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

export default VerifyEmailView;
