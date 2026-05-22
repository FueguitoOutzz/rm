import React, { useState } from 'react';

export default function DesktopIcon({ icon, image, label, onDoubleClick, style, imageStyle }) {
  const [isSelected, setIsSelected] = useState(false);

  // We use a single click to select, double click to open
  const handleClick = (e) => {
    e.stopPropagation();
    setIsSelected(true);
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (onDoubleClick) onDoubleClick();
  };

  // Click outside to deselect
  React.useEffect(() => {
    const handleWindowClick = () => setIsSelected(false);
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  return (
    <div 
      className={`desktop-icon ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={style}
    >
      <div className="icon-image">
        {image ? <img src={image} alt={label} draggable="false" style={{ width: '32px', height: '32px', objectFit: 'contain', ...imageStyle }} /> : icon}
      </div>
      <span className="icon-label">{label}</span>
    </div>
  );
}
