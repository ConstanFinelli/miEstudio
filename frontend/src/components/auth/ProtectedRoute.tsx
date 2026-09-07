import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './ProtectedRoute.module.css';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingCard}>
          <div className={styles.spinner} />
          <div className={styles.loadingText}>
            <span className={styles.brandTitle}>miEstudio</span>
            <span className={styles.subtext}>Verificando sesión académica...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
