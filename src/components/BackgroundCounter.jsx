import React, { useState, useEffect, useRef } from 'react';
import { Heart, Sparkles, Clock, Calendar, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import './BackgroundCounter.css';

const START_DATE = new Date(2022, 9, 1, 0, 0, 0); // 1 de Octubre de 2022 (Mes 9 = Octubre en JS)

export default function BackgroundCounter() {
  const [now, setNow] = useState(new Date());
  const [order, setOrder] = useState(() => {
    return localStorage.getItem('love_counter_order') || 'countdown-top';
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [customPos, setCustomPos] = useState(() => {
    try {
      const saved = localStorage.getItem('love_counter_pos');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const draggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Soporte de arrastre libre del widget por el escritorio
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!draggingRef.current) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 300, e.clientX - dragOffsetRef.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 80, e.clientY - dragOffsetRef.current.y));
      const pos = { x: newX, y: newY };
      setCustomPos(pos);
      localStorage.setItem('love_counter_pos', JSON.stringify(pos));
    };

    const handleMouseUp = () => {
      draggingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleHeaderMouseDown = (e) => {
    if (e.target.closest('.counter-action-btn')) return;
    draggingRef.current = true;
    const widgetEl = e.currentTarget.closest('.desktop-love-counter-widget');
    const rect = widgetEl.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const toggleOrder = () => {
    const nextOrder = order === 'countdown-top' ? 'countdown-bottom' : 'countdown-top';
    setOrder(nextOrder);
    localStorage.setItem('love_counter_order', nextOrder);
  };

  // --- Cálculos de tiempo transcurrido desde el 1 de Octubre de 2022 ---
  const elapsedMs = Math.max(0, now.getTime() - START_DATE.getTime());
  const totalDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  const elapsedHours = Math.floor((elapsedMs / (1000 * 60 * 60)) % 24);
  const elapsedMins = Math.floor((elapsedMs / (1000 * 60)) % 60);
  const elapsedSecs = Math.floor((elapsedMs / 1000) % 60);

  // Cálculo detallado de años, meses y días transcurridos
  let elapsedYears = now.getFullYear() - START_DATE.getFullYear();
  let elapsedMonths = now.getMonth() - START_DATE.getMonth();
  let elapsedCalendarDays = now.getDate() - START_DATE.getDate();

  if (elapsedCalendarDays < 0) {
    const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    elapsedCalendarDays += prevMonthLastDay;
    elapsedMonths -= 1;
  }
  if (elapsedMonths < 0) {
    elapsedMonths += 12;
    elapsedYears -= 1;
  }

  // --- Cálculos para el próximo aniversario (1 de Octubre) ---
  const currentYear = now.getFullYear();
  let nextAnniv = new Date(currentYear, 9, 1, 0, 0, 0);
  const isTodayAnniversary = now.getMonth() === 9 && now.getDate() === 1;

  if (now.getTime() > nextAnniv.getTime() && !isTodayAnniversary) {
    nextAnniv = new Date(currentYear + 1, 9, 1, 0, 0, 0);
  }

  const prevAnniv = new Date(nextAnniv.getFullYear() - 1, 9, 1, 0, 0, 0);
  const yearSpanMs = nextAnniv.getTime() - prevAnniv.getTime();
  const currentProgressMs = Math.max(0, now.getTime() - prevAnniv.getTime());
  const yearProgressPercent = Math.min(100, Math.max(0, Math.round((currentProgressMs / yearSpanMs) * 100)));

  const diffNextMs = Math.max(0, nextAnniv.getTime() - now.getTime());
  const daysLeft = Math.floor(diffNextMs / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((diffNextMs / (1000 * 60 * 60)) % 24);
  const minsLeft = Math.floor((diffNextMs / (1000 * 60)) % 60);
  const secsLeft = Math.floor((diffNextMs / 1000) % 60);

  const nextAnnivNumber = nextAnniv.getFullYear() - 2022;
  const pad = (n) => String(n).padStart(2, '0');

  // Bloque 1: Días que faltan para el próximo 1 de Octubre
  const renderCountdownBlock = () => (
    <div className="bg-counter-block countdown-section">
      <div className="counter-section-header">
        <span className="section-tag-pill">
          <Clock size={12} className="tag-icon" />
          {isTodayAnniversary ? '¡HOY ES EL DÍA!' : 'CUENTA REGRESIVA'}
        </span>
        <span className="section-subtext">
          {isTodayAnniversary 
            ? '1 de Octubre ♥' 
            : `Próximo 1 de Octubre (${nextAnnivNumber}° Aniversario)`}
        </span>
      </div>

      {isTodayAnniversary ? (
        <div className="anniversary-celebration-banner">
          <Sparkles className="sparkle-spin" size={18} color="#ff1493" />
          <span className="anniversary-celebration-text">
            ¡Feliz {nextAnnivNumber}° Aniversario! Hoy cumplimos un año más juntos ♥
          </span>
          <Sparkles className="sparkle-spin" size={18} color="#ff1493" />
        </div>
      ) : (
        <>
          <div className="countdown-highlight-row">
            <span className="countdown-highlight-label">Faltan</span>
            <span className="countdown-days-hero">{daysLeft}</span>
            <span className="countdown-highlight-unit">días</span>
          </div>

          <div className="time-boxes-grid">
            <div className="time-box">
              <span className="time-box-val">{daysLeft}</span>
              <span className="time-box-lbl">Días</span>
            </div>
            <span className="time-separator">:</span>
            <div className="time-box">
              <span className="time-box-val">{pad(hoursLeft)}</span>
              <span className="time-box-lbl">Hs</span>
            </div>
            <span className="time-separator">:</span>
            <div className="time-box">
              <span className="time-box-val">{pad(minsLeft)}</span>
              <span className="time-box-lbl">Min</span>
            </div>
            <span className="time-separator">:</span>
            <div className="time-box">
              <span className="time-box-val">{pad(secsLeft)}</span>
              <span className="time-box-lbl">Seg</span>
            </div>
          </div>

          <div className="progress-bar-container">
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${yearProgressPercent}%` }}
              />
            </div>
            <div className="progress-bar-labels">
              <span>Camino al {nextAnnivNumber}° año</span>
              <span>{yearProgressPercent}%</span>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Bloque 2: Tiempo transcurrido desde el 1 de Octubre de 2022
  const renderElapsedBlock = () => (
    <div className="bg-counter-block elapsed-section">
      <div className="counter-section-header">
        <span className="section-tag-pill history-pill">
          <Heart size={12} className="tag-icon heart-pulse" />
          HISTORIA JUNTOS
        </span>
        <span className="section-subtext">Desde el 01/10/2022</span>
      </div>

      <div className="elapsed-hero-display">
        <div className="elapsed-days-badge">
          <Heart size={16} className="heart-inline-left" color="#ff1493" />
          <span className="elapsed-days-number">{totalDays.toLocaleString()}</span>
          <span className="elapsed-days-label">DÍAS JUNTOS</span>
          <Heart size={16} className="heart-inline-right" color="#ff1493" />
        </div>
      </div>

      <div className="elapsed-breakdown-row">
        <span className="breakdown-item"><b>{elapsedYears}</b> {elapsedYears === 1 ? 'año' : 'años'}</span>
        <span className="breakdown-dot">·</span>
        <span className="breakdown-item"><b>{elapsedMonths}</b> {elapsedMonths === 1 ? 'mes' : 'meses'}</span>
        <span className="breakdown-dot">·</span>
        <span className="breakdown-item"><b>{elapsedCalendarDays}</b> {elapsedCalendarDays === 1 ? 'día' : 'días'}</span>
      </div>

      <div className="elapsed-live-clock">
        <span className="clock-prefix">⏱ en vivo:</span>
        <span className="clock-digits">
          {pad(elapsedHours)}:{pad(elapsedMins)}:{pad(elapsedSecs)}
        </span>
      </div>
    </div>
  );

  return (
    <div 
      className={`desktop-love-counter-widget ${isMinimized ? 'minimized' : ''}`}
      style={customPos ? {
        top: `${customPos.y}px`,
        left: `${customPos.x}px`,
        transform: 'none'
      } : {}}
    >
      <div 
        className="counter-widget-header" 
        onMouseDown={handleHeaderMouseDown}
        style={{ cursor: 'grab' }}
        title="Arrastra para mover la pestaña donde quieras"
      >
        <div className="counter-widget-title">
          <Heart size={13} className="header-heart heart-pulse" />
          <span>♥ 01 . 10 . 2022 ♥</span>
        </div>
        <div className="counter-widget-actions">
          <button 
            type="button"
            className="counter-action-btn"
            onClick={toggleOrder}
            title="Invertir orden (arriba / abajo)"
            aria-label="Invertir orden"
          >
            <ArrowUpDown size={12} />
            <span className="btn-label-text">Invertir</span>
          </button>
          <button 
            type="button"
            className="counter-action-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "Expandir" : "Minimizar"}
            aria-label={isMinimized ? "Expandir" : "Minimizar"}
          >
            {isMinimized ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </button>
        </div>
      </div>

      {isMinimized ? (
        <div className="counter-widget-minimized-content" onClick={() => setIsMinimized(false)}>
          <span className="mini-badge">♥ {totalDays.toLocaleString()} días juntos</span>
          <span className="mini-divider">|</span>
          <span className="mini-badge">Faltan {daysLeft} días (1 Oct)</span>
        </div>
      ) : (
        <div className="counter-widget-body">
          {order === 'countdown-top' ? (
            <>
              {renderCountdownBlock()}
              <div className="counter-block-divider">
                <span className="divider-line" />
                <span className="divider-cute-symbol">♥ ୨୧ ♥</span>
                <span className="divider-line" />
              </div>
              {renderElapsedBlock()}
            </>
          ) : (
            <>
              {renderElapsedBlock()}
              <div className="counter-block-divider">
                <span className="divider-line" />
                <span className="divider-cute-symbol">♥ ୨୧ ♥</span>
                <span className="divider-line" />
              </div>
              {renderCountdownBlock()}
            </>
          )}

          <div className="counter-widget-footer">
            <span>Cada segundo a tu lado cuenta ♥</span>
          </div>
        </div>
      )}
    </div>
  );
}
