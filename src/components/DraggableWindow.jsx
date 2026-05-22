import React, { useState, useRef, useEffect } from 'react';

export default function DraggableWindow({ title, onClose, onFocus, zIndex, initialPosition, children, width = "400px", maxHeight = "70vh" }) {
  const [position, setPosition] = useState(initialPosition || { x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.target.closest('.title-bar-controls')) return;
    setIsDragging(true);
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    if (onFocus) onFocus();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      className="window" 
      style={{ 
        position: 'absolute', 
        left: position.x, 
        top: position.y, 
        zIndex: zIndex, 
        width: width, 
        maxHeight: isMinimized ? 'auto' : maxHeight 
      }}
      onClick={onFocus}
    >
      <div className="title-bar" onMouseDown={handleMouseDown} style={{cursor: isDragging ? 'grabbing' : 'grab'}}>
        <span className="title">{title}</span>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={() => setIsMinimized(!isMinimized)}>{isMinimized ? '□' : '_'}</button>
          <button aria-label="Maximize">[]</button>
          {onClose && <button aria-label="Close" onClick={onClose}>x</button>}
        </div>
      </div>
      
      {!isMinimized && children}
    </div>
  );
}
