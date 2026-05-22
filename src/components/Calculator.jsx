import React, { useState } from 'react';
import DraggableWindow from './DraggableWindow';

export default function Calculator({ onClose, onFocus, zIndex, initialPosition }) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  
  const handleNum = (num) => {
    setDisplay(prev => prev === '0' ? num : prev + num);
  };
  
  const handleOp = (op) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };
  
  const calculate = () => {
    try {
      const result = eval(equation + display);
      setDisplay(String(result));
      setEquation('');
    } catch (e) {
      setDisplay('Error');
    }
  };
  
  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  const btnStyle = {
    padding: '10px',
    fontSize: '18px',
    background: 'var(--btn-bg)',
    border: '2px outset var(--btn-border-light)',
    fontFamily: 'var(--font-pixel)',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  return (
    <DraggableWindow 
      title="🧮 calc.exe" 
      onClose={onClose} 
      onFocus={onFocus} 
      zIndex={zIndex} 
      initialPosition={initialPosition} 
      width="250px"
    >
      <div className="window-content" style={{ padding: '15px' }}>
        <div style={{
          background: '#fff',
          border: '2px inset var(--window-border)',
          padding: '10px',
          textAlign: 'right',
          marginBottom: '15px',
          fontFamily: 'var(--font-pixel)'
        }}>
          <div style={{fontSize: '12px', color: '#888', minHeight: '14px'}}>{equation}</div>
          <div style={{fontSize: '24px', fontWeight: 'bold', overflow: 'hidden'}}>{display}</div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
          <button style={btnStyle} onClick={() => clear()}>C</button>
          <button style={btnStyle} onClick={() => setDisplay(prev => String(prev).slice(0, -1) || '0')}>←</button>
          <button style={btnStyle} onClick={() => handleOp('/')}>/</button>
          <button style={btnStyle} onClick={() => handleOp('*')}>x</button>
          
          <button style={btnStyle} onClick={() => handleNum('7')}>7</button>
          <button style={btnStyle} onClick={() => handleNum('8')}>8</button>
          <button style={btnStyle} onClick={() => handleNum('9')}>9</button>
          <button style={btnStyle} onClick={() => handleOp('-')}>-</button>
          
          <button style={btnStyle} onClick={() => handleNum('4')}>4</button>
          <button style={btnStyle} onClick={() => handleNum('5')}>5</button>
          <button style={btnStyle} onClick={() => handleNum('6')}>6</button>
          <button style={btnStyle} onClick={() => handleOp('+')}>+</button>
          
          <button style={btnStyle} onClick={() => handleNum('1')}>1</button>
          <button style={btnStyle} onClick={() => handleNum('2')}>2</button>
          <button style={btnStyle} onClick={() => handleNum('3')}>3</button>
          <button style={{...btnStyle, gridRow: 'span 2', background: '#ffb6c1'}} onClick={() => calculate()}>=</button>
          
          <button style={{...btnStyle, gridColumn: 'span 2'}} onClick={() => handleNum('0')}>0</button>
          <button style={btnStyle} onClick={() => handleNum('.')}>.</button>
        </div>
      </div>
    </DraggableWindow>
  );
}
