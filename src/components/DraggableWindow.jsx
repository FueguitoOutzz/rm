import React, { useState, useRef, useEffect } from 'react';

export default function DraggableWindow({ title, onClose, onFocus, zIndex, initialPosition, children, width = "400px", maxHeight = "70vh" }) {
  const [position, setPosition] = useState(initialPosition || { x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.target.closest('.title-bar-controls') || isMaximized) return;
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
      className={`window ${isMinimized ? 'minimized' : ''} ${isMaximized ? 'maximized' : ''}`}
      style={isMaximized ? {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: isMinimized ? 'auto' : '100%',
        maxHeight: isMinimized ? 'auto' : 'none',
        zIndex: zIndex
      } : { 
        position: 'absolute', 
        left: position.x, 
        top: position.y, 
        zIndex: zIndex, 
        width: width, 
        maxHeight: isMinimized ? 'auto' : maxHeight 
      }}
      onClick={onFocus}
    >
      <div 
        className="title-bar" 
        onMouseDown={handleMouseDown} 
        onDoubleClick={() => {
          setIsMaximized(!isMaximized);
          setIsMinimized(false);
        }}
        style={{ cursor: isMaximized ? 'default' : (isDragging ? 'grabbing' : 'grab') }}
      >
        <span className="title">{title}</span>
        <div className="title-bar-controls">
          <button 
            type="button"
            aria-label="Minimize" 
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? '□' : '_'}
          </button>
          <button 
            type="button"
            aria-label="Maximize" 
            onClick={() => {
              setIsMaximized(!isMaximized);
              setIsMinimized(false);
            }}
          >
            {isMaximized ? '❐' : '🗖'}
          </button>
          {onClose && (
            <button 
              type="button"
              aria-label="Close" 
              onClick={onClose}
            >
              x
            </button>
          )}
        </div>
      </div>
      
      {!isMinimized && children}
    </div>
  );
}
