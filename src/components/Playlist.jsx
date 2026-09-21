import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Disc3, Play } from 'lucide-react';
import DraggableWindow from './DraggableWindow';

export default function Playlist({ token, playlistId, deviceId, initialPosition, zIndex, onClose, onFocus, onLogout }) {
  const [playlist, setPlaylist] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const getPlaylist = async () => {
      if (!token || !playlistId) return;

      if (token === 'guest_preview' || token === 'guest') {
        setPlaylist({
          name: "cause im under your spell.. 🌼",
          description: "Especial Flores Amarillas 💛 - ¡2 nuevos temas agregados!",
          images: [{ url: "/spoty.png" }],
          tracks: {
            items: [
              {
                track: {
                  id: 'track-new-1',
                  name: "Flores Amarillas (Especial 21 Sep)",
                  artists: [{ name: "Floricienta" }],
                  album: { name: "cause im under your spell..", images: [{ url: "/amechan.png" }] },
                  duration_ms: 221000,
                  isNew: true
                }
              },
              {
                track: {
                  id: 'track-new-2',
                  name: "Under Your Spell",
                  artists: [{ name: "Snow Strippers" }],
                  album: { name: "April Mixtape 3", images: [{ url: "/won.jpeg" }] },
                  duration_ms: 154000,
                  isNew: true
                }
              },
              {
                track: {
                  id: 'track-3',
                  name: "Kawaikute Gomen",
                  artists: [{ name: "HoneyWorks" }],
                  album: { name: "Chiikawa Favorites", images: [{ url: "/chii.png" }] },
                  duration_ms: 218000
                }
              },
              {
                track: {
                  id: 'track-4',
                  name: "Ame-chan Lullaby",
                  artists: [{ name: "NSO Sound" }],
                  album: { name: "Needy Streamer", images: [{ url: "/ame2.png" }] },
                  duration_ms: 180000
                }
              }
            ]
          }
        });
        setErrorMsg(null);
        return;
      }

      try {
        let data;
        try {
          const res = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}?market=from_token`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          data = res.data;
        } catch (err) {
          if (err.response && err.response.status === 404) {
            const res2 = await axios.get(`https://api.spotify.com/v1/albums/${playlistId}?market=from_token`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            data = res2.data;
            if (data.tracks && data.tracks.items) {
              data.tracks.items = data.tracks.items.map(t => ({
                track: {
                  ...t,
                  album: data
                }
              }));
            }
            data.isAlbum = true;
          } else {
            throw err;
          }
        }
        
        setPlaylist(data);
        setErrorMsg(null);
      } catch (error) {
        console.error("Error fetching playlist", error);
        if (error.response && error.response.status === 401) {
          if (token !== 'guest_preview' && token !== 'guest' && onLogout) {
            onLogout();
          } else {
            setErrorMsg("Modo Escritorio: Inicia sesión en Spotify para conectar tus playlists.");
          }
        } else if (error.response && error.response.status === 403) {
          const srvMsg = error.response.data?.error?.message || "Sin detalles adicionales";
          setErrorMsg(`Error 403 de Spotify: ${srvMsg}. Asegúrate de que tienes permisos.`);
        } else {
          setErrorMsg(`Error al cargar la playlist: ${error.message}`);
        }
      }
    };

    getPlaylist();
  }, [token, playlistId, onLogout]);

  const playTrack = async (uri, index) => {
    if (token === 'guest_preview' || token === 'guest') {
      alert("🌼 Modo Escritorio: Inicia sesión con Spotify para reproducir música completa en vivo.");
      return;
    }
    if (!deviceId) {
      alert("El reproductor aún no está listo. Espera a que diga NO SIGNAL.");
      return;
    }
    try {
      await axios.put(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        context_uri: playlist?.isAlbum ? `spotify:album:${playlistId}` : `spotify:playlist:${playlistId}`,
        offset: { position: index }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error("Error playing track", e);
      const srvMsg = e.response?.data?.error?.message || e.message || "Error desconocido";
      const reason = e.response?.data?.error?.reason;
      alert(`Error al reproducir: ${srvMsg} ${reason ? `(${reason})` : ''}\n\nSi dice PREMIUM_REQUIRED, significa que la cuenta no tiene premium. Si dice RESTRICTED, intenta interactuar con la página primero.`);
    }
  };

  if (errorMsg) {
    return (
      <DraggableWindow title="ERROR.exe" onClose={onClose} onFocus={onFocus} zIndex={zIndex} initialPosition={initialPosition} width="400px" maxHeight="400px">
        <div className="window-content" style={{textAlign: 'center', padding: '20px'}}>
          <Disc3 className="spin-icon" size={48} style={{color: 'red', marginBottom: '15px'}} />
          <p style={{color: '#ff0055', marginBottom: '15px'}}>{errorMsg}</p>
          <button className="btn-primary" onClick={onClose}>Cerrar Ventana</button>
        </div>
      </DraggableWindow>
    );
  }

  if (!playlist) {
    return (
      <DraggableWindow title="Cargando..." onClose={onClose} onFocus={onFocus} zIndex={zIndex} initialPosition={initialPosition} width="300px" maxHeight="300px">
        <div className="window-content" style={{textAlign: 'center', padding: '20px'}}>
          <Disc3 className="spin-icon" size={32} />
          <p style={{marginTop: '10px'}}>Leyendo datos...</p>
        </div>
      </DraggableWindow>
    );
  }

  return (
    <DraggableWindow title={`🎵 ${playlist.name}.exe`} onClose={onClose} onFocus={onFocus} zIndex={zIndex} initialPosition={initialPosition}>
      <div className="window-content">
        <div className="playlist-header">
          <img 
            src={playlist.images[0]?.url} 
            alt="Playlist Cover" 
            className="playlist-cover pixel-border"
          />
          <div className="playlist-info">
            <h2>{playlist.name}</h2>
            <p>{playlist.description || "tkm"}</p>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(90deg, #fff9db 0%, #fff3bf 100%)',
          border: '1.5px dashed #fab005',
          borderRadius: '4px',
          padding: '6px 10px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-pixel)',
          fontSize: '12px',
          color: '#d9480f',
          boxShadow: '1px 1px 0px rgba(0,0,0,0.1)'
        }}>
          <span style={{ fontSize: '18px' }}>🌼</span>
          <div style={{ flex: 1 }}>
            <b style={{ color: '#d9480f' }}>¡Especial Flores Amarillas!</b> Se agregaron <b>2 nuevos temas</b> a la playlist. 💛✨
          </div>
        </div>

        <div className="tracks-list">
          {(() => {
            let tracksArray = [];
            if (Array.isArray(playlist.tracks?.items)) {
              tracksArray = playlist.tracks.items;
            } else if (playlist.items && Array.isArray(playlist.items.items)) {
              tracksArray = playlist.items.items;
            } else if (Array.isArray(playlist.tracks)) {
              tracksArray = playlist.tracks;
            } else if (Array.isArray(playlist.items)) {
              tracksArray = playlist.items;
            }
            
            if (tracksArray.length === 0) {
              return <p style={{ textAlign: 'center', marginTop: '20px' }}>No hay canciones en esta playlist.</p>;
            }

            return tracksArray.map((item, index) => {
              const trackData = item.track || item.item || item; 
              
              if (!trackData || !trackData.name) return null;
              return (
                <div className="track-card" key={(trackData.id || index) + "-" + index}>
                  <img 
                    src={trackData.album?.images?.[0]?.url || "/spoty.png"} 
                    alt={trackData.name} 
                    className="track-img" 
                  />
                  
                  <div className="track-details">
                    <h3 className="track-name">
                      {trackData.name || 'Canción desconocida'}
                      {trackData.isNew && (
                        <span style={{
                          background: '#ffd43b',
                          color: '#b74309',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          padding: '1px 6px',
                          borderRadius: '3px',
                          marginLeft: '6px',
                          border: '1px solid #fab005',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}>
                          🌼 NUEVO
                        </span>
                      )}
                    </h3>
                    <p className="track-artist">{trackData.artists?.map(a => a.name).join(', ') || 'Artista desconocido'}</p>
                  </div>

                  <div className="track-actions">
                    <button 
                      className="play-track-btn" 
                      onClick={() => playTrack(trackData.uri, index)}
                      disabled={!deviceId}
                    >
                      <Play size={16} fill="currentColor" />
                    </button>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </DraggableWindow>
  );
}

