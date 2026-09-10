import React, { useState, useEffect, useCallback } from 'react';
import styles from './CorrelatividadesSvgOverlay.module.css';
import type { ConnectionLink } from '../types';

interface CorrelatividadesSvgOverlayProps {
  connections: ConnectionLink[];
  innerRef: React.RefObject<HTMLDivElement | null>;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

interface PathGeometry {
  id: string;
  d: string;
  direction: 'UPSTREAM' | 'DOWNSTREAM';
  tipo: 'CURSAR' | 'RENDIR';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const CorrelatividadesSvgOverlay: React.FC<CorrelatividadesSvgOverlayProps> = ({
  connections,
  innerRef,
  scrollContainerRef
}) => {
  const [paths, setPaths] = useState<PathGeometry[]>([]);

  const recalculatePaths = useCallback(() => {
    if (!innerRef.current || connections.length === 0) {
      setPaths([]);
      return;
    }

    const innerRect = innerRef.current.getBoundingClientRect();
    const newPaths: PathGeometry[] = [];

    connections.forEach(conn => {
      const sourceEl = document.getElementById(`materia-node-${conn.sourceId}`);
      const targetEl = document.getElementById(`materia-node-${conn.targetId}`);

      if (!sourceEl || !targetEl) return;

      const sRect = sourceEl.getBoundingClientRect();
      const tRect = targetEl.getBoundingClientRect();

      // Coordenadas exactas relativas al lienzo interno (sin desfase de padding ni scroll)
      const sLeft = sRect.left - innerRect.left;
      const sRight = sRect.right - innerRect.left;
      const sCenterY = sRect.top + sRect.height / 2 - innerRect.top;

      const tLeft = tRect.left - innerRect.left;
      const tRight = tRect.right - innerRect.left;
      const tCenterY = tRect.top + tRect.height / 2 - innerRect.top;

      let x1: number, y1: number, x2: number, y2: number;
      let d = '';

      // Caso 1: Misma columna (mismo año lectivo, tarjetas apiladas verticalmente)
      if (Math.abs(sLeft - tLeft) < 50) {
        x1 = sRight;
        y1 = sCenterY;
        x2 = tRight;
        y2 = tCenterY;

        const loopOffset = 40;
        d = `M ${x1} ${y1} C ${x1 + loopOffset} ${y1}, ${x2 + loopOffset} ${y2}, ${x2} ${y2}`;
      }
      // Caso 2: De izquierda a derecha (año anterior a posterior)
      else if (sLeft < tLeft) {
        x1 = sRight;
        y1 = sCenterY;
        x2 = tLeft;
        y2 = tCenterY;

        const dx = Math.max(32, (x2 - x1) * 0.45);
        d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
      }
      // Caso 3: De derecha a izquierda (año posterior a anterior)
      else {
        x1 = sLeft;
        y1 = sCenterY;
        x2 = tRight;
        y2 = tCenterY;

        const dx = Math.max(32, (x1 - x2) * 0.45);
        d = `M ${x1} ${y1} C ${x1 - dx} ${y1}, ${x2 + dx} ${y2}, ${x2} ${y2}`;
      }

      newPaths.push({
        id: conn.id,
        d,
        direction: conn.direction,
        tipo: conn.tipo,
        x1,
        y1,
        x2,
        y2
      });
    });

    setPaths(newPaths);
  }, [connections, innerRef]);

  useEffect(() => {
    recalculatePaths();

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      requestAnimationFrame(recalculatePaths);
    };

    window.addEventListener('resize', recalculatePaths);
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', recalculatePaths);
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [recalculatePaths, scrollContainerRef]);

  if (paths.length === 0) return null;

  return (
    <svg className={styles.svgOverlay}>
      <defs>
        {/* Arrow Marker Upstream (Amber) */}
        <marker
          id="malla-arrow-upstream"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--amber)" />
        </marker>

        {/* Arrow Marker Downstream (Emerald) */}
        <marker
          id="malla-arrow-downstream"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--emerald)" />
        </marker>
      </defs>

      {paths.map(path => (
        <g key={path.id}>
          {/* Main animated dashed path */}
          <path
            d={path.d}
            className={`${styles.linkPath} ${
              path.direction === 'UPSTREAM' ? styles.linkUpstream : styles.linkDownstream
            }`}
            markerEnd={`url(#malla-arrow-${path.direction.toLowerCase()})`}
          />
          {/* Origin anchor dot directly on the starting subject edge */}
          <circle
            cx={path.x1}
            cy={path.y1}
            r={3.5}
            className={
              path.direction === 'UPSTREAM' ? styles.originDotUpstream : styles.originDotDownstream
            }
          />
        </g>
      ))}
    </svg>
  );
};
