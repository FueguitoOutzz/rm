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

  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token_v2")
    window.localStorage.removeItem("code_verifier")
  }

  return (
    <div className="app-wrapper">
      <div className="desktop-area">
        {!token ? (
          <Login />
        ) : (
          <>
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

              <div className="background-sticker" style={{ right: '430px', top: '50px', transform: 'rotate(-6deg)', width: '120px' }}>
                <img src="/ame2.png" alt="Ame 2" style={{ width: '104px', height: '104px' }} />
              </div>
              <div className="background-sticker" style={{ right: '280px', top: '70px', transform: 'rotate(5deg)', width: '140px' }}>
                <img src="/amechan.png" alt="Amechan" style={{ width: '124px', height: '124px' }} />
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
            </div>

            <div className="desktop-icons">
              <DesktopIcon image="/spoty.png" label="Main Playlist" onDoubleClick={() => openApp('playlist', '2mwglwuk0B2aGHkMQTKB5f')} />
              <DesktopIcon image="/spoty.png" label="Lista wonita" onDoubleClick={() => openApp('playlist', '1Ei9Pp9vH76OlQEpobDPvN')} />
              <DesktopIcon image="/spoty.png" label="Todo :)" onDoubleClick={() => openApp('playlist', '5lSW7aosibk10zYLpgvKTa')} />

              
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
              style={{ position: 'absolute', right: '20px', top: '20px', margin: 0, width: '120px' }}
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
                return <SalesForm {...commonProps} onAddSale={addSale} />;
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
