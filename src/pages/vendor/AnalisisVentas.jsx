import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './vendor.css';

const BASE_URL = 'http://localhost/sistema-vendedor/backend';

export default function AnalisisVentas() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [datos, setDatos] = useState({
    productos_mas_vendidos: [],
    clientes_frecuentes: [],
    resumen_estados: [],
    productos_mas_cancelados: []
  });
  const [descuentoModal, setDescuentoModal] = useState(null);
  const [descuentoValor, setDescuentoValor] = useState('');
  const [descuentoMotivo, setDescuentoMotivo] = useState('');
  const [productoModal, setProductoModal] = useState(null);

  useEffect(() => {
    cargarAnalisis();
  }, []);

  const cargarAnalisis = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/analisis_ventas_vendedor.php?id_vendedor=${user.id_vendedor}`);
      const data = await response.json();
      setDatos(data);
    } catch (error) {
      console.error('Error cargando análisis:', error);
    }
    setLoading(false);
  };

  const formatearPrecio = (precio) => {
    return `Bs. ${parseFloat(precio || 0).toFixed(2)}`;
  };

  const aplicarDescuento = async () => {
  if (!descuentoValor || descuentoValor <= 0 || descuentoValor > 100) {
    alert('⚠️ El descuento debe ser entre 1 y 100');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/aplicar_descuento.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_cliente: descuentoModal,
        descuento: descuentoValor,
        motivo: descuentoMotivo
      })
    });
    const data = await response.json();
    
    if (data.success) {
      alert(data.message);
      setDescuentoModal(null);
      setDescuentoValor('');
      setDescuentoMotivo('');
    } else {
      alert('❌ ' + data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error de conexión');
  }
};

  const verProducto = (producto) => {
    setProductoModal(producto);
  };

  if (loading) {
    return (
      <div className="vendor-content">
        <div className="analisis-loading">📊 Cargando análisis de ventas...</div>
      </div>
    );
  }

  return (
    <div className="vendor-content">
      <div className="analisis-container">
        <div className="analisis-header">
          <h1 className="analisis-title">📊 Análisis de Ventas</h1>
          <p className="analisis-subtitle">Visualiza el rendimiento de tu negocio</p>
        </div>

        {/* Resumen por estado */}
        <div className="analisis-section">
          <h2 className="section-title">
            <span className="section-icon">📋</span> Resumen por estado
          </h2>
          <div className="estados-grid">
            {datos.resumen_estados.map(estado => {
              let estadoClass = '';
              let estadoIcon = '';
              switch (estado.estado) {
                case 'Pagada': estadoClass = 'estado-pagada-card'; estadoIcon = '✅'; break;
                case 'Enviado': estadoClass = 'estado-enviado-card'; estadoIcon = '📦'; break;
                case 'Entregado': estadoClass = 'estado-entregado-card'; estadoIcon = '🏠'; break;
                case 'Cancelado': estadoClass = 'estado-cancelado-card'; estadoIcon = '❌'; break;
                default: estadoClass = 'estado-pendiente-card'; estadoIcon = '⏳';
              }
              return (
                <div key={estado.estado} className={`estado-card ${estadoClass}`}>
                  <div className="estado-icon">{estadoIcon}</div>
                  <div className="estado-nombre">{estado.estado || 'Pendiente'}</div>
                  <div className="estado-cantidad">{estado.cantidad} pedidos</div>
                  <div className="estado-total">{formatearPrecio(estado.total_ventas)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Productos más vendidos */}
        <div className="analisis-section">
          <h2 className="section-title">
            <span className="section-icon">🏆</span> Productos más vendidos
          </h2>
          <div className="analisis-table-container">
            <table className="analisis-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Total ganado</th>
                  <th>Veces comprado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {datos.productos_mas_vendidos.length === 0 ? (
                  <tr><td colSpan="6" className="analisis-empty">No hay datos de ventas aún</td></tr>
                ) : (
                  datos.productos_mas_vendidos.map((p, idx) => (
                    <tr key={p.id_producto}>
                      <td className="rank">{idx + 1}</td>
                      <td className="producto-cell">
                        <div className="producto-info">
                          {p.imagen_principal && (
                            <img 
                              src={`${BASE_URL}/${p.imagen_principal}`} 
                              alt={p.nombre} 
                              className="producto-mini-img"
                            />
                          )}
                          <span className="producto-nombre">{p.nombre}</span>
                        </div>
                      </td>
                      <td className="cantidad">{p.total_vendido} uds</td>
                      <td className="total">{formatearPrecio(p.total_ganado)}</td>
                      <td className="veces">{p.veces_comprado} veces</td>
                      <td>
                        <button className="btn-ver-producto" onClick={() => verProducto(p)}>
                          👁️ Ver
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clientes frecuentes */}
        <div className="analisis-section">
          <h2 className="section-title">
            <span className="section-icon">👥</span> Clientes que más compran
          </h2>
          <div className="analisis-table-container">
            <table className="analisis-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Contacto</th>
                  <th>Pedidos</th>
                  <th>Total gastado</th>
                  <th>Ticket promedio</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {datos.clientes_frecuentes.length === 0 ? (
                  <tr><td colSpan="7" className="analisis-empty">No hay clientes registrados</td></tr>
                ) : (
                  datos.clientes_frecuentes.map((c, idx) => (
                    <tr key={c.id_comprador}>
                      <td className="rank">{idx + 1}</td>
                      <td className="cliente-nombre">{c.nombres} {c.apellidos}</td>
                      <td className="cliente-contacto">
                        <div>{c.email}</div>
                        <div className="cliente-telefono">{c.telefono || 'Sin teléfono'}</div>
                      </td>
                      <td className="pedidos">{c.total_pedidos}</td>
                      <td className="gastado">{formatearPrecio(c.total_gastado)}</td>
                      <td className="promedio">{formatearPrecio(c.ticket_promedio)}</td>
                      <td>
                        <button className="btn-descuento" onClick={() => setDescuentoModal(c.id_comprador)}>
                          🎁 Descuento
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Productos más cancelados */}
        <div className="analisis-section">
          <h2 className="section-title">
            <span className="section-icon">⚠️</span> Productos más cancelados
          </h2>
          <div className="analisis-table-container">
            <table className="analisis-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Veces cancelado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {datos.productos_mas_cancelados.length === 0 ? (
                  <tr><td colSpan="4" className="analisis-empty">No hay productos cancelados</td></tr>
                ) : (
                  datos.productos_mas_cancelados.map((p, idx) => (
                    <tr key={p.id_producto}>
                      <td className="rank">{idx + 1}</td>
                      <td className="producto-cell">
                        <div className="producto-info">
                          {p.imagen_principal && (
                            <img 
                              src={`${BASE_URL}/${p.imagen_principal}`} 
                              alt={p.nombre} 
                              className="producto-mini-img"
                            />
                          )}
                          <span className="producto-nombre">{p.nombre}</span>
                        </div>
                      </td>
                      <td className="cancelado">{p.veces_cancelado} veces</td>
                      <td>
                        <button className="btn-ver-producto" onClick={() => verProducto(p)}>
                          👁️ Ver
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal para ver producto */}
      {productoModal && (
        <div className="modal-overlay" onClick={() => setProductoModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📦 {productoModal.nombre}</h3>
              <button className="modal-close" onClick={() => setProductoModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {productoModal.imagen_principal && (
                <div className="producto-modal-imagen">
                  <img src={`${BASE_URL}/${productoModal.imagen_principal}`} alt={productoModal.nombre} />
                </div>
              )}
              <div className="producto-modal-info">
                <p><strong>💰 Precio:</strong> {formatearPrecio(productoModal.precio_unitario)}</p>
                <p><strong>📊 Total vendido:</strong> {productoModal.total_vendido || 0} unidades</p>
                <p><strong>💵 Total ganado:</strong> {formatearPrecio(productoModal.total_ganado || 0)}</p>
                <p><strong>🔄 Veces comprado:</strong> {productoModal.veces_comprado || 0} veces</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setProductoModal(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para aplicar descuento */}
      {descuentoModal && (
        <div className="modal-overlay" onClick={() => setDescuentoModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🎁 Aplicar descuento al cliente</h3>
              <button className="modal-close" onClick={() => setDescuentoModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Porcentaje de descuento (%)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={descuentoValor}
                  onChange={(e) => setDescuentoValor(e.target.value)}
                  placeholder="Ej: 10, 15, 20"
                  min="1"
                  max="100"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Motivo del descuento</label>
                <textarea 
                  className="form-textarea"
                  rows="3"
                  value={descuentoMotivo}
                  onChange={(e) => setDescuentoMotivo(e.target.value)}
                  placeholder="Ej: Cliente frecuente, Promoción especial..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setDescuentoModal(null)}>Cancelar</button>
              <button className="btn-primary" onClick={aplicarDescuento}>
                Aplicar descuento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}