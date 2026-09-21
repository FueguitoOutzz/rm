import { useEffect, useState, useRef } from 'react'
import Login from './components/Login'
import Playlist from './components/Playlist'
import Player from './components/Player'
import DesktopIcon from './components/DesktopIcon'
import MemoryGame from './components/MemoryGame'
import Tamagotchi from './components/Tamagotchi'
import SalesForm from './components/SalesForm'
import SalesCalendar from './components/SalesCalendar'
import Calculator from './components/Calculator'
import LyricsWindow from './components/LyricsWindow'
import BackgroundCounter from './components/BackgroundCounter'
import DraggableWindow from './components/DraggableWindow'
import YellowFlowers from './components/YellowFlowers'
import PlaylistAnnouncement from './components/PlaylistAnnouncement'
import CasinoRoulette from './components/CasinoRoulette'
import { useSales } from './hooks/useSales'
import { getAccessToken } from './utils/spotifyAuth'

function App() {
  const [token, setToken] = useState(window.localStorage.getItem("token_v2") || "")
  const [deviceId, setDeviceId] = useState(null)
  const hasFetched = useRef(false);
  const { sales, addSale, removeSale, togglePaymentStatus, updateSale, importSales } = useSales();
  const [playbackState, setPlaybackState] = useState({ currentTrack: null, isPaused: true });

  const [openWindows, setOpenWindows] = useState([
    { id: '2mwglwuk0B2aGHkMQTKB5f', type: 'playlist', x: 20, y: 20 }
  ]);
  const [activeWindow, setActiveWindow] = useState('2mwglwuk0B2aGHkMQTKB5f');
  const [showSaleCreatedAnim, setShowSaleCreatedAnim] = useState(false);

  const handleAddSale = (saleData) => {
    addSale(saleData);
    setShowSaleCreatedAnim(true);
    setTimeout(() => setShowSaleCreatedAnim(false), 3000);
  };

  const openApp = (type, id = null) => {
    const windowId = id || `${type}-${Date.now()}`;
    // Si ya está abierta y es playlist única, solo enfocarla
    if (id && openWindows.find(w => w.id === id)) {
      setActiveWindow(id);
      return;
    }
    setOpenWindows(prev => [...prev, { id: windowId, type, x: 50 + Math.random() * 50, y: 50 + Math.random() * 50 }]);
    setActiveWindow(windowId);
  };

  const closeWindow = (id) => {
    setOpenWindows(prev => prev.filter(w => w.id !== id));
  };

  useEffect(() => {
    const checkToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      let code = urlParams.get('code');

      if (!token && code && !hasFetched.current) {
        hasFetched.current = true;
        try {
          const accessToken = await getAccessToken(code);
          setToken(accessToken);
          window.localStorage.setItem("token_v2", accessToken);
          // Limpiar la URL de parámetros para que quede bonita
          window.history.replaceState({}, document.title, "/");
        } catch (error) {
          console.error("Fallo al obtener el token", error);
          hasFetched.current = false;
        }
      }
    };
    
    checkToken();
  }, [token])

  const handleGuestLogin = () => {
    window.localStorage.setItem("token_v2", "guest_preview");
    setToken("guest_preview");
  };

  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token_v2")
    window.localStorage.removeItem("code_verifier")
  }

  return (
    <div className="app-wrapper">
      <div className="desktop-area">
        {!token ? (
          <Login onGuestLogin={handleGuestLogin} />
        ) : (
          <>
            <YellowFlowers />

            <div className="background-collage">
              {/* Floating Chii sticker on the left (without frame) */}
              <img 
                src="/chii.png" 
                alt="Chiikawa sticker" 
                style={{ 
                  position: 'absolute', 
                  left: '40px', 
                  bottom: '100px', 
                  width: '168px', 
                  height: 'auto', 
                  transform: 'rotate(-8deg)', 
                  pointerEvents: 'none',
                  zIndex: 1,
                  opacity: 0.85
                }} 
              />

              <div className="background-sticker" style={{ right: '180px', top: '20px', transform: 'rotate(-5deg)', width: '115px' }}>
                <img src="/ame2.png" alt="Ame 2" style={{ width: '100px', height: '100px' }} />
              </div>
              <div className="background-sticker" style={{ right: '25px', top: '220px', transform: 'rotate(5deg)', width: '130px' }}>
                <img src="/amechan.png" alt="Amechan" style={{ width: '116px', height: '116px' }} />
              </div>
              <div className="background-sticker" style={{ right: '180px', bottom: '150px', transform: 'rotate(3deg)', width: '200px' }}>
                <img src="/kanata.gif" alt="Kanata" style={{ width: '184px', height: '184px' }} />
              </div>
              <div className="background-sticker" style={{ right: '15px', bottom: '15px', transform: 'rotate(-4deg)', width: '150px' }}>
                <img src="/fri.gif" alt="Friday" style={{ width: '134px', height: '134px' }} />
              </div>
              <div className="background-sticker" style={{ left: '260px', bottom: '60px', transform: 'rotate(-4deg)', width: '150px' }}>
                <img src="/won.jpeg" alt="Won" style={{ width: '134px', height: '134px', objectFit: 'cover' }} />
              </div>
              <div className="background-sticker" style={{ left: '425px', bottom: '65px', transform: 'rotate(5deg)', width: '145px' }}>
                <img src="/win.jpeg" alt="Wino" style={{ width: '130px', height: '130px', objectFit: 'cover' }} />
                <span className="sticker-caption">Wino</span>
              </div>
              <div className="background-sticker" style={{ left: '120px', top: '270px', transform: 'rotate(-5deg)', width: '135px' }}>
                <img src="/tuki.jpeg" alt="Tuki" style={{ width: '120px', height: '120px', objectFit: 'cover' }} />
                <span className="sticker-caption">Tuki</span>
              </div>
            </div>

            <BackgroundCounter />

            <PlaylistAnnouncement onOpenPlaylist={() => openApp('playlist', '2mwglwuk0B2aGHkMQTKB5f')} />

            <div className="desktop-icons">
              <DesktopIcon image="/spoty.png" label="cause im under your spell.." onDoubleClick={() => openApp('playlist', '2mwglwuk0B2aGHkMQTKB5f')} />
              <DesktopIcon image="/spoty.png" label="Lista wonita" onDoubleClick={() => openApp('playlist', '1Ei9Pp9vH76OlQEpobDPvN')} />
              <DesktopIcon image="/spoty.png" label="Todo :)" onDoubleClick={() => openApp('playlist', '5lSW7aosibk10zYLpgvKTa')} />

              <DesktopIcon icon="🎰" label="ruleta.exe" onDoubleClick={() => openApp('casino')} />
              <DesktopIcon icon="♥" label="amor.exe" onDoubleClick={() => openApp('aniversario')} />
              <DesktopIcon icon="🎮" label="memoria.exe" onDoubleClick={() => openApp('memory')} />
              <DesktopIcon icon="🐧" label="wino.exe" onDoubleClick={() => openApp('tamagotchi')} />
              
              <DesktopIcon icon="📝" label="ventini.exe" onDoubleClick={() => openApp('salesForm')} />
              <DesktopIcon icon="📅" label="agendini.exe" onDoubleClick={() => openApp('salesCalendar')} />
              <DesktopIcon icon="🧮" label="calc.exe" onDoubleClick={() => openApp('calculator')} />
              <DesktopIcon icon="🎤" label="letra.exe" onDoubleClick={() => openApp('lyrics')} />
            </div>

            <DesktopIcon 
              image="/futa.gif" 
              label="Instagram" 
              onDoubleClick={() => window.open("https://www.instagram.com/sylvanian.ccp/", "_blank")} 
              style={{ position: 'absolute', right: '25px', top: '20px', margin: 0, width: '120px' }}
              imageStyle={{ width: '95px', height: '95px' }}
            />

            {playbackState.currentTrack && !playbackState.isPaused && (
              <div style={{
                position: 'absolute',
                bottom: '20px',
                right: '130px',
                zIndex: 5,
                pointerEvents: 'none',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <img 
                  src="/chiikabu-chiikawa.gif" 
                  alt="Chiikabu dancing!" 
                  style={{
                    width: '100px',
                    imageRendering: 'pixelated',
                    filter: 'drop-shadow(3px 3px 0px rgba(0,0,0,0.15))'
                  }} 
                />
                <div style={{
                  fontSize: '11px',
                  color: '#fff',
                  marginTop: '4px',
                  fontFamily: 'var(--font-pixel)',
                  background: 'rgba(0,0,0,0.4)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  textShadow: '1px 1px 0px #000'
                }}>
                  Bailando con la música! ♪
                </div>
              </div>
            )}

            {showSaleCreatedAnim && (
              <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 9999,
                pointerEvents: 'none',
                textAlign: 'center',
                animation: 'bounceIn 0.5s ease-out'
              }}>
                <img 
                  src="/fri.gif" 
                  alt="Sale created!" 
                  style={{ 
                    width: '300px', 
                    height: 'auto', 
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' 
                  }} 
                />
                <div style={{
                  fontSize: '24px',
                  color: '#fff',
                  marginTop: '10px',
                  fontFamily: 'var(--font-pixel)',
                  background: 'rgba(0,0,0,0.6)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textShadow: '2px 2px 0px #000',
                  display: 'inline-block'
                }}>
                  ¡Venta creada!
                </div>
              </div>
            )}

            {openWindows.map(win => {
              const commonProps = {
                key: win.id,
                initialPosition: {x: win.x, y: win.y},
                zIndex: activeWindow === win.id ? 100 : 10,
                onFocus: () => setActiveWindow(win.id),
                onClose: () => closeWindow(win.id)
              };

              if (win.type === 'playlist') {
                return <Playlist {...commonProps} playlistId={win.id} token={token} deviceId={deviceId} onLogout={logout} />;
              }
              if (win.type === 'memory') {
                return <MemoryGame {...commonProps} />;
              }
              if (win.type === 'tamagotchi') {
                return <Tamagotchi {...commonProps} />;
              }
              if (win.type === 'salesForm') {
                return <SalesForm {...commonProps} onAddSale={handleAddSale} />;
              }
              if (win.type === 'salesCalendar') {
                return <SalesCalendar {...commonProps} sales={sales} onRemove={removeSale} onTogglePayment={togglePaymentStatus} onUpdateSale={updateSale} onImportSales={importSales} />;
              }
              if (win.type === 'calculator') {
                return <Calculator {...commonProps} />;
              }
              if (win.type === 'lyrics') {
                return <LyricsWindow {...commonProps} currentTrack={playbackState.currentTrack} />;
              }
              if (win.type === 'aniversario') {
                return (
                  <DraggableWindow {...commonProps} title="amor.exe - 01/10/2022" width="380px">
                    <div style={{ padding: '16px', textAlign: 'center', fontFamily: 'var(--font-pixel)', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                      <div style={{ fontSize: '38px', color: '#ff1493', animation: 'heartPulse 1.5s infinite ease-in-out' }}>♥</div>
                      <h2 style={{ fontSize: '18px', color: '#d63384', margin: 0 }}>¡Nuestra Historia de Amor!</h2>
                      <p style={{ fontSize: '14px', color: '#4a2c5a', lineHeight: '1.5', margin: 0 }}>
                        Juntos desde el <b>1 de Octubre de 2022</b> ♥<br />
                        Tu contador interactivo en vivo está activo en el fondo de tu escritorio.
                      </p>
                      <div style={{ 
                        padding: '12px 14px', 
                        background: 'linear-gradient(180deg, #ffffff 0%, #fff0f7 100%)', 
                        border: '1.5px dashed #ff69b4', 
                        borderRadius: '6px', 
                        fontSize: '12px', 
                        color: '#7b38a6',
                        lineHeight: '1.6'
                      }}>
                        "Cada día, cada hora y cada segundo a tu lado son lo mejor que me ha pasado." ♥
                      </div>
                      <button 
                        type="button" 
                        className="btn-primary" 
                        onClick={commonProps.onClose} 
                        style={{ marginTop: '5px', width: 'auto', padding: '6px 20px' }}
                      >
                        ♥ Cerrar ♥
                      </button>
                    </div>
                  </DraggableWindow>
                );
              }
              if (win.type === 'casino') {
                return <CasinoRoulette {...commonProps} />;
              }
              return null;
            })}
          </>
        )}
      </div>

      <div className="taskbar">
        <button className="start-button">
          {token ? "🎵 Reproductor" : "OS Chiikawa"}
        </button>

        {token && <Player token={token} onDeviceReady={setDeviceId} onPlaybackStateChange={setPlaybackState} />}
        
        <div className="clock">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

export default App
