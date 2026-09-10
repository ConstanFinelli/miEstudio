import React, { useState, useEffect, useCallback } from 'react';
import styles from './CorrelatividadesSvgOverlay.module.css';
import type { ConnectionLink } from '../types';

interface CorrelatividadesSvgOverlayProps {
  connections: ConnectionLink[];
  containerRef: React.RefObject<HTMLDivElement | null>;
}

interface PathGeometry {
  id: string;
  d: string;
  direction: 'UPSTREAM' | 'DOWNSTREAM';
  tipo: 'CURSAR' | 'RENDIR';
}

export const CorrelatividadesSvgOverlay: React.FC<CorrelatividadesSvgOverlayProps> = ({
  connections,
  containerRef
}) => {
  const [paths, setPaths] = useState<PathGeometry[]>([]);

  const recalculatePaths = useCallback(() => {
    if (!containerRef.current || connections.length === 0) {
      setPaths([]);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const scrollTop = containerRef.current.scrollTop;

    const newPaths: PathGeometry[] = [];

    connections.forEach(conn => {
      const sourceEl = document.getElementById(`materia-node-${conn.sourceId}`);
      const targetEl = document.getElementById(`materia-node-${conn.targetId}`);

      if (!sourceEl || !targetEl) return;

      const sourceRect = sourceEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      // Coordenadas relativas al contenedor
      const isLeftToRight = sourceRect.left <= targetRect.left;

      let x1: number, y1: number, x2: number, y2: number;

      if (isLeftToRight) {
        // Source sale por la derecha, target entra por la izquierda
        x1 = sourceRect.right - containerRect.left + scrollLeft;
        y1 = sourceRect.top + sourceRect.height / 2 - containerRect.top + scrollTop;
        x2 = targetRect.left - containerRect.left + scrollLeft;
        y2 = targetRect.top + targetRect.height / 2 - containerRect.top + scrollTop;
      } else {
        // Source sale por la izquierda, target entra por la derecha (misma columna o retroceso)
        x1 = sourceRect.left - containerRect.left + scrollLeft;
        y1 = sourceRect.top + sourceRect.height / 2 - containerRect.top + scrollTop;
        x2 = targetRect.right - containerRect.left + scrollLeft;
        y2 = targetRect.top + targetRect.height / 2 - containerRect.top + scrollTop;
      }

      const dx = Math.abs(x2 - x1) * 0.45;
      const control1X = isLeftToRight ? x1 + dx : x1 - dx;
      const control2X = isLeftToRight ? x2 - dx : x2 + dx;

      const d = `M ${x1} ${y1} C ${control1X} ${y1}, ${control2X} ${y2}, ${x2} ${y2}`;

      newPaths.push({
        id: conn.id,
        d,
        direction: conn.direction,
        tipo: conn.tipo
      });
    });

    setPaths(newPaths);
  }, [connections, containerRef]);

  useEffect(() => {
    recalculatePaths();

    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      requestAnimationFrame(recalculatePaths);
    };

    window.addEventListener('resize', recalculatePaths);
    container.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', recalculatePaths);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [recalculatePaths, containerRef]);

  if (paths.length === 0) return null;

  return (
    <svg className={styles.svgOverlay}>
      <defs>
        {/* Arrow Marker Upstream (Amber) */}
        <marker
          id="malla-arrow-upstream"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 9 5 L 0 9 z" fill="var(--amber)" />
        </marker>

        {/* Arrow Marker Downstream (Emerald) */}
        <marker
          id="malla-arrow-downstream"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 9 5 L 0 9 z" fill="var(--emerald)" />
        </marker>
      </defs>

      {paths.map(path => (
        <path
          key={path.id}
          d={path.d}
          className={`${styles.linkPath} ${
            path.direction === 'UPSTREAM' ? styles.linkUpstream : styles.linkDownstream
          }`}
          markerEnd={`url(#malla-arrow-${path.direction.toLowerCase()})`}
        />
      ))}
    </svg>
  );
};
