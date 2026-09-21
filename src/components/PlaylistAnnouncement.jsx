import React, { useState } from 'react';
import { Sparkles, Music, X } from 'lucide-react';

export default function PlaylistAnnouncement({ onOpenPlaylist }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: '55px',
      left: '120px',
      zIndex: 4,
      fontFamily: 'var(--font-pixel)',
      background: 'linear-gradient(135deg, #fffdf0 0%, #fff9db 100%)',
      border: '2px solid #fab005',
      boxShadow: '4px 4px 0px rgba(180, 130, 0, 0.25)',
      borderRadius: '6px',
      width: '320px',
      padding: '10px 12px',
      userSelect: 'none',
      animation: 'bounceIn 0.4s ease-out'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px dashed #fcc419',
        paddingBottom: '5px',
        marginBottom: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d9480f', fontWeight: 'bold', fontSize: '12px' }}>
          <span>🌼</span>
          <span>¡NUEVOS TEMAS AGREGADOS!</span>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          aria-label="Cerrar anuncio"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#868e96',
            display: 'flex',
            alignItems: 'center',
            padding: '2px'
          }}
        >
          <X size={14} />
        </button>
      </div>

      <p style={{ fontSize: '13px', color: '#495057', lineHeight: '1.4', margin: '0 0 8px 0' }}>
        Se agregaron <b>2 nuevos temas</b> a la playlist:
        <br />
        <span style={{ color: '#d9480f', fontWeight: 'bold' }}>"cause im under your spell.." 💛</span>
      </p>

      <div style={{
        background: '#ffffff',
        border: '1px solid #ffe066',
        borderRadius: '4px',
        padding: '6px 8px',
        marginBottom: '10px',
        fontSize: '11px',
        color: '#665c00',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div>✨ <b>1.</b> Flores Amarillas (Especial)</div>
        <div>✨ <b>2.</b> Under Your Spell</div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => {
            if (onOpenPlaylist) onOpenPlaylist();
          }}
          className="btn-primary"
          style={{
            margin: 0,
            padding: '5px 10px',
            fontSize: '12px',
            background: '#ffd43b',
            borderColor: '#fcc419',
            color: '#794500',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}
        >
          <Music size={13} />
          Escuchar Playlist
        </button>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            padding: '5px 8px',
            fontSize: '11px',
            background: '#f1f3f5',
            border: '1px solid #ced4da',
            borderRadius: '2px',
            cursor: 'pointer',
            fontFamily: 'var(--font-pixel)',
            color: '#495057'
          }}
        >
          Ocultar
        </button>
      </div>
    </div>
  );
}
