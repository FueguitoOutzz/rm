import React, { useState } from 'react';

export default function SalesList({ sales, onRemove, onTogglePayment, onUpdateSale }) {
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [editingDateId, setEditingDateId] = useState(null);
  const [editDateVal, setEditDateVal] = useState('');

  // Sort sales by date ascending
  const sortedSales = [...sales].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  if (sales.length === 0) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>No hay ventas agendadas aún.</div>;
  }

  return (
    <div>
      {sortedSales.map(sale => {
        let statusClass = 'status-pendiente';
        if (sale.estadoPago === 'Pagado') statusClass = 'status-pagado';
        
        return (
          <div key={sale.id} className="sale-item">
            <div className="sale-item-header">
              {editingDateId === sale.id ? (
                <input 
                  type="date" 
                  value={editDateVal} 
                  onChange={(e) => {
                    if (e.target.value) {
                      onUpdateSale(sale.id, { fecha: e.target.value });
                      setEditingDateId(null);
                    }
                  }}
                  onBlur={() => setEditingDateId(null)}
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '11px',
                    padding: '2px',
                    border: '2px solid var(--window-border)',
                  }}
                  autoFocus
                />
              ) : (
                <strong 
                  onClick={() => { setEditingDateId(sale.id); setEditDateVal(sale.fecha); }}
                  style={{ cursor: 'pointer', borderBottom: '1px dashed var(--window-border)' }}
                  title="Click para editar fecha de entrega"
                >
                  📅 {new Date(sale.fecha + 'T12:00:00').toLocaleDateString('es-ES')} ✎
                </strong>
              )}
              <span className={statusClass} onClick={() => onTogglePayment(sale.id)} style={{cursor: 'pointer'}}>
                {sale.estadoPago} {sale.estadoPago === 'Abonado' && sale.cantidadAbono ? `($${sale.cantidadAbono})` : ''}
              </span>
            </div>
            <div><strong>Comprador:</strong> {sale.nombre} {sale.redSocial && `(${sale.redSocial})`}</div>
            <div>
              <strong>Producto:</strong> {sale.producto} 
              {sale.precio && ` - $${sale.precio}`}
            </div>
            {sale.fechaCreacion && (
              <div style={{ fontSize: '0.85em', color: '#888', marginTop: '2px' }}>
                <strong>Creado:</strong> {new Date(sale.fechaCreacion + 'T12:00:00').toLocaleDateString('es-ES')}
              </div>
            )}
            {sale.estadoPago === 'Abonado' && sale.precio && sale.cantidadAbono && (
              <div style={{ color: '#ff1493', fontSize: '0.9em', marginTop: '2px' }}>
                <em>Resta pagar: ${parseInt(sale.precio) - parseInt(sale.cantidadAbono)}</em>
              </div>
            )}
            
            <div style={{ marginTop: '8px', borderTop: '1px dotted var(--window-border)', paddingTop: '5px', fontSize: '0.95em' }}>
              <strong>Detalles:</strong>{' '}
              {editingId === sale.id ? (
                <div style={{ marginTop: '5px' }}>
                  <textarea 
                    value={editVal} 
                    onChange={(e) => setEditVal(e.target.value)} 
                    style={{
                      width: '100%',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '12px',
                      padding: '4px',
                      boxSizing: 'border-box',
                      minHeight: '50px',
                      resize: 'vertical',
                      border: '2px solid var(--window-border)'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end', marginTop: '3px' }}>
                    <button onClick={() => { onUpdateSale(sale.id, { descripcion: editVal }); setEditingId(null); }} style={{ fontSize: '10px', padding: '2px 6px' }}>Guardar</button>
                    <button onClick={() => setEditingId(null)} style={{ fontSize: '10px', padding: '2px 6px' }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <span 
                  onClick={() => { setEditingId(sale.id); setEditVal(sale.descripcion || ''); }} 
                  style={{ cursor: 'pointer', color: sale.descripcion ? 'inherit' : '#888', fontStyle: sale.descripcion ? 'normal' : 'italic' }}
                >
                  {sale.descripcion || 'Click aquí para agregar lugar, hora, etc... ✎'}
                </span>
              )}
            </div>

            <div style={{ marginTop: '5px', textAlign: 'right' }}>
              <button onClick={() => onRemove(sale.id)} style={{ padding: '2px 5px', fontSize: '10px' }}>Borrar</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
