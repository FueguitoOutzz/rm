import React, { useState, useEffect } from 'react';
import DraggableWindow from './DraggableWindow';

export default function Tamagotchi({ onClose, onFocus, zIndex, initialPosition }) {
  const [hunger, setHunger] = useState(50);
  const [happiness, setHappiness] = useState(50);
  const [message, setMessage] = useState("¡Hola! Soy tu pingüinito.");

  // Decrease stats over time
  useEffect(() => {
    const timer = setInterval(() => {
      setHunger(prev => Math.max(0, prev - 2));
      setHappiness(prev => Math.max(0, prev - 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (hunger < 20) {
      setMessage("¡Tengo mucha hambre! 🐟");
    } else if (happiness < 20) {
      setMessage("QUEEEEEEEEE??? 🥺");
    } else if (hunger > 80 && happiness > 80) {
      setMessage("El wino está feliz");
    } else {
      setMessage("Pinwino 🐧");
    }
  }, [hunger, happiness]);

  const feed = () => {
    setHunger(prev => Math.min(100, prev + 15));
    setMessage("ATUUUUUUN");
  };

  const play = () => {
    setHappiness(prev => Math.min(100, prev + 15));
    setHunger(prev => Math.max(0, prev - 5)); // Playing makes it hungry
    setMessage("SEEEEEEEEEEEEEEEEEEEEEEE");
  };

  return (
    <DraggableWindow 
      title="🐧 win0.exe" 
      onClose={onClose} 
      onFocus={onFocus} 
      zIndex={zIndex} 
      initialPosition={initialPosition} 
      width="280px"
    >
      <div className="window-content tamagotchi-content">
        <div className="tamagotchi-screen pixel-border">
          <p className="tamagotchi-message">{message}</p>
          <div className="tamagotchi-sprite">
            {hunger < 20 || happiness < 20 ? '🧊🐧🧊' : (hunger > 80 && happiness > 80 ? '✨🐧✨' : '❄️🐧❄️')}
          </div>
          
          <div className="tamagotchi-stats">
            <div className="stat-bar-container">
              <span>Hambre</span>
              <div className="stat-bar">
                <div className="stat-fill" style={{width: `${hunger}%`, backgroundColor: hunger < 30 ? '#ff4d4d' : '#4dff4d'}}></div>
              </div>
            </div>
            <div className="stat-bar-container">
              <span>Felicidad</span>
              <div className="stat-bar">
                <div className="stat-fill" style={{width: `${happiness}%`, backgroundColor: happiness < 30 ? '#ff4d4d' : '#ff4dff'}}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="tamagotchi-controls">
          <button className="btn-primary" onClick={feed}>🐟 Alimentar</button>
          <button className="btn-secondary" onClick={play}>⚽ Jugar</button>
        </div>
      </div>
    </DraggableWindow>
  );
}
