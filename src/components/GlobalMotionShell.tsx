import React, { useEffect, useRef } from 'react';

interface GlobalMotionShellProps {
  routeKey: string;
  children: React.ReactNode;
}

/**
 * Envuelve las páginas de TapRD con:
 * 1. Fondo ambiental con orbes luminosos para dar profundidad al efecto glassmorphism.
 * 2. Animación suave de entrada al navegar entre páginas.
 * 3. Desvanecido automático (scroll-reveal) en secciones <section> que aún no usan <ScrollReveal>.
 */
export function GlobalMotionShell({ routeKey, children }: GlobalMotionShellProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;

    const sections = Array.from(root.querySelectorAll('main section')).filter(
      (el) => !el.closest('.reveal-section')
    );

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            entry.target.classList.remove('reveal-hidden');
          } else {
            entry.target.classList.remove('reveal-visible');
            entry.target.classList.add('reveal-hidden');
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: '0px 0px -24px 0px'
      }
    );

    sections.forEach((sec) => {
      sec.classList.add('reveal-section', 'reveal-hidden');
      observer.observe(sec);
    });

    return () => {
      observer.disconnect();
    };
  }, [routeKey]);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      {/* Orbes ambientales globales para el efecto Glassmorphism */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-32 -left-24 w-[460px] h-[460px] rounded-full bg-blue-400/20 dark:bg-blue-600/15 blur-3xl animate-ambient-drift" />
        <div
          className="absolute top-[35%] -right-32 w-[520px] h-[520px] rounded-full bg-cyan-400/20 dark:bg-cyan-500/10 blur-3xl animate-ambient-drift"
          style={{ animationDelay: '-5s' }}
        />
        <div
          className="absolute bottom-[-120px] left-[20%] w-[480px] h-[480px] rounded-full bg-indigo-400/15 dark:bg-indigo-600/15 blur-3xl animate-ambient-drift"
          style={{ animationDelay: '-9s' }}
        />
      </div>

      {/* Contenido animado por ruta */}
      <div ref={containerRef} key={routeKey} className="relative z-10 animate-hero-enter">
        {children}
      </div>
    </div>
  );
}
