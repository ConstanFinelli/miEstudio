import React, { useState, useEffect } from 'react';
import styles from './EditUserModal.module.css';
import { X, Check, User, GraduationCap, Shield, UserCog, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { usePerfil } from '../../../hooks/usePerfil';
import { carrerasService } from '../../../services/carrerasService';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose }) => {
  const { user, activeCarrera, updateUser, reloadProfile } = useAuth();
  const { perfil, updatePerfil, refresh: refreshPerfil } = usePerfil();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [legajo, setLegajo] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync inputs when modal opens or user/carrera changes
  useEffect(() => {
    if (isOpen) {
      setNombre(user?.nombre || perfil?.nombre || '');
      setEmail(user?.email || '');
      setLegajo(activeCarrera?.legajo || perfil?.legajo || '');
      setNewPassword('');
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, user, activeCarrera, perfil]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorMessage('El nombre del usuario no puede estar vacío');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      // 1. Actualizar datos de usuario (nombre, email, contraseña si se proveyó)
      await updateUser({
        nombre: nombre.trim(),
        email: email.trim() || undefined,
        password: newPassword ? newPassword : undefined,
      });

      // 2. Actualizar legajo en carrera activa si existe
      if (activeCarrera) {
        try {
          await carrerasService.updateCarrera(activeCarrera.id, {
            legajo: legajo.trim(),
          });
        } catch {
          // Continuar con perfil local
        }
      }

      // 3. Actualizar perfil local y en memoria
      await updatePerfil({
        nombre: nombre.trim(),
        legajo: legajo.trim(),
      });

      await reloadProfile();
      await refreshPerfil();

      setSuccessMessage('¡Datos de usuario actualizados correctamente!');
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: unknown) {
      console.error('Error al actualizar usuario:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Ocurrió un error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'U';
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return nameStr.substring(0, 2).toUpperCase();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={styles.tagBadge}>CUENTA</span>
            <span>CONFIGURACIÓN DE USUARIO</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Cerrar (Esc)">
            <X size={14} />
            <span>ESC</span>
          </button>
        </div>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <UserCog size={22} />
          </div>
          <div>
            <h2 className={styles.title}>Editar Perfil y Usuario</h2>
            <p className={styles.subtitle}>
              Actualizá tus datos personales, credenciales y legajo académico de cursada.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div style={{ padding: '0 20px' }}>
            <div className={styles.errorBanner}>
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div style={{ padding: '0 20px' }}>
            <div className={styles.successBanner}>
              <Check size={15} />
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* User Card Row */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarFallback}>
              {getInitials(nombre)}
            </div>
            <div className={styles.avatarInfo}>
              <span className={styles.avatarTitle}>{nombre || 'Estudiante'}</span>
              <span className={styles.avatarSubtitle}>
                {activeCarrera ? `${activeCarrera.nombre} · Legajo ${legajo || '---'}` : (email || 'Cuenta de usuario')}
              </span>
            </div>
          </div>

          {/* SECCIÓN 1: DATOS PERSONALES */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <User size={13} color="var(--primary)" />
              <span>Información Personal</span>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Nombre y Apellido</label>
              <input
                type="text"
                className={styles.input}
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre y apellido"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Correo Electrónico</label>
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="estudiante@universidad.edu.ar"
                required
              />
            </div>
          </div>

          {/* SECCIÓN 2: DATOS ACADÉMICOS */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <GraduationCap size={13} color="var(--blue)" />
              <span>Datos Académicos</span>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Legajo Estudiantil</label>
              <input
                type="text"
                className={styles.input}
                value={legajo}
                onChange={e => setLegajo(e.target.value)}
                placeholder="Ej: 50231 o 1042/22"
              />
            </div>
          </div>

          {/* SECCIÓN 3: SEGURIDAD (OPCIONAL) */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <Shield size={13} color="var(--amber)" />
              <span>Seguridad & Contraseña</span>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Nueva Contraseña (Opcional)</label>
              <input
                type="password"
                className={styles.input}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Dejar en blanco para mantener la actual"
                minLength={6}
              />
              <span className={styles.fieldHelp}>Solo completá este campo si deseás modificar tu clave de acceso. Mínimo 6 caracteres.</span>
            </div>
          </div>

          {/* Acciones */}
          <div className={styles.actions}>
            <button type="button" className={styles.btnCancel} onClick={onClose} disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={isSaving}>
              <Check size={14} />
              <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
