// src/pages/comprador/MisDescuentos.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './comprador.css';

export default function MisDescuentos() {
  const { user } = useAuth();
  const [descuentos, setDescuentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDescuentos();
  }, []);

  const cargarDescuentos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost/sistema-vendedor/backend/mis_descuentos.php?id_usuario=${user?.id}`);
      const data = await response.json();
      if (data.success) {
        setDescuentos(data.descuentos || []);
      }
    } catch (error) {
      console.error('Error cargando descuentos:', error);
    }
    setLoading(false);
  };

  const formatearFecha = (fecha) => {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generarCodigo = (descuento) => {
    return `DESC-${descuento}-${Math.floor(Math.random() * 10000)}`;
  };

  if (loading) {
    return (
      <div className="mis-descuentos-container">
        <div className="loading-spinner">Cargando tus descuentos...</div>
      </div>
    );
  }

  return (
    <div className="mis-descuentos-container">
      <div className="descuentos-header">
        <h2>🎁 Mis Descuentos</h2>
        <p className="descuentos-subtitle">Descuentos especiales que los vendedores te han otorgado</p>
      </div>

      {descuentos.length === 0 ? (
        <div className="empty-descuentos">
          <div className="empty-icon">🎫</div>
          <h3>No tienes descuentos aún</h3>
          <p>¡Sigue comprando para obtener descuentos especiales de tus vendedores favoritos!</p>
        </div>
      ) : (
        <div className="descuentos-grid">
          {descuentos.map((d, idx) => (
            <div key={idx} className="descuento-card">
              <div className="descuento-badge">
                <span className="descuento-porcentaje">{d.descuento}%</span>
                <span className="descuento-off">OFF</span>
              </div>
              
              <div className="descuento-body">
                <div className="descuento-motivo">
                  <span className="motivo-icon">🎯</span>
                  <span className="motivo-text">{d.motivo || 'Descuento especial'}</span>
                </div>
                <div className="descuento-fecha">
                  <span className="fecha-icon">📅</span>
                  <span className="fecha-text">{formatearFecha(d.fecha)}</span>
                </div>
                <div className="descuento-codigo">
                  <span className="codigo-label">Código:</span>
                  <code className="codigo-value">{generarCodigo(d.descuento)}</code>
                  <button 
                    className="copiar-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(generarCodigo(d.descuento));
                      alert('✅ Código copiado');
                    }}
                  >
                    📋
                  </button>
                </div>
              </div>
              
              <div className="descuento-footer">
                <span className="descuento-estado activo">✓ Activo</span>
                <span className="descuento-uso">Válido para próxima compra</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="descuentos-info">
        <p>💡 <strong>¿Cómo usar tu descuento?</strong></p>
        <p>Al finalizar tu compra, ingresa el código en el campo "Código de descuento" para aplicar el beneficio.</p>
      </div>
    </div>
  );
}