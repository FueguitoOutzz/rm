import React, { useState, useEffect } from 'react';
import DraggableWindow from './DraggableWindow';

const EMOJIS = ['🐰', '🐱', '🐻', '🍓', '🎀', '💖', '🌸', '🍰'];

export default function MemoryGame({ onClose, onFocus, zIndex, initialPosition }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const shuffledCards = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji }));
    
    setCards(shuffledCards);
    setFlipped([]);
    setSolved([]);
    setMoves(0);
    setIsWon(false);
    setDisabled(false);
  };

  const handleCardClick = (index) => {
    if (disabled || flipped.includes(index) || solved.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setDisabled(true);
      setMoves(m => m + 1);

      const [firstIndex, secondIndex] = newFlipped;
      if (cards[firstIndex].emoji === cards[secondIndex].emoji) {
        setSolved(prev => [...prev, firstIndex, secondIndex]);
        setFlipped([]);
        setDisabled(false);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (solved.length === EMOJIS.length * 2 && solved.length > 0) {
      setIsWon(true);
    }
  }, [solved]);

  return (
    <DraggableWindow 
      title="🎮 memoria.exe" 
      onClose={onClose} 
      onFocus={onFocus} 
      zIndex={zIndex} 
      initialPosition={initialPosition} 
      width="340px"
    >
      <div className="window-content memory-game-content">
        {isWon ? (
          <div className="memory-win-screen">
            <h2 className="win-title">¡GANASTE! 🎉</h2>
            <p className="win-message">✨ Eres la gatita más inteligente del mundo ✨</p>
            <p className="win-stats">Movimientos: {moves}</p>
            <button className="btn-primary" onClick={startNewGame}>Jugar de nuevo</button>
          </div>
        ) : (
          <>
            <div className="memory-header">
              <span>Movimientos: {moves}</span>
              <button className="btn-secondary" onClick={startNewGame}>Reiniciar</button>
            </div>
            <div className="memory-grid">
              {cards.map((card, index) => (
                <div 
                  key={card.id} 
                  className={`memory-card ${flipped.includes(index) || solved.includes(index) ? 'flipped' : ''}`}
                  onClick={() => handleCardClick(index)}
                >
                  <div className="memory-card-inner">
                    <div className="memory-card-front">
                      <span>?</span>
                    </div>
                    <div className="memory-card-back">
                      <span>{card.emoji}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DraggableWindow>
  );
}
