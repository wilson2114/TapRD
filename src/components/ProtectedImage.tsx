import React from 'react';

interface ProtectedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
  onImageError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

/**
 * Imagen protegida contra descarga casual:
 * - Bloquea clic derecho / menú contextual
 * - Bloquea arrastrar y soltar
 * - Bloquea pulsación larga en móviles (iOS/Android -webkit-touch-callout)
 * - Coloca una capa transparente encima para interceptar interacciones sobre el <img>
 */
export function ProtectedImage({
  wrapperClassName = '',
  className = '',
  onImageError,
  alt,
  ...imgProps
}: ProtectedImageProps) {
  const blockEvent = (e: React.SyntheticEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className={`relative select-none overflow-hidden ${wrapperClassName}`}
      onContextMenu={blockEvent}
      onDragStart={blockEvent}
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      <img
        {...imgProps}
        alt={alt}
        draggable={false}
        onContextMenu={blockEvent}
        onDragStart={blockEvent}
        onError={onImageError}
        className={`pointer-events-none select-none ${className}`}
        style={{
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          ...imgProps.style
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
