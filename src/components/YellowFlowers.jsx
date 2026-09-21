import React, { useEffect, useMemo } from 'react';
import './YellowFlowers.css';

const FLOWER_SYMBOLS = ['🌼', '🌻', '🌼', '🌼', '🌻', '💛', '✨', '🌼'];

export default function YellowFlowers() {
  // Configurar título y favicon de la pestaña con flores amarillas
  useEffect(() => {
    const originalTitle = document.title;
    document.title = "🌼 Flores Amarillas · cause im under your spell.. 🌼";

    // Actualizar o crear favicon con flor amarilla
    let link = document.querySelector("link[rel~='icon']");
    const originalHref = link ? link.getAttribute("href") : "/favicon.svg";

    const yellowFlowerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <text y=".9em" font-size="90">🌼</text>
    </svg>`;
    const svgBlob = new Blob([yellowFlowerSvg], { type: 'image/svg+xml' });
    const blobUrl = URL.createObjectURL(svgBlob);

    if (link) {
      link.href = blobUrl;
    } else {
      link = document.createElement('link');
      link.rel = 'icon';
      link.href = blobUrl;
      document.head.appendChild(link);
    }

    return () => {
      document.title = originalTitle;
      if (link && originalHref) {
        link.href = originalHref;
      }
      URL.revokeObjectURL(blobUrl);
    };
  }, []);

  // Generar conjunto denso de flores amarillas flotantes para el fondo
  const flowers = useMemo(() => {
    const count = 35; // Muchas flores en el fondo como pidió el usuario
    return Array.from({ length: count }, (_, i) => {
      const left = Math.round((i / count) * 100 + (Math.sin(i) * 5));
      const normalizedLeft = Math.max(1, Math.min(97, left));
      const size = 14 + (i % 5) * 5; // Tamaños de 14px a 34px
      const duration = 10 + (i % 7) * 2; // Duración 10s a 22s
      const delay = -(i * 0.65); // Desfase para que ya estén cayendo al abrir
      const symbol = FLOWER_SYMBOLS[i % FLOWER_SYMBOLS.length];

      return {
        id: i,
        symbol,
        style: {
          left: `${normalizedLeft}%`,
          fontSize: `${size}px`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
        }
      };
    });
  }, []);

  return (
    <div className="yellow-flowers-container" aria-hidden="true">
      {/* Lluvia de flores amarillas en el fondo */}
      {flowers.map(f => (
        <span 
          key={f.id} 
          className="floating-yellow-flower"
          style={f.style}
        >
          {f.symbol}
        </span>
      ))}

      {/* Guirnaldas en esquinas */}
      <div className="corner-flower-cluster corner-flower-top-left">
        🌼🌻🌼
      </div>
      <div className="corner-flower-cluster corner-flower-top-right">
        🌻🌼🌻
      </div>

      {/* Badge conmemorativo de la edición especial */}
      <div className="yellow-flowers-desktop-banner">
        <span className="pulse-flower">🌼</span>
        <span>EDICIÓN ESPECIAL: FLORES AMARILLAS 💛</span>
        <span className="pulse-flower">🌻</span>
      </div>
    </div>
  );
}
