import React, { useState } from 'react';
import DraggableWindow from './DraggableWindow';
import SalesList from './SalesList';

export default function SalesCalendar({ onClose, onFocus, zIndex, initialPosition, sales, onRemove, onTogglePayment, onUpdateSale, onImportSales }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' or 'nodate'

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  // Filter sales for selected date
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const salesForSelected = sales.filter(s => {
    if (!s.fecha) return false;
    try {
      const saleDateStr = new Date(s.fecha + 'T12:00:00').toISOString().split('T')[0];
      return saleDateStr === selectedDateStr;
    } catch (e) {
      return false;
    }
  });

  const salesWithoutDate = sales.filter(s => !s.fecha);

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sales, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ventas_chiikawa_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importData = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          onImportSales(parsed);
          alert('¡Base de datos de ventas cargada con éxito! ♡');
        } else {
          alert('Archivo de backup no válido.');
        }
      } catch (err) {
        alert('Error al leer el archivo de backup.');
      }
    };
  };

  return (
    <DraggableWindow 
      title="📅 agendini.exe" 
      onClose={onClose} 
      onFocus={onFocus} 
      zIndex={zIndex} 
      initialPosition={initialPosition} 
      width="680px" 
      maxHeight="480px"
    >
      <div className="window-content calendar-container">
        <div className="calendar-left-pane">
          <div className="calendar-header">
            <button onClick={prevMonth} className="cal-btn">{'<'}</button>
            <span className="cal-title">{monthNames[month]} {year}</span>
            <button onClick={nextMonth} className="cal-btn">{'>'}</button>
          </div>

          <div className="calendar-grid">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
              <div key={d} className="cal-day-name">{d}</div>
            ))}
            {days.map((date, index) => {
              if (!date) return <div key={`empty-${index}`} className="cal-cell empty"></div>;
              
              const dateStr = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
              
              // Check if there are sales on this day
              const hasSales = sales.some(s => {
                if (!s.fecha) return false;
                try {
                  const sDate = new Date(s.fecha + 'T12:00:00').toISOString().split('T')[0];
                  return sDate === dateStr;
                } catch (e) {
                  return false;
                }
              });

              const isSelected = selectedDate.toISOString().split('T')[0] === dateStr;

              return (
                <div 
                  key={index} 
                  className={`cal-cell ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedDate(date)}
                >
                  <span className="cal-date-num">{date.getDate()}</span>
                  {hasSales && <span className="cal-indicator">🎀</span>}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '10px' }}>
            <button onClick={exportData} className="cal-btn" style={{ flex: 1, fontSize: '11px', padding: '5px' }}>📥 Guardar Backup</button>
            <label className="cal-btn" style={{ flex: 1, fontSize: '11px', padding: '5px', textAlign: 'center', cursor: 'pointer', display: 'block' }}>
              📤 Cargar Backup
              <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        <div className="calendar-details" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px', borderBottom: '2px solid var(--window-border)' }}>
            <button 
              type="button"
              onClick={() => setActiveTab('daily')} 
              style={{
                fontFamily: 'var(--font-pixel)',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                background: activeTab === 'daily' ? 'var(--window-bg)' : 'var(--btn-bg)',
                border: '2px solid var(--window-border)',
                borderBottom: activeTab === 'daily' ? 'none' : '2px solid var(--window-border)',
                marginBottom: activeTab === 'daily' ? '-2px' : '0px',
                fontWeight: activeTab === 'daily' ? 'bold' : 'normal',
                color: activeTab === 'daily' ? 'var(--highlight)' : 'var(--text-main)',
                zIndex: activeTab === 'daily' ? 2 : 1
              }}
            >
              📅 Ver Día
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('nodate')} 
              style={{
                fontFamily: 'var(--font-pixel)',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                background: activeTab === 'nodate' ? 'var(--window-bg)' : 'var(--btn-bg)',
                border: '2px solid var(--window-border)',
                borderBottom: activeTab === 'nodate' ? 'none' : '2px solid var(--window-border)',
                marginBottom: activeTab === 'nodate' ? '-2px' : '0px',
                fontWeight: activeTab === 'nodate' ? 'bold' : 'normal',
                color: activeTab === 'nodate' ? 'var(--highlight)' : 'var(--text-main)',
                zIndex: activeTab === 'nodate' ? 2 : 1
              }}
            >
              📌 Sin Fecha ({salesWithoutDate.length})
            </button>
          </div>

          {activeTab === 'daily' ? (
            <div className="calendar-details-list">
              <div className="details-header">
                Entregas para el {selectedDate.getDate()} de {monthNames[selectedDate.getMonth()]}
              </div>
              <SalesList 
                sales={salesForSelected} 
                onRemove={onRemove} 
                onTogglePayment={onTogglePayment} 
                onUpdateSale={onUpdateSale}
              />
            </div>
          ) : (
            <div className="calendar-details-list">
              <div className="details-header" style={{ color: '#ff69b4', borderColor: '#ff69b4' }}>
                Entregas sin fecha
              </div>
              <SalesList 
                sales={salesWithoutDate} 
                onRemove={onRemove} 
                onTogglePayment={onTogglePayment} 
                onUpdateSale={onUpdateSale}
              />
            </div>
          )}
        </div>
      </div>
    </DraggableWindow>
  );
}
