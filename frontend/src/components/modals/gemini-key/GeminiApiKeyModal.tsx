import React, { useState, useEffect } from 'react';
import styles from './GeminiApiKeyModal.module.css';
import {
  Key,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  Trash2,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { aiService } from '../../../services/aiService';

interface GeminiApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const GeminiApiKeyModal: React.FC<GeminiApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const { user, updateUser } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiKey(user?.gemini_api_key || '');
      setTestResult(null);
      setShowKey(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setTestResult({
        success: false,
        message: 'Por favor, ingresa una API Key para validar.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await aiService.validateApiKey(trimmed);
      if (res?.valido) {
        setTestResult({
          success: true,
          message: '¡Conexión exitosa con Google Gemini! Clave válida.',
        });
      } else {
        setTestResult({
          success: false,
          message: res?.mensaje || 'La clave proporcionada no es válida.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message:
          err?.response?.data?.error ||
          err?.message ||
          'No se pudo validar la API Key. Verifica que sea correcta.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setTestResult({
        success: false,
        message: 'La API Key no puede estar vacía.',
      });
      return;
    }

    setIsSaving(true);
    setTestResult(null);
    try {
      // Si aún no se probó, probar primero rápidamente
      const res = await aiService.validateApiKey(trimmed);
      if (!res?.valido) {
        setTestResult({
          success: false,
          message: res?.mensaje || 'La API Key es inválida. Revisa e intenta nuevamente.',
        });
        setIsSaving(false);
        return;
      }

      await updateUser({ gemini_api_key: trimmed });
      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      setTestResult({
        success: false,
        message:
          err?.response?.data?.error ||
          err?.message ||
          'Error al guardar la API Key.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveKey = async () => {
    if (
      !window.confirm(
        '¿Seguro que deseas eliminar tu API Key de Gemini? Las funciones de IA quedarán pausadas hasta configurar una nueva.'
      )
    ) {
      return;
    }

    setIsSaving(true);
    try {
      await updateUser({ gemini_api_key: '' });
      setApiKey('');
      setTestResult(null);
      if (onSaved) onSaved();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Error al eliminar la API Key.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasConfiguredKey = Boolean(user?.has_gemini_key);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitleWrapper}>
            <div className={styles.iconWrapper}>
              <Key size={20} />
            </div>
            <div>
              <h2 className={styles.title}>API Key de Google Gemini</h2>
            </div>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            title="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Free Tier Notice */}
          <div className={styles.freeTierNotice}>
            <ShieldCheck size={20} className={styles.noticeIcon} />
            <div>
              <strong>100% Gratuito y Personal:</strong> Google AI Studio provee
              acceso gratuito sin tarjeta de crédito para proyectos de estudio y
              desarrollo. Tus datos y consultas se ejecutan con tu propia cuota.
            </div>
          </div>

          {/* Step-by-Step Tutorial */}
          <div className={styles.tutorialSection}>
            <div className={styles.tutorialHeading}>
              <span>¿Cómo obtener tu clave en 1 minuto?</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkButton}
              >
                Abrir Google AI Studio <ExternalLink size={13} />
              </a>
            </div>

            <div className={styles.stepsList}>
              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>1</div>
                <div>
                  Entra a{' '}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.linkButton}
                  >
                    aistudio.google.com/app/apikey
                  </a>{' '}
                  e inicia sesión con tu cuenta de Google.
                </div>
              </div>

              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>2</div>
                <div>
                  Haz clic en el botón azul <strong>"Create API key"</strong> (o "Crear clave de API").
                </div>
              </div>

              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>3</div>
                <div>
                  Selecciona un proyecto de Google Cloud o crea uno nuevo con un clic (ej: "miEstudio").
                </div>
              </div>

              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>4</div>
                <div>
                  Copia la clave generada (comienza con <code>AIzaSy...</code>) y pégala aquí abajo.
                </div>
              </div>
            </div>
          </div>

          {/* Input field */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              <span>Tu Clave de API</span>
              {hasConfiguredKey ? (
                <span className={`${styles.statusPill} ${styles.statusConnected}`}>
                  ● Conectada
                </span>
              ) : (
                <span className={`${styles.statusPill} ${styles.statusMissing}`}>
                  Pendiente
                </span>
              )}
            </label>

            <div className={styles.inputWrapper}>
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestResult(null);
                }}
                placeholder="AIzaSy..."
                className={styles.inputField}
                autoComplete="off"
                spellCheck={false}
              />
              <div className={styles.inputActions}>
                <button
                  type="button"
                  className={styles.inputActionBtn}
                  onClick={() => setShowKey(!showKey)}
                  title={showKey ? 'Ocultar clave' : 'Mostrar clave'}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Feedback message */}
          {testResult && (
            <div
              className={`${styles.feedbackBox} ${
                testResult.success
                  ? styles.feedbackSuccess
                  : styles.feedbackError
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            {hasConfiguredKey && (
              <button
                type="button"
                className={styles.removeBtn}
                onClick={handleRemoveKey}
                disabled={isSaving || isTesting}
                title="Eliminar clave guardada"
              >
                <Trash2 size={14} style={{ display: 'inline', marginRight: 4 }} />
                Eliminar clave
              </button>
            )}
          </div>

          <div className={styles.footerRight}>
            <button
              type="button"
              className={styles.testBtn}
              onClick={handleTestKey}
              disabled={isTesting || isSaving || !apiKey.trim()}
            >
              {isTesting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Probando...
                </>
              ) : (
                'Probar conexión'
              )}
            </button>

            <button
              type="button"
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={isSaving || isTesting || !apiKey.trim()}
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Guardar y Usar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
