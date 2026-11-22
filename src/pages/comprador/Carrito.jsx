import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import Prefs from '../../components/ui/Prefs';
import './comprador.css';
import {
  cargarCarrito,
  actualizarCantidad,
  eliminarDelCarrito,
  vaciarCarrito,
  calcularTotalCarrito,
  calcularCantidadItems,
  formatearPrecio
} from './comprador.utils';

export default function Carrito({ onCheckout, onBack }) {
  const { t } = useTranslation();
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
    if (confirm(t('cart.confirmClear'))) {
      const nuevoCarrito = vaciarCarrito();
      setCarrito(nuevoCarrito);
    }
  };

  // Verificar código de descuento
  const verificarDescuento = async () => {
    if (!codigoDescuento.trim()) {
      setMensajeDescuento(t('cartPage.enterCode'));
      return;
    }

    try {
      const response = await fetch(`http://localhost/sistema-vendedor/backend/validar_descuento.php?codigo=${codigoDescuento}&id_usuario=${user?.id}`);
      const data = await response.json();
      
      if (data.success) {
        setDescuentoAplicado(data.descuento);
        setMensajeDescuento(t('cartPage.codeOk', { pct: data.descuento }));
      } else {
        setDescuentoAplicado(null);
        setMensajeDescuento(data.message);
      }
    } catch {
      setMensajeDescuento(t('cartPage.codeError'));
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
          <div className="skeleton" style={{ height: 320, borderRadius: 16 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="carrito-container page-enter">
      <div className="carrito-content">
        <div className="detail-top">
          <button onClick={onBack} className="btn btn-ghost btn-sm">
            <i className="ti ti-arrow-left" aria-hidden="true" /> {t('auth.backToStore')}
          </button>
          <Prefs compact />
        </div>

        <h1 className="carrito-title">{t('cart.title')} <span>· {t('cart.items', { count: cantidad })}</span></h1>

        {carrito.length === 0 ? (
          <div className="carrito-empty">
            <span className="empty-icon"><i className="ti ti-shopping-cart" aria-hidden="true" /></span>
            <p>{t('cart.empty')}</p>
            <button onClick={onBack} className="btn btn-ink" style={{ marginTop: 16 }}>
              {t('cartPage.startShopping')}
            </button>
          </div>
        ) : (
          <div className="carrito-layout">
            {/* Lista de productos */}
            <div className="carrito-productos stagger">
              {carrito.map((item, i) => (
                <div key={item.id_producto} className="carrito-item" style={{ '--i': i }}>
                  <div className="carrito-item-imagen">
                    {item.imagen_principal ? (
                      <img 
                        src={`http://localhost/sistema-vendedor/backend/${item.imagen_principal}`} 
                        alt={item.nombre} 
                      />
                    ) : (
                      <i className="ti ti-photo" aria-hidden="true" />
                    )}
                  </div>
                  <div className="carrito-item-info">
                    <div className="carrito-item-nombre">{item.nombre}</div>
                    <div className="carrito-item-tienda">{item.nombre_tienda || t('detail.officialStore')}</div>
                    <div className="carrito-item-precio">{formatearPrecio(item.precio_unitario)}</div>
                  </div>
                  <div className="carrito-item-controles">
                    <button 
                      className="carrito-item-btn"
                      onClick={() => handleActualizarCantidad(item.id_producto, item.cantidad - 1)}
                      aria-label={t('cart.less')}
                    >
                      <i className="ti ti-minus" aria-hidden="true" />
                    </button>
                    <span className="carrito-item-cantidad">{item.cantidad}</span>
                    <button 
                      className="carrito-item-btn"
                      onClick={() => handleActualizarCantidad(item.id_producto, item.cantidad + 1)}
                      aria-label={t('cart.more')}
                    >
                      <i className="ti ti-plus" aria-hidden="true" />
                    </button>
                    <button 
                      className="carrito-item-eliminar"
                      onClick={() => handleEliminar(item.id_producto)}
                      aria-label={t('cart.remove')}
                    >
                      <i className="ti ti-trash" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen del pedido */}
            <div className="carrito-resumen">
              <h3 className="carrito-resumen-title">{t('cartPage.summary')}</h3>
              
              {/* Código de descuento */}
              <div className="carrito-descuento-section">
                <div className="descuento-input-group">
                  <input
                    type="text"
                    className="descuento-input"
                    placeholder={t('cartPage.code')}
                    aria-label={t('cartPage.code')}
                    value={codigoDescuento}
                    onChange={(e) => setCodigoDescuento(e.target.value.toUpperCase())}
                  />
                  <button 
                    className="descuento-btn"
                    onClick={verificarDescuento}
                    disabled={!codigoDescuento.trim()}
                  >
                    {t('cartPage.apply')}
                  </button>
                </div>
                {mensajeDescuento && (
                  <div className={`descuento-mensaje ${descuentoAplicado ? 'success' : 'error'}`}>
                    {mensajeDescuento}
                  </div>
                )}
              </div>

              <div className="carrito-resumen-linea">
                <span>{t('cartPage.subtotal', { count: cantidad })}</span>
                <span>{formatearPrecio(total)}</span>
              </div>
              
              {descuentoAplicado && (
                <div className="carrito-resumen-descuento">
                  <span>{t('cartPage.discount', { pct: descuentoAplicado })}</span>
                  <span className="descuento-valor">-{formatearPrecio(ahorro)}</span>
                </div>
              )}
              
              <div className="carrito-resumen-linea">
                <span>{t('cartPage.shipping')}</span>
                <span>{t('cartPage.free')}</span>
              </div>
              
              <div className="carrito-resumen-total">
                <span>{t('common.total')}</span>
                <span>{formatearPrecio(totalConDescuento)}</span>
              </div>
              
              {descuentoAplicado && (
                <div className="carrito-ahorro">
                  <i className="ti ti-pig-money" aria-hidden="true" /> {t('cartPage.saved', { amount: formatearPrecio(ahorro) })}
                </div>
              )}
              
              <button
                className="carrito-btn-pagar"
                onClick={() => onCheckout(carrito, totalConDescuento, descuentoAplicado, codigoDescuento)}
              >
                {t('cartPage.pay')} <i className="ti ti-arrow-right" aria-hidden="true" />
              </button>
              <button 
                className="carrito-btn-vaciar"
                onClick={handleVaciar}
              >
                {t('cartPage.clear')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}