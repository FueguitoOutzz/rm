import React, { useState } from 'react';
import DraggableWindow from './DraggableWindow';

export default function SalesForm({ onClose, onFocus, zIndex, initialPosition, onAddSale }) {
  const [formData, setFormData] = useState({
    nombre: '',
    producto: '',
    estadoPago: 'Pendiente',
    precio: '',
    cantidadAbono: '',
    redSocial: '',
    fecha: '',
    descripcion: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.producto || !formData.fecha) {
      alert('Por favor llena los campos obligatorios (Nombre, Producto, Fecha)');
      return;
    }
    onAddSale(formData);
    setFormData({
      nombre: '',
      producto: '',
      estadoPago: 'Pendiente',
      precio: '',
      cantidadAbono: '',
      redSocial: '',
      fecha: '',
      descripcion: ''
    });
  };

  return (
    <DraggableWindow 
      title="📝ventini.exe" 
      onClose={onClose} 
      onFocus={onFocus} 
      zIndex={zIndex} 
      initialPosition={initialPosition} 
      width="300px" 
      maxHeight="500px"
    >
      <div className="window-content" style={{ padding: '15px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Comprador:</label>
            <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre de la persona" />
          </div>
          <div className="form-group">
            <label>Producto:</label>
            <input name="producto" value={formData.producto} onChange={handleChange} placeholder="Ej: Peluche Chiikawa" />
          </div>
          <div className="form-group">
            <label>Precio del Producto ($):</label>
            <input type="number" name="precio" value={formData.precio} onChange={handleChange} placeholder="Ej: 15000" />
          </div>
          <div className="form-group">
            <label>Red Social / Contacto:</label>
            <input name="redSocial" value={formData.redSocial} onChange={handleChange} placeholder="@usuario o número" />
          </div>
          <div className="form-group">
            <label>Fecha de Entrega:</label>
            <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Estado de Pago:</label>
            <select name="estadoPago" value={formData.estadoPago} onChange={handleChange}>
              <option value="Pendiente">Pendiente</option>
              <option value="Abonado">Abonado</option>
              <option value="Pagado">Pagado</option>
            </select>
          </div>
          {formData.estadoPago === 'Abonado' && (
            <div className="form-group">
              <label>Cantidad Abonada ($):</label>
              <input 
                type="number" 
                name="cantidadAbono" 
                value={formData.cantidadAbono} 
                onChange={handleChange} 
                placeholder="Ej: 5000" 
              />
            </div>
          )}
          <div className="form-group">
            <label>Descripción / Detalles:</label>
            <textarea 
              name="descripcion" 
              value={formData.descripcion} 
              onChange={handleChange} 
              placeholder="Ej. Lugar de encuentro, hora, detalles del producto..."
              style={{
                fontFamily: 'var(--font-pixel)',
                padding: '6px',
                border: '2px solid var(--window-border)',
                background: '#fff',
                fontSize: '14px',
                resize: 'vertical',
                minHeight: '60px'
              }}
            />
          </div>
          <button type="submit" className="btn-primary">Añadir Venta ♡</button>
        </form>
      </div>
    </DraggableWindow>
  );
}
