import React from 'react';
import { Music, Heart } from 'lucide-react';
import { redirectToAuthCodeFlow } from '../utils/spotifyAuth';

export default function Login({ onGuestLogin }) {
  const handleLogin = async () => {
    await redirectToAuthCodeFlow();
  };

  return (
    <div className="login-container">
      <div className="window login-card">
        <div className="title-bar">
          <span className="title">Login.exe</span>
          <div className="title-bar-controls">
            <button aria-label="Minimize">_</button>
            <button aria-label="Maximize">[]</button>
            <button aria-label="Close">x</button>
          </div>
        </div>
        <div className="window-content login-content">
          <div className="icon-wrapper">
            <Heart className="heart-icon" size={48} color="#ff69b4" />
          </div>
          <h1>OS Chiikawa ❤️</h1>
          <p>La insanidad que compartimos</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', marginTop: '16px' }}>
            <button className="start-button" onClick={handleLogin} style={{fontSize: '14px', padding: '8px 16px', background: '#1DB954'}}>
              <Music size={16} /> Conectar con Spotify
            </button>
            {onGuestLogin && (
              <button 
                type="button"
                className="start-button" 
                onClick={onGuestLogin} 
                style={{fontSize: '12px', padding: '5px 12px', background: '#bfa1f6', color: '#fff'}}
              >
                🌸 Ver Escritorio
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
