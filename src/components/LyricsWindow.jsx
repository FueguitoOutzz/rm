import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DraggableWindow from './DraggableWindow';

export default function LyricsWindow({ onClose, onFocus, zIndex, initialPosition, currentTrack }) {
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(false);
  const [artist, setArtist] = useState('');
  const [title, setTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fetch lyrics when currentTrack changes
  useEffect(() => {
    if (currentTrack) {
      const trackArtist = currentTrack.artists[0]?.name || '';
      const trackTitle = currentTrack.name || '';
      setArtist(trackArtist);
      setTitle(trackTitle);
      fetchLyrics(trackArtist, trackTitle);
    }
  }, [currentTrack]);

  const fetchLyrics = async (searchArtist, searchTitle) => {
    if (!searchArtist || !searchTitle) return;
    setLoading(true);
    setErrorMsg('');
    setLyrics('');

    // Normalize track title (remove suffixes like "- Remastered", "feat.", etc. for better search matches)
    let cleanTitle = searchTitle
      .split(' - ')[0]
      .split(' (')[0]
      .replace(/feat\..*/i, '')
      .trim();

    try {
      const res = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(searchArtist)}/${encodeURIComponent(cleanTitle)}`);
      if (res.data && res.data.lyrics) {
        setLyrics(res.data.lyrics);
      } else {
        setErrorMsg('No se encontraron letras.');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('No se pudo cargar la letra automáticamente. ¡Prueba buscando de forma manual!');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    fetchLyrics(artist, title);
  };

  return (
    <DraggableWindow 
      title="🎤 Letra.exe" 
      onClose={onClose} 
      onFocus={onFocus} 
      zIndex={zIndex} 
      initialPosition={initialPosition} 
      width="400px" 
      maxHeight="500px"
    >
      <div className="window-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '15px' }}>
        {/* Manual search inputs */}
        <form onSubmit={handleManualSearch} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px', borderBottom: '2px dashed var(--window-border)', paddingBottom: '15px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              style={{ flex: 1, fontSize: '12px', padding: '4px' }} 
              value={artist} 
              onChange={(e) => setArtist(e.target.value)} 
              placeholder="Artista" 
            />
            <input 
              style={{ flex: 1, fontSize: '12px', padding: '4px' }} 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Canción" 
            />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '0', padding: '5px' }}>Buscar Letra 🔍</button>
        </form>

        {/* Lyrics display area */}
        <div style={{ 
          flex: 1, 
          background: '#fff3fc', 
          border: '2px inset var(--window-border)', 
          padding: '12px', 
          overflowY: 'auto',
          minHeight: '200px',
          fontFamily: 'var(--font-pixel)',
          fontSize: '14px',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
          textAlign: 'center'
        }}>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--highlight)' }}>
              <div className="spin-icon" style={{ fontSize: '32px', marginBottom: '10px' }}>💿</div>
              <span>Buscando acordes y letras...</span>
            </div>
          )}

          {!loading && errorMsg && (
            <div style={{ padding: '20px', color: '#ff1493', fontStyle: 'italic' }}>
              <p>{errorMsg}</p>
              <p style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
                Gatita, la API libre puede ser un poco tímida. Si no funciona, ¡puedes cantar a capela! 💕🎤
              </p>
            </div>
          )}

          {!loading && !errorMsg && !lyrics && (
            <div style={{ color: '#888', fontStyle: 'italic', padding: '20px' }}>
              Reproduce una canción en Spotify o busca arriba para ver la letra... ♪
            </div>
          )}

          {!loading && lyrics && (
            <div style={{ color: 'var(--text-main)' }}>
              <h3 style={{ color: 'var(--highlight)', marginBottom: '15px', borderBottom: '1px dotted var(--highlight)', paddingBottom: '5px' }}>
                {title}
              </h3>
              {lyrics.replace(/Paroles de.*/i, '')}
            </div>
          )}
        </div>
      </div>
    </DraggableWindow>
  );
}
