import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, KeyRound, Clock } from 'lucide-react';
import { authService } from '../../services/authService';
import styles from './ForgotPasswordView.module.css';

export const ForgotPasswordView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Por favor, ingresá tu correo electrónico.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authService.forgotPassword(email.trim());
      setIsSubmitted(true);
      setCooldown(60); // 60 segundos de espera para reintentar
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No pudimos procesar la solicitud. Por favor, intentá nuevamente.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authService.forgotPassword(email.trim());
      setCooldown(60);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No pudimos reenviar el correo en este momento. Por favor, probá en unos segundos.';
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
            <KeyRound size={24} className={styles.logoIcon} />
          </div>
          <h1 className={styles.brandTitle}>Recuperar Contraseña</h1>
          <p className={styles.brandSubtitle}>
            Ingresá tu correo electrónico para recibir un enlace de restablecimiento seguro
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className={styles.errorAlert}>
            <AlertCircle size={16} className={styles.errorIcon} />
            <span>{errorMessage}</span>
          </div>
        )}

        {!isSubmitted ? (
          /* Form State */
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fieldGroup}>
              <label htmlFor="forgot-email" className={styles.label}>
                Correo Electrónico
              </label>
              <div className={styles.inputWrapper}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  id="forgot-email"
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

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className={styles.buttonSpinner} />
              ) : (
                <>
                  <span>Enviar enlace</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Success State */
          <div className={styles.successState}>
            <div className={styles.successIconBadge}>
              <CheckCircle2 size={32} />
            </div>
            <h2 className={styles.successTitle}>¡Revisá tu correo!</h2>
            <p className={styles.successDesc}>
              Si existe una cuenta asociada a <span className={styles.emailHighlight}>{email}</span>, te enviamos un correo con las instrucciones y el enlace para restablecer tu contraseña.
            </p>

            <div className={styles.tipBox}>
              <Clock size={18} className={styles.tipIcon} />
              <div className={styles.tipContent}>
                <span className={styles.tipTitle}>Aviso de seguridad</span>
                <p className={styles.tipText}>
                  El enlace expirará en <strong>60 minutos</strong>. Si no lo ves en tu bandeja de entrada, revisá tu carpeta de <em>spam</em> o <em>correo no deseado</em>.
                </p>
              </div>
            </div>

            <div className={styles.resendRow}>
              <button
                type="button"
                className={styles.resendBtn}
                onClick={handleResend}
                disabled={cooldown > 0 || isLoading}
              >
                {isLoading ? (
                  'Reenviando...'
                ) : cooldown > 0 ? (
                  `Reenviar en ${cooldown}s`
                ) : (
                  'Reenviar enlace de recuperación'
                )}
              </button>
            </div>
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

export default ForgotPasswordView;
