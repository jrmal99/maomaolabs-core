'use client';
import styles from '../../styles/SnapOverlay.module.css';

interface SnapOverlayProps {
  side: 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null;
}

export default function SnapOverlay({ side }: SnapOverlayProps) {
  if (!side) return null;
  return (
    <>
      <div
        className={`
            ${styles.overlay} 
            ${styles.left} 
            ${side === 'left' ? styles.visible : ''}
        `}
      />
      <div
        className={`
            ${styles.overlay} 
            ${styles.right} 
            ${side === 'right' ? styles.visible : ''}
        `}
      />
      <div
        className={`
            ${styles.overlayCorner} 
            ${styles.topLeft} 
            ${side === 'top-left' ? styles.visible : ''}
        `}
      />
      <div
        className={`
            ${styles.overlayCorner} 
            ${styles.topRight} 
            ${side === 'top-right' ? styles.visible : ''}
        `}
      />
      <div
        className={`
            ${styles.overlayCorner} 
            ${styles.bottomLeft} 
            ${side === 'bottom-left' ? styles.visible : ''}
        `}
      />
      <div
        className={`
            ${styles.overlayCorner} 
            ${styles.bottomRight} 
            ${side === 'bottom-right' ? styles.visible : ''}
        `}
      />
    </>
  );
}
