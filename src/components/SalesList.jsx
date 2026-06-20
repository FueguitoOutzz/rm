import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

function DraggableSaleItem({ sale, children }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: sale.id.toString(),
    data: sale
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    position: isDragging ? 'relative' : 'static',
    zIndex: isDragging ? 999 : 1,
    touchAction: 'none' // Important for touch devices
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export default function SalesList({ sales, onRemove, onTogglePayment, onUpdateSale }) {
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [editingDateId, setEditingDateId] = useState(null);
  const [editDateVal, setEditDateVal] = useState('');
  const [editingField, setEditingField] = useState(null); // { id, field, value }

  const handleEditClick = (e, saleId, field, initialValue) => {
    e.stopPropagation();
    setEditingField({ id: saleId, field, value: initialValue || '' });
  };

  const handleSaveField = (saleId) => {
    if (editingField && editingField.id === saleId) {
      onUpdateSale(saleId, { [editingField.field]: editingField.value });
      setEditingField(null);
    }
  };

  const renderField = (sale, fieldName, label, displayValue) => {
    if (editingField && editingField.id === sale.id && editingField.field === fieldName) {
      return (
        <span onPointerDown={e => e.stopPropagation()}>
          <input 
            type={fieldName === 'precio' || fieldName === 'cantidadAbono' ? 'number' : 'text'}
            autoFocus
            value={editingField.value}
            onChange={(e) => setEditingField({...editingField, value: e.target.value})}
            onBlur={() => handleSaveField(sale.id)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveField(sale.id)}
            style={{
               fontFamily: 'var(--font-pixel)',
               fontSize: '12px',
               padding: '2px',
               width: fieldName === 'precio' || fieldName === 'cantidadAbono' ? '60px' : '100px',
               border: '1px solid var(--window-border)'
            }}
          />
        </span>
      );
    }
    return (
      <span 
        onDoubleClick={(e) => handleEditClick(e, sale.id, fieldName, sale[fieldName])}
        style={{ cursor: 'pointer', borderBottom: '1px dotted #ccc' }}
        title={`Doble click para editar ${label}`}
      >
        {displayValue || '...'}
      </span>
    );
  };

  const getGoogleCalendarUrl = (sale) => {
    if (!sale.fecha) return '#';
    const title = encodeURIComponent(`Entrega: ${sale.producto}`);
    const startDate = new Date(sale.fecha + 'T12:00:00');
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    const startStr = startDate.toISOString().split('T')[0].replace(/-/g, '');
    const endStr = endDate.toISOString().split('T')[0].replace(/-/g, '');
    
    const detailsStr = `Comprador: ${sale.nombre} ${sale.redSocial ? `(${sale.redSocial})` : ''}
Producto: ${sale.producto}
Precio: $${sale.precio || 0}
Estado de Pago: ${sale.estadoPago}${sale.estadoPago === 'Abonado' && sale.cantidadAbono ? ` (Abonó $${sale.cantidadAbono}, resta $${parseInt(sale.precio) - parseInt(sale.cantidadAbono)})` : ''}
Detalles: ${sale.descripcion || 'Ninguno'}`;
    
    const details = encodeURIComponent(detailsStr);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}`;
  };

  // Sort sales by date ascending
  const sortedSales = [...sales].sort((a, b) => {
    if (!a.fecha && !b.fecha) return 0;
    if (!a.fecha) return 1;
    if (!b.fecha) return -1;
    return new Date(a.fecha) - new Date(b.fecha);
  });

  if (sales.length === 0) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>No hay ventas agendadas aún.</div>;
  }

  return (
    <div>
      {sortedSales.map(sale => {
        let statusClass = 'status-pendiente';
        if (sale.estadoPago === 'Pagado') statusClass = 'status-pagado';

        return (
          <DraggableSaleItem key={sale.id} sale={sale}>
            <div className="sale-item" style={{ cursor: 'grab' }}>
            <div className="sale-item-header">
              {editingDateId === sale.id ? (
                <input
                  type="date"
                  value={editDateVal}
                  onChange={(e) => {
                    onUpdateSale(sale.id, { fecha: e.target.value || '' });
                    setEditingDateId(null);
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong
                    onDoubleClick={(e) => { e.stopPropagation(); setEditingDateId(sale.id); setEditDateVal(sale.fecha || ''); }}
                    style={{ cursor: 'pointer', borderBottom: '1px dashed var(--window-border)' }}
                    title="Doble click para editar fecha de entrega"
                  >
                    {sale.fecha ? new Date(sale.fecha + 'T12:00:00').toLocaleDateString('es-ES') : 'Sin fecha aún'}
                  </strong>
                  {sale.fecha && (
                    <a
                      href={getGoogleCalendarUrl(sale)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onPointerDown={(e) => e.stopPropagation()}
                      style={{ textDecoration: 'none', display: 'inline-flex' }}
                      title="Agendar en Google Calendar"
                    >
                      🗓️
                    </a>
                  )}
                </div>
              )}
              <span className={statusClass} onPointerDown={(e) => e.stopPropagation()} onClick={() => onTogglePayment(sale.id)} style={{ cursor: 'pointer' }}>
                {sale.estadoPago} {sale.estadoPago === 'Abonado' && sale.cantidadAbono ? `($${sale.cantidadAbono})` : ''}
              </span>
            </div>
            <div>
              <strong>Comprador:</strong>{' '}
              {renderField(sale, 'nombre', 'nombre', sale.nombre)} 
              {' '}({renderField(sale, 'redSocial', 'red social', sale.redSocial || 'Sin red')})
            </div>
            <div>
              <strong>Producto:</strong>{' '}
              {renderField(sale, 'producto', 'producto', sale.producto)}
              {' '} - $
              {renderField(sale, 'precio', 'precio', sale.precio)}
            </div>
            {sale.fechaCreacion && (
              <div style={{ fontSize: '0.85em', color: '#888', marginTop: '2px' }}>
                <strong>Creado:</strong> {new Date(sale.fechaCreacion + 'T12:00:00').toLocaleDateString('es-ES')}
              </div>
            )}
            {sale.estadoPago === 'Abonado' && (
              <div style={{ color: '#ff1493', fontSize: '0.9em', marginTop: '2px' }}>
                <em>Resta pagar: ${parseInt(sale.precio || 0) - parseInt(sale.cantidadAbono || 0)} 
                {' '}(Abonó: ${renderField(sale, 'cantidadAbono', 'abono', sale.cantidadAbono)})</em>
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
                  <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end', marginTop: '3px' }} onPointerDown={(e) => e.stopPropagation()}>
                    <button onClick={() => { onUpdateSale(sale.id, { descripcion: editVal }); setEditingId(null); }} style={{ fontSize: '10px', padding: '2px 6px' }}>Guardar</button>
                    <button onClick={() => setEditingId(null)} style={{ fontSize: '10px', padding: '2px 6px' }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <span
                  onDoubleClick={(e) => { e.stopPropagation(); setEditingId(sale.id); setEditVal(sale.descripcion || ''); }}
                  style={{ cursor: 'pointer', color: sale.descripcion ? 'inherit' : '#888', fontStyle: sale.descripcion ? 'normal' : 'italic' }}
                >
                  {sale.descripcion || 'Doble click aquí para agregar lugar, hora, etc... ✎'}
                </span>
              )}
            </div>

            <div style={{ marginTop: '5px', textAlign: 'right' }}>
              <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onRemove(sale.id)} style={{ padding: '2px 5px', fontSize: '10px' }}>Borrar</button>
            </div>
          </div>
          </DraggableSaleItem>
        );
      })}
    </div>
  );
}
