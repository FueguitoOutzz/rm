import { useState, useEffect } from 'react';

export function useSales() {
  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('chiikawa_sales');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('chiikawa_sales', JSON.stringify(sales));
  }, [sales]);

  const addSale = (sale) => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
    setSales(prev => [...prev, { ...sale, id: Date.now(), fechaCreacion: sale.fechaCreacion || localToday }]);
  };

  const removeSale = (id) => {
    setSales(prev => prev.filter(s => s.id !== id));
  };

  const togglePaymentStatus = (id) => {
    setSales(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, estadoPago: s.estadoPago === 'Pagado' ? 'Pendiente' : 'Pagado' };
      }
      return s;
    }));
  };

  const updateSale = (id, updatedFields) => {
    setSales(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, ...updatedFields };
      }
      return s;
    }));
  };

  const importSales = (newSales) => {
    if (Array.isArray(newSales)) {
      setSales(newSales);
    }
  };

  return { sales, addSale, removeSale, togglePaymentStatus, updateSale, importSales };
}
