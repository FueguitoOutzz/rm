import React, { useState, useEffect, useRef } from 'react';
import DraggableWindow from './DraggableWindow';
import { Sparkles, Trophy, Gift, RotateCw, Coins, Ticket, CheckCircle, X } from 'lucide-react';
import './CasinoRoulette.css';

const SLICES = [
  { label: '2x', multiplier: 2, color: '#ff85c0', textColor: '#fff', weight: 18 },
  { label: '0x', multiplier: 0, color: '#495057', textColor: '#fff', weight: 15 },
  { label: '1.5x', multiplier: 1.5, color: '#b197fc', textColor: '#fff', weight: 20 },
  { label: '3x', multiplier: 3, color: '#ffd43b', textColor: '#664d03', weight: 15 },
  { label: '0.2x', multiplier: 0.2, color: '#868e96', textColor: '#fff', weight: 14 },
  { label: '5x', multiplier: 5, color: '#ff6b6b', textColor: '#fff', weight: 10 },
  { label: '2x', multiplier: 2, color: '#f06595', textColor: '#fff', weight: 14 },
  { label: '10x', multiplier: 10, color: '#748ffc', textColor: '#fff', weight: 5 },
  { label: '0.5x', multiplier: 0.5, color: '#ffa94d', textColor: '#fff', weight: 16 },
  { label: '★ 20x ★', multiplier: 20, color: '#ffd700', textColor: '#b74309', weight: 3 },
];

const DAILY_BONUS_AMOUNT = 5000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export default function CasinoRoulette({ onClose, onFocus, zIndex, initialPosition }) {
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('casino_balance');
    return saved !== null ? parseInt(saved, 10) : 5000;
  });

  const [lastClaim, setLastClaim] = useState(() => {
    const saved = localStorage.getItem('casino_last_claim');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [betAmount, setBetAmount] = useState(1000);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [spinResult, setSpinResult] = useState(null);
  const [redeemedPrizes, setRedeemedPrizes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('casino_redeemed_prizes') || '[]');
    } catch {
      return [];
    }
  });
  const [celebrationTicket, setCelebrationTicket] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  const audioCtxRef = useRef(null);

  // Guardar balance en localStorage
  useEffect(() => {
    localStorage.setItem('casino_balance', balance.toString());
  }, [balance]);

  // Sonido retro usando Web Audio API
  const playSound = (freq, type = 'sine', duration = 0.1) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio opcional
    }
  };

  // Temporizador de bono diario
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const nextEligible = lastClaim + ONE_DAY_MS;
      const diff = nextEligible - now;

      if (diff <= 0) {
        setTimeLeft('¡Bono Listo!');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [lastClaim]);

  const canClaimDaily = Date.now() - lastClaim >= ONE_DAY_MS || lastClaim === 0;

  const handleClaimDaily = () => {
    if (!canClaimDaily) return;
    const now = Date.now();
    setLastClaim(now);
    localStorage.setItem('casino_last_claim', now.toString());
    setBalance(prev => prev + DAILY_BONUS_AMOUNT);
    playSound(587.33, 'triangle', 0.2);
    setTimeout(() => playSound(880, 'triangle', 0.3), 150);
    setSpinResult({
      type: 'bonus',
      message: `🎁 ¡Recargaste tu bono diario de $${DAILY_BONUS_AMOUNT.toLocaleString()}!`
    });
  };

  // Girar la ruleta
  const handleSpin = () => {
    if (isSpinning) return;
    if (balance < betAmount || betAmount <= 0) {
      alert("¡No tienes suficiente saldo para esta apuesta!");
      return;
    }

    // Descontar apuesta
    setBalance(prev => prev - betAmount);
    setIsSpinning(true);
    setSpinResult(null);

    // Selección ponderada de la casilla
    const totalWeight = SLICES.reduce((acc, s) => acc + s.weight, 0);
    let rand = Math.random() * totalWeight;
    let chosenIndex = 0;
    for (let i = 0; i < SLICES.length; i++) {
      if (rand < SLICES[i].weight) {
        chosenIndex = i;
        break;
      }
      rand -= SLICES[i].weight;
    }

    const chosenSlice = SLICES[chosenIndex];
    const sliceAngle = 360 / SLICES.length;

    // Calcular rotación para que el puntero (en 0deg / arriba) caiga exactamente en chosenIndex
    // Si la rueda rota en sentido horario, el slice en el índice i queda en el puntero si rotation % 360 = 360 - (i * sliceAngle + sliceAngle/2)
    const extraRotations = 5 * 360; // 5 vueltas completas mínimas
    const targetSliceAngle = 360 - (chosenIndex * sliceAngle + sliceAngle / 2);
    const newRotation = wheelRotation + extraRotations + (targetSliceAngle - (wheelRotation % 360) + 360) % 360;

    setWheelRotation(newRotation);

    // Sonidos de giros progresivos
    for (let i = 0; i < 15; i++) {
      setTimeout(() => playSound(300 + i * 25, 'square', 0.05), i * 220);
    }

    // Al finalizar el giro (4 segundos)
    setTimeout(() => {
      setIsSpinning(false);
      const wonAmount = Math.floor(betAmount * chosenSlice.multiplier);
      setBalance(prev => prev + wonAmount);

      if (chosenSlice.multiplier === 0) {
        playSound(180, 'sawtooth', 0.3);
        setSpinResult({
          type: 'lose',
          message: `¡Mala suerte! Salió ${chosenSlice.label}. Perdiste $${betAmount.toLocaleString()}`
        });
      } else if (chosenSlice.multiplier < 1) {
        playSound(260, 'triangle', 0.2);
        setSpinResult({
          type: 'win',
          message: `Salió ${chosenSlice.label}. Recuperaste $${wonAmount.toLocaleString()} de tu apuesta`
        });
      } else if (chosenSlice.multiplier >= 10) {
        playSound(523.25, 'triangle', 0.2);
        setTimeout(() => playSound(659.25, 'triangle', 0.2), 150);
        setTimeout(() => playSound(783.99, 'triangle', 0.4), 300);
        setSpinResult({
          type: 'jackpot',
          message: `¡JACKPOT! Multiplicador ${chosenSlice.label}! Ganaste +$${wonAmount.toLocaleString()} ♥`
        });
      } else {
        playSound(523.25, 'sine', 0.2);
        setTimeout(() => playSound(659.25, 'sine', 0.25), 150);
        setSpinResult({
          type: 'win',
          message: `¡Ganaste! Salió ${chosenSlice.label}! +$${wonAmount.toLocaleString()}`
        });
      }
    }, 4100);
  };

  // Canjear premios
  const handleRedeem = (prizeName, cost, description) => {
    if (balance < cost) {
      alert(`Necesitas $${cost.toLocaleString()} para canjear este premio.`);
      return;
    }

    if (!window.confirm(`¿Seguro que quieres canjear "${prizeName}" por $${cost.toLocaleString()} ficticios?`)) {
      return;
    }

    const newBalance = balance - cost;
    setBalance(newBalance);

    const newTicket = {
      id: Date.now().toString(),
      name: prizeName,
      cost,
      description,
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      code: 'INSANO-' + Math.random().toString(36).substring(2, 7).toUpperCase()
    };

    const updated = [newTicket, ...redeemedPrizes];
    setRedeemedPrizes(updated);
    localStorage.setItem('casino_redeemed_prizes', JSON.stringify(updated));

    playSound(523.25, 'triangle', 0.2);
    setTimeout(() => playSound(659.25, 'triangle', 0.2), 150);
    setTimeout(() => playSound(783.99, 'triangle', 0.3), 300);
    setTimeout(() => playSound(1046.50, 'triangle', 0.5), 450);

    setCelebrationTicket(newTicket);
  };

  const sliceAngle = 360 / SLICES.length;

  return (
    <DraggableWindow 
      title="🎰 ruleta.exe - Casino Insano" 
      onClose={onClose} 
      onFocus={onFocus} 
      zIndex={zIndex} 
      initialPosition={initialPosition} 
      width="460px"
      maxHeight="82vh"
    >
      <div className="casino-container">
        {/* Marcador superior con saldo y recarga diaria de 5.000 */}
        <div className="casino-scoreboard">
          <div className="scoreboard-balance-col">
            <span className="balance-lbl">💰 SALDO DISPONIBLE</span>
            <span className="balance-val">${balance.toLocaleString()}</span>
          </div>
          <div className="scoreboard-daily-col">
            <span className="daily-timer-text">
              {canClaimDaily ? '✨ ¡$5.000 DISPONIBLES!' : `Recarga: ${timeLeft}`}
            </span>
            <button 
              type="button"
              className="daily-claim-btn"
              onClick={handleClaimDaily}
              disabled={!canClaimDaily}
            >
              <Gift size={12} style={{ display: 'inline', marginRight: '3px' }} />
              Bono Diario +$5.000
            </button>
          </div>
        </div>

        {/* Ruleta giratoria animada */}
        <div className="wheel-stage">
          <div className={`wheel-pointer ${isSpinning ? 'ticking' : ''}`} />
          <div className="wheel-svg-wrap">
            <svg 
              className="wheel-svg" 
              viewBox="-100 -100 200 200"
              style={{
                transform: `rotate(${wheelRotation}deg)`,
                transition: isSpinning ? 'transform 4s cubic-bezier(0.12, 0.8, 0.15, 1)' : 'none'
              }}
            >
              {SLICES.map((slice, i) => {
                const startAngle = (i * sliceAngle - 90) * (Math.PI / 180);
                const endAngle = ((i + 1) * sliceAngle - 90) * (Math.PI / 180);
                const x1 = 98 * Math.cos(startAngle);
                const y1 = 98 * Math.sin(startAngle);
                const x2 = 98 * Math.cos(endAngle);
                const y2 = 98 * Math.sin(endAngle);
                const pathData = `M 0 0 L ${x1} ${y1} A 98 98 0 0 1 ${x2} ${y2} Z`;

                const midAngle = (i * sliceAngle + sliceAngle / 2 - 90) * (Math.PI / 180);
                const textX = 66 * Math.cos(midAngle);
                const textY = 66 * Math.sin(midAngle);
                const textRotation = i * sliceAngle + sliceAngle / 2;

                return (
                  <g key={i}>
                    <path d={pathData} fill={slice.color} stroke="#ffffff" strokeWidth="1.5" />
                    <text
                      x={textX}
                      y={textY}
                      fill={slice.textColor}
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="var(--font-pixel)"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                    >
                      {slice.label}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="wheel-center-cap" onClick={handleSpin}>
              ♥
            </div>
          </div>

          {spinResult && (
            <div className={`spin-result-banner ${spinResult.type}`}>
              {spinResult.message}
            </div>
          )}
        </div>

        {/* Panel de Apuestas */}
        <div className="bet-controls-card">
          <div className="bet-input-row">
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#6a3885' }}>Apuesta:</span>
            <div className="bet-amount-display">${betAmount.toLocaleString()}</div>
            <div style={{ display: 'flex', gap: '3px' }}>
              <button 
                type="button" 
                className="bet-chip-btn" 
                onClick={() => setBetAmount(prev => Math.max(500, prev - 500))}
                disabled={isSpinning}
              >
                -500
              </button>
              <button 
                type="button" 
                className="bet-chip-btn" 
                onClick={() => setBetAmount(prev => Math.min(balance, prev + 500))}
                disabled={isSpinning}
              >
                +500
              </button>
            </div>
          </div>

          <div className="bet-quick-btns">
            {[500, 1000, 2500, 5000].map(amt => (
              <button 
                key={amt}
                type="button"
                className="bet-chip-btn"
                onClick={() => setBetAmount(Math.min(balance, amt))}
                disabled={isSpinning}
                style={{ fontWeight: betAmount === amt ? 'bold' : 'normal', borderColor: betAmount === amt ? '#ff1493' : '#caa8f3' }}
              >
                ${amt.toLocaleString()}
              </button>
            ))}
            <button 
              type="button" 
              className="bet-chip-btn"
              onClick={() => setBetAmount(balance)}
              disabled={isSpinning || balance <= 0}
              style={{ background: '#ffdeeb', color: '#c2255c', fontWeight: 'bold' }}
            >
              ALL IN! 🔥
            </button>
          </div>

          <button
            type="button"
            className="spin-main-btn"
            onClick={handleSpin}
            disabled={isSpinning || balance < betAmount || betAmount <= 0}
          >
            {isSpinning ? '🎰 GIRANDO LA RULETA...' : `¡GIRAR POR $${betAmount.toLocaleString()}!`}
          </button>
        </div>

        {/* Tienda de Premios Canjeables */}
        <div className="prizes-shop-section">
          <div className="prizes-shop-title">
            <Trophy size={14} color="#f59f00" />
            <span>PREMIOS CANJEABLES REALES</span>
            <Trophy size={14} color="#f59f00" />
          </div>

          <div className="prizes-cards-grid">
            {/* Premio 1: 100.000 salida insana */}
            <div className={`prize-reward-card ${balance >= 100000 ? 'can-afford' : ''}`}>
              <div className="prize-icon-col">🎟️</div>
              <div className="prize-info-col">
                <div className="prize-title-row">
                  <span>Salida Insana</span>
                  <span className="prize-cost-badge">$100.000</span>
                </div>
                <div className="prize-desc-text">Vale oficial por una salida juntos a donde quieras.</div>
                <div className="prize-progress-track">
                  <div 
                    className="prize-progress-fill" 
                    style={{ width: `${Math.min(100, (balance / 100000) * 100)}%` }} 
                  />
                </div>
              </div>
              <button
                type="button"
                className="prize-redeem-btn"
                onClick={() => handleRedeem("Salida Insana 🎟️", 100000, "Vale por una salida/cita insana juntos a donde quieras.")}
                disabled={balance < 100000}
              >
                {balance >= 100000 ? '¡CANJEAR!' : `${Math.round((balance / 100000) * 100)}%`}
              </button>
            </div>

            {/* Premio 2: 150.000 lo q me pidas insano */}
            <div className={`prize-reward-card ${balance >= 150000 ? 'can-afford' : ''}`}>
              <div className="prize-icon-col">👑</div>
              <div className="prize-info-col">
                <div className="prize-title-row">
                  <span>Lo q me pidas insano</span>
                  <span className="prize-cost-badge" style={{ background: '#ff922b', color: '#fff' }}>$150.000</span>
                </div>
                <div className="prize-desc-text">Premio Legendario: Pídeme lo que quieras y te lo cumplo.</div>
                <div className="prize-progress-track">
                  <div 
                    className="prize-progress-fill" 
                    style={{ 
                      width: `${Math.min(100, (balance / 150000) * 100)}%`,
                      background: 'linear-gradient(90deg, #ffd43b 0%, #ff922b 100%)' 
                    }} 
                  />
                </div>
              </div>
              <button
                type="button"
                className="prize-redeem-btn"
                onClick={() => handleRedeem("Lo que me pidas insano 👑", 150000, "Premio Legendario: Pídeme lo que quieras y te lo cumplo.")}
                disabled={balance < 150000}
                style={balance >= 150000 ? { background: '#f59f00' } : {}}
              >
                {balance >= 150000 ? '¡CANJEAR!' : `${Math.round((balance / 150000) * 100)}%`}
              </button>
            </div>
          </div>

          {/* Historial de premios canjeados */}
          {redeemedPrizes.length > 0 && (
            <div style={{ marginTop: '10px', background: '#fff', border: '1px solid #caa8f3', borderRadius: '4px', padding: '6px 10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#d63384', marginBottom: '4px' }}>
                📜 TUS PREMIOS CANJEADOS ({redeemedPrizes.length}):
              </div>
              {redeemedPrizes.map(p => (
                <div key={p.id} style={{ fontSize: '11px', color: '#495057', display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px dotted #f1d7f5' }}>
                  <span><b>{p.name}</b> (Código: {p.code})</span>
                  <span style={{ color: '#2b8a3e', fontWeight: 'bold' }}>✓ CANJEADO ({p.date})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Certificado de Premio Canjeado */}
      {celebrationTicket && (
        <div className="certificate-modal-overlay" onClick={() => setCelebrationTicket(null)}>
          <div className="certificate-card" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '40px', marginBottom: '5px' }}>🎉✨🎟️</div>
            <h2 style={{ fontSize: '18px', color: '#d9480f', margin: '0 0 6px 0' }}>¡VALE OFICIAL CANJEADO!</h2>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#7b38a6', margin: '8px 0' }}>
              {celebrationTicket.name}
            </div>
            <p style={{ fontSize: '13px', color: '#495057', lineHeight: '1.4', margin: '0 0 12px 0' }}>
              {celebrationTicket.description}
            </p>
            <div style={{ background: '#fff3bf', border: '1.5px dashed #fab005', padding: '8px', borderRadius: '4px', fontSize: '12px', color: '#794500', marginBottom: '14px' }}>
              Código de Canje: <b>{celebrationTicket.code}</b>
              <br />
              Fecha: {celebrationTicket.date}
              <br />
              <i>¡Guarda o sácale captura a este vale para cobrarlo! 💕</i>
            </div>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={() => setCelebrationTicket(null)}
              style={{ width: 'auto', padding: '6px 20px', background: '#ffd43b' }}
            >
              ♥ Guardar Vale ♥
            </button>
          </div>
        </div>
      )}
    </DraggableWindow>
  );
}
