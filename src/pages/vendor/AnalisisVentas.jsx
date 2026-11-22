import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './vendor.css';
import { useTranslation } from 'react-i18next';
import { toast } from '../../components/ui/toast';
import { formatMoney } from '../../i18n/format';

const BASE_URL = 'http://localhost/sistema-vendedor/backend';

export default function AnalisisVentas() {
  const { t } = useTranslation();
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

  const formatearPrecio = (precio) => formatMoney(precio || 0);

  const aplicarDescuento = async () => {
  if (!descuentoValor || descuentoValor <= 0 || descuentoValor > 100) {
    toast(t('vendor.analytics.discountRange'), 'error');
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
      toast(data.message || t('vendor.analytics.discountApplied'));
      setDescuentoModal(null);
      setDescuentoValor('');
      setDescuentoMotivo('');
    } else {
      toast(data.message, 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    toast(t('errors.connection'), 'error');
  }
};

  const verProducto = (producto) => {
    setProductoModal(producto);
  };

  if (loading) {
    return (
      <div className="vendor-content">
        <div className="skeleton" style={{ height: 420, borderRadius: 16 }} />
      </div>
    );
  }

  return (
    <div className="vendor-content">
      <div className="analisis-container">

        {/* Resumen por estado */}
        <div className="analisis-section">
          <h2 className="section-title">
            <i className="ti ti-list-check section-icon" aria-hidden="true" /> {t('vendor.analytics.byStatus')}
          </h2>
          <div className="estados-grid stagger">
            {datos.resumen_estados.map(estado => {
              let estadoClass;
              let estadoIcon;
              switch (estado.estado) {
                case 'Pagada': estadoClass = 'estado-pagada-card'; estadoIcon = 'ti-circle-check'; break;
                case 'Enviado': estadoClass = 'estado-enviado-card'; estadoIcon = 'ti-truck-delivery'; break;
                case 'Entregado': estadoClass = 'estado-entregado-card'; estadoIcon = 'ti-home-check'; break;
                case 'Cancelado': estadoClass = 'estado-cancelado-card'; estadoIcon = 'ti-circle-x'; break;
                default: estadoClass = 'estado-pendiente-card'; estadoIcon = 'ti-clock';
              }
              return (
                <div key={estado.estado} className={`estado-card ${estadoClass}`}>
                  <div className="estado-icon"><i className={`ti ${estadoIcon}`} aria-hidden="true" /></div>
                  <div className="estado-nombre">{t(`orderStatus.${estado.estado || 'Pendiente'}`)}</div>
                  <div className="estado-cantidad">{t('vendor.orders.count', { count: Number(estado.cantidad) })}</div>
                  <div className="estado-total">{formatearPrecio(estado.total_ventas)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Productos más vendidos */}
        <div className="analisis-section">
          <h2 className="section-title">
            <i className="ti ti-trophy section-icon" aria-hidden="true" /> {t('vendor.analytics.topProducts')}
          </h2>
          <div className="analisis-table-container">
            <table className="analisis-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t('vendor.products.product')}</th>
                  <th>{t('vendor.analytics.quantity')}</th>
                  <th>{t('vendor.analytics.earned')}</th>
                  <th>{t('vendor.analytics.timesBought')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {datos.productos_mas_vendidos.length === 0 ? (
                  <tr><td colSpan="6" className="analisis-empty">{t('vendor.analytics.noSales')}</td></tr>
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
                      <td className="cantidad">{t('vendor.dash.units', { count: Number(p.total_vendido) })}</td>
                      <td className="total">{formatearPrecio(p.total_ganado)}</td>
                      <td className="veces">{t('vendor.analytics.times', { count: Number(p.veces_comprado) })}</td>
                      <td>
                        <button className="btn-ver-producto" onClick={() => verProducto(p)}>
                          <i className="ti ti-eye" aria-hidden="true" /> {t('common.view')}
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
            <i className="ti ti-users section-icon" aria-hidden="true" /> {t('vendor.analytics.topCustomers')}
          </h2>
          <div className="analisis-table-container">
            <table className="analisis-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t('vendor.orders.customer')}</th>
                  <th>{t('vendor.analytics.contact')}</th>
                  <th>{t('vendor.nav.orders')}</th>
                  <th>{t('vendor.analytics.spent')}</th>
                  <th>{t('vendor.reports.avgTicket')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {datos.clientes_frecuentes.length === 0 ? (
                  <tr><td colSpan="7" className="analisis-empty">{t('vendor.analytics.noCustomers')}</td></tr>
                ) : (
                  datos.clientes_frecuentes.map((c, idx) => (
                    <tr key={c.id_comprador}>
                      <td className="rank">{idx + 1}</td>
                      <td className="cliente-nombre">{c.nombres} {c.apellidos}</td>
                      <td className="cliente-contacto">
                        <div>{c.email}</div>
                        <div className="cliente-telefono">{c.telefono || t('vendor.analytics.noPhone')}</div>
                      </td>
                      <td className="pedidos">{c.total_pedidos}</td>
                      <td className="gastado">{formatearPrecio(c.total_gastado)}</td>
                      <td className="promedio">{formatearPrecio(c.ticket_promedio)}</td>
                      <td>
                        <button className="btn-descuento" onClick={() => setDescuentoModal(c.id_comprador)}>
                          <i className="ti ti-discount" aria-hidden="true" /> {t('vendor.analytics.discount')}
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
            <i className="ti ti-alert-triangle section-icon" aria-hidden="true" /> {t('vendor.analytics.topCancelled')}
          </h2>
          <div className="analisis-table-container">
            <table className="analisis-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t('vendor.products.product')}</th>
                  <th>{t('vendor.analytics.timesCancelled')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {datos.productos_mas_cancelados.length === 0 ? (
                  <tr><td colSpan="4" className="analisis-empty">{t('vendor.analytics.noCancelled')}</td></tr>
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
                      <td className="cancelado">{t('vendor.analytics.times', { count: Number(p.veces_cancelado) })}</td>
                      <td>
                        <button className="btn-ver-producto" onClick={() => verProducto(p)}>
                          <i className="ti ti-eye" aria-hidden="true" /> {t('common.view')}
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
              <h3>{productoModal.nombre}</h3>
              <button className="modal-close" onClick={() => setProductoModal(null)} aria-label={t('common.close')}><i className="ti ti-x" aria-hidden="true" /></button>
            </div>
            <div className="modal-body">
              {productoModal.imagen_principal && (
                <div className="producto-modal-imagen">
                  <img src={`${BASE_URL}/${productoModal.imagen_principal}`} alt={productoModal.nombre} />
                </div>
              )}
              <div className="producto-modal-info">
                <p><strong>{t('vendor.products.price')}:</strong> {formatearPrecio(productoModal.precio_unitario)}</p>
                <p><strong>{t('vendor.analytics.quantity')}:</strong> {t('vendor.dash.units', { count: Number(productoModal.total_vendido || 0) })}</p>
                <p><strong>{t('vendor.analytics.earned')}:</strong> {formatearPrecio(productoModal.total_ganado || 0)}</p>
                <p><strong>{t('vendor.analytics.timesBought')}:</strong> {t('vendor.analytics.times', { count: Number(productoModal.veces_comprado || 0) })}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setProductoModal(null)}>{t('common.close')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para aplicar descuento */}
      {descuentoModal && (
        <div className="modal-overlay" onClick={() => setDescuentoModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('vendor.analytics.discountTitle')}</h3>
              <button className="modal-close" onClick={() => setDescuentoModal(null)} aria-label={t('common.close')}><i className="ti ti-x" aria-hidden="true" /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">{t('vendor.analytics.discountPct')}</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={descuentoValor}
                  onChange={(e) => setDescuentoValor(e.target.value)}
                  placeholder={t('vendor.analytics.discountPctPh')}
                  min="1"
                  max="100"
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('vendor.analytics.discountReason')}</label>
                <textarea 
                  className="form-textarea"
                  rows="3"
                  value={descuentoMotivo}
                  onChange={(e) => setDescuentoMotivo(e.target.value)}
                  placeholder={t('vendor.analytics.discountReasonPh')}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDescuentoModal(null)}>{t('common.cancel')}</button>
              <button className="btn btn-primary" onClick={aplicarDescuento}>
                {t('vendor.analytics.applyDiscount')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}