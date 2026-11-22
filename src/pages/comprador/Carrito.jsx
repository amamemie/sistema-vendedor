import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './comprador.css';
import {
  cargarCarrito,
  guardarCarrito,
  actualizarCantidad,
  eliminarDelCarrito,
  vaciarCarrito,
  calcularTotalCarrito,
  calcularCantidadItems,
  formatearPrecio
} from './comprador.utils';

export default function Carrito({ onCheckout, onBack }) {
  const { user } = useAuth();
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [codigoDescuento, setCodigoDescuento] = useState('');
  const [descuentoAplicado, setDescuentoAplicado] = useState(null);
  const [mensajeDescuento, setMensajeDescuento] = useState('');

  useEffect(() => {
    const carritoGuardado = cargarCarrito();
    setCarrito(carritoGuardado);
    setLoading(false);
  }, []);

  const handleActualizarCantidad = (idProducto, nuevaCantidad) => {
    const nuevoCarrito = actualizarCantidad(carrito, idProducto, nuevaCantidad);
    setCarrito(nuevoCarrito);
  };

  const handleEliminar = (idProducto) => {
    const nuevoCarrito = eliminarDelCarrito(carrito, idProducto);
    setCarrito(nuevoCarrito);
  };

  const handleVaciar = () => {
    if (confirm('¿Vaciar todo el carrito?')) {
      const nuevoCarrito = vaciarCarrito();
      setCarrito(nuevoCarrito);
    }
  };

  // Verificar código de descuento
  const verificarDescuento = async () => {
    if (!codigoDescuento.trim()) {
      setMensajeDescuento('⚠️ Ingresa un código de descuento');
      return;
    }

    try {
      const response = await fetch(`http://localhost/sistema-vendedor/backend/validar_descuento.php?codigo=${codigoDescuento}&id_usuario=${user?.id}`);
      const data = await response.json();
      
      if (data.success) {
        setDescuentoAplicado(data.descuento);
        setMensajeDescuento(`✅ ¡Código válido! ${data.descuento}% de descuento aplicado`);
      } else {
        setDescuentoAplicado(null);
        setMensajeDescuento(`❌ ${data.message}`);
      }
    } catch (error) {
      setMensajeDescuento('❌ Error al validar código');
    }
  };

  const total = calcularTotalCarrito(carrito);
  const cantidad = calcularCantidadItems(carrito);
  
  // Calcular total con descuento
  const totalConDescuento = descuentoAplicado 
    ? total - (total * descuentoAplicado / 100)
    : total;
  
  const ahorro = total - totalConDescuento;

  if (loading) {
    return (
      <div className="carrito-container">
        <div className="carrito-content">
          <p>Cargando carrito...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="carrito-container">
      <div className="carrito-content">
        <button onClick={onBack} className="carrito-btn-volver">
          <span>←</span> Volver a la tienda
        </button>

        <h1 className="carrito-title">🛒 Mi carrito ({cantidad} items)</h1>

        {carrito.length === 0 ? (
          <div className="carrito-empty">
            <span style={{ fontSize: 48 }}>🛒</span>
            <p>Tu carrito está vacío</p>
            <button onClick={onBack} className="btn-primary" style={{ marginTop: 16 }}>
              Comenzar a comprar
            </button>
          </div>
        ) : (
          <div className="carrito-layout">
            {/* Lista de productos */}
            <div className="carrito-productos">
              {carrito.map(item => (
                <div key={item.id_producto} className="carrito-item">
                  <div className="carrito-item-imagen">
                    {item.imagen_principal ? (
                      <img 
                        src={`http://localhost/sistema-vendedor/backend/${item.imagen_principal}`} 
                        alt={item.nombre} 
                      />
                    ) : (
                      <span>📦</span>
                    )}
                  </div>
                  <div className="carrito-item-info">
                    <div className="carrito-item-nombre">{item.nombre}</div>
                    <div className="carrito-item-tienda">{item.nombre_tienda || 'Tienda oficial'}</div>
                    <div className="carrito-item-precio">{formatearPrecio(item.precio_unitario)}</div>
                  </div>
                  <div className="carrito-item-controles">
                    <button 
                      className="carrito-item-btn"
                      onClick={() => handleActualizarCantidad(item.id_producto, item.cantidad - 1)}
                    >
                      -
                    </button>
                    <span className="carrito-item-cantidad">{item.cantidad}</span>
                    <button 
                      className="carrito-item-btn"
                      onClick={() => handleActualizarCantidad(item.id_producto, item.cantidad + 1)}
                    >
                      +
                    </button>
                    <button 
                      className="carrito-item-eliminar"
                      onClick={() => handleEliminar(item.id_producto)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen del pedido */}
            <div className="carrito-resumen">
              <h3 className="carrito-resumen-title">Resumen del pedido</h3>
              
              {/* Código de descuento */}
              <div className="carrito-descuento-section">
                <div className="descuento-input-group">
                  <input
                    type="text"
                    className="descuento-input"
                    placeholder="🎁 Código de descuento"
                    value={codigoDescuento}
                    onChange={(e) => setCodigoDescuento(e.target.value.toUpperCase())}
                  />
                  <button 
                    className="descuento-btn"
                    onClick={verificarDescuento}
                    disabled={!codigoDescuento.trim()}
                  >
                    Aplicar
                  </button>
                </div>
                {mensajeDescuento && (
                  <div className={`descuento-mensaje ${descuentoAplicado ? 'success' : 'error'}`}>
                    {mensajeDescuento}
                  </div>
                )}
              </div>

              <div className="carrito-resumen-linea">
                <span>Subtotal ({cantidad} items)</span>
                <span>{formatearPrecio(total)}</span>
              </div>
              
              {descuentoAplicado && (
                <div className="carrito-resumen-descuento">
                  <span>Descuento ({descuentoAplicado}%)</span>
                  <span className="descuento-valor">-{formatearPrecio(ahorro)}</span>
                </div>
              )}
              
              <div className="carrito-resumen-linea">
                <span>Envío</span>
                <span>Gratis</span>
              </div>
              
              <div className="carrito-resumen-total">
                <span>Total</span>
                <span>{formatearPrecio(totalConDescuento)}</span>
              </div>
              
              {descuentoAplicado && (
                <div className="carrito-ahorro">
                  💰 Ahorraste {formatearPrecio(ahorro)}
                </div>
              )}
              
              <button
                className="carrito-btn-pagar"
                onClick={() => onCheckout(carrito, totalConDescuento, descuentoAplicado, codigoDescuento)}
              >
                Proceder al pago
              </button>
              <button 
                className="carrito-btn-vaciar"
                onClick={handleVaciar}
              >
                Vaciar carrito
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}