import React, { useEffect, useState } from 'react';

interface ProtectedImageProps {
  src?: string;
  alt?: string;
  wrapperClassName?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  style?: React.CSSProperties;
  onImageError?: () => void;
}

/**
 * Imagen protegida contra descarga casual:
 * - No renderiza etiqueta <img> en el DOM (usa background-image en <div>) para que
 *   navegadores móviles (iOS/Android) y de escritorio no muestren "Guardar imagen".
 * - Bloquea clic derecho / menú contextual, arrastrar y selección.
 * - Coloca una capa transparente protectora encima.
 */
export function ProtectedImage({
  src,
  alt = '',
  wrapperClassName = '',
  className = '',
  style,
  onImageError
}: ProtectedImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    if (!src) return;

    let cancelled = false;
    const probe = new Image();
    probe.onerror = () => {
      if (!cancelled) {
        setHasError(true);
        onImageError?.();
      }
    };
    probe.src = src;

    return () => {
      cancelled = true;
    };
  }, [src, onImageError]);

  if (!src || hasError) return null;

  const blockEvent = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative select-none overflow-hidden ${wrapperClassName}`}
      onContextMenu={blockEvent}
      onDragStart={blockEvent}
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      <div
        className={`w-full h-full bg-cover bg-center pointer-events-none select-none ${className}`}
        style={{
          backgroundImage: `url("${src.replace(/"/g, '\\"')}")`,
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          ...style
        }}
      />
      {/* Capa transparente protectora para interceptar clic derecho y pulsación larga */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-transparent select-none"
        onContextMenu={blockEvent}
        onDragStart={blockEvent}
        style={{
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none'
        }}
      />
    </div>
  );
}
