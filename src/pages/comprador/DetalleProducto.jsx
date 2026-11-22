import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { motivosReporte, reportarProducto } from './comprador.utils';
import ChatFab from '../../components/ChatFab';
import ValorarVendedor from '../../components/ValorarVendedor';
import Tilt from '../../components/ui/Tilt';
import Prefs from '../../components/ui/Prefs';
import { Stars, imgUrl } from '../../components/store/Store';
import { formatMoney } from '../../i18n/format';
import './comprador.css';

export default function DetalleProducto({ producto, onBack, onAddToCart }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [cantidad, setCantidad] = useState(1);
  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [motivoSeleccionado, setMotivoSeleccionado] = useState(null);
  const [descripcionReporte, setDescripcionReporte] = useState('');
  const [reportando, setReportando] = useState(false);
  const [mensajeReporte, setMensajeReporte] = useState(null);
  const stock = Number(producto.stock || 0);
  const src = imgUrl(producto.imagen_principal);
  const rating = Number(producto.vendedor_calificacion || 0);

  const handleReportar = async () => {
    if (!motivoSeleccionado) {
      setMensajeReporte({ ok: false, text: t('report.pickReason') });
      return;
    }
    setReportando(true);
    setMensajeReporte(null);
    try {
      const motivo = motivosReporte.find((m) => m.id === motivoSeleccionado);
      const result = await reportarProducto(producto.id_producto, motivo.value, descripcionReporte);
      if (result.success) {
        setMensajeReporte({ ok: true, text: t('report.sent') });
        setTimeout(() => {
          setMostrarReporte(false);
          setMotivoSeleccionado(null);
          setDescripcionReporte('');
          setMensajeReporte(null);
        }, 1500);
      } else {
        setMensajeReporte({ ok: false, text: result.message || t('report.error') });
      }
    } catch {
      setMensajeReporte({ ok: false, text: t('errors.connection') });
    } finally {
      setReportando(false);
    }
  };

  return (
    <div className="store-page page-enter">
      <div className="store-wrap detail">
        <div className="detail-top">
          <button type="button" onClick={onBack} className="btn btn-ghost btn-sm">
            <i className="ti ti-arrow-left" aria-hidden="true" /> {t('detail.back')}
          </button>
          <Prefs compact />
        </div>

        <div className="detail-grid">
          <Tilt className="detail-media" max={5}>
            {src ? <img src={src} alt={producto.nombre} /> : <i className="ti ti-photo" aria-hidden="true" />}
          </Tilt>

          <div className="detail-info">
            <span className="detail-store"><i className="ti ti-building-store" aria-hidden="true" /> {producto.nombre_tienda || t('detail.officialStore')}</span>
            <h1>{producto.nombre}</h1>
            <div className="detail-price">{formatMoney(producto.precio_unitario)}</div>

            <span className={`badge ${stock <= 0 ? 'badge-error' : stock <= 5 ? 'badge-warning' : 'badge-success'}`}>
              {stock <= 0 ? t('store.soldOut') : stock <= 5 ? t('detail.lastUnits', { count: stock }) : t('store.inStock', { count: stock })}
            </span>

            <section className="detail-block">
              <h2>{t('vendor.products.description')}</h2>
              <p>{producto.descripcion || t('detail.noDescription')}</p>
            </section>

            <section className="detail-block detail-seller">
              <span className="list-avatar"><i className="ti ti-rosette-discount-check" aria-hidden="true" /></span>
              <div>
                <strong>{producto.nombre_tienda || t('detail.officialStore')}</strong>
                <div className="product-meta">
                  <Stars value={rating} />
                  <span>{rating > 0 ? rating.toFixed(1) : t('store.new')} · {t('detail.reviews', { count: Number(producto.vendedor_total_resenas || 0) })}</span>
                </div>
              </div>
              <span className="badge badge-accent">{t('detail.verified')}</span>
            </section>

            {stock > 0 && (
              <div className="detail-buy">
                <div className="qty qty--lg" role="group" aria-label={t('detail.quantity')}>
                  <button type="button" onClick={() => setCantidad(Math.max(1, cantidad - 1))} aria-label={t('cart.less')}><i className="ti ti-minus" aria-hidden="true" /></button>
                  <span>{cantidad}</span>
                  <button type="button" onClick={() => setCantidad(Math.min(stock, cantidad + 1))} aria-label={t('cart.more')}><i className="ti ti-plus" aria-hidden="true" /></button>
                </div>
                <button type="button" className="btn btn-ink btn-lg" style={{ flex: 1 }} onClick={() => onAddToCart({ ...producto, cantidad })}>
                  <i className="ti ti-shopping-cart-plus" aria-hidden="true" /> {t('detail.addToCart')} · {formatMoney(producto.precio_unitario * cantidad)}
                </button>
              </div>
            )}

            <button type="button" className="btn btn-ghost btn-sm detail-report" onClick={() => setMostrarReporte(true)}>
              <i className="ti ti-flag" aria-hidden="true" /> {t('report.title')}
            </button>

            {user && user.rol === 'Comprador' && (
              <ValorarVendedor vendedorId={producto.id_vendedor} vendedorNombre={producto.nombre_tienda} productoId={producto.id_producto} />
            )}
          </div>
        </div>
      </div>

      {mostrarReporte && (
        <div className="dialog-root">
          <div className="drawer-scrim" onClick={() => setMostrarReporte(false)} />
          <div className="dialog dialog--form" role="dialog" aria-modal="true" aria-labelledby="report-title">
            <div className="dialog-form-head">
              <h3 id="report-title">{t('report.title')}</h3>
              <button type="button" className="icon-btn" onClick={() => setMostrarReporte(false)} aria-label={t('common.close')}><i className="ti ti-x" aria-hidden="true" /></button>
            </div>
            <p className="dialog-form-sub"><strong>{producto.nombre}</strong> · {producto.nombre_tienda}</p>

            {mensajeReporte && <div className={`alert ${mensajeReporte.ok ? 'alert-success' : 'alert-error'}`} role="status">{mensajeReporte.text}</div>}

            <div className="choice-list">
              {motivosReporte.map((m) => (
                <label key={m.id} className={`choice${motivoSeleccionado === m.id ? ' is-on' : ''}`}>
                  <input type="radio" name="motivo" value={m.id} checked={motivoSeleccionado === m.id} onChange={() => setMotivoSeleccionado(m.id)} />
                  <i className={`ti ${m.icon}`} aria-hidden="true" /> {m.label}
                </label>
              ))}
            </div>

            <label className="field" style={{ marginTop: 14 }}>
              <span className="field-label">{t('report.describe')}</span>
              <textarea className="input" rows="3" value={descripcionReporte} onChange={(e) => setDescripcionReporte(e.target.value)} placeholder={t('report.describePh')} />
            </label>

            <div className="dialog-actions">
              <button type="button" className="btn btn-outline" onClick={() => setMostrarReporte(false)}>{t('common.cancel')}</button>
              <button type="button" className="btn btn-ink" onClick={handleReportar} disabled={!motivoSeleccionado || reportando}>
                {reportando ? t('common.sending') : t('report.send')}
              </button>
            </div>
          </div>
        </div>
      )}

      {user && user.rol === 'Comprador' && (
        <ChatFab vendedorId={producto.id_vendedor} vendedorNombre={producto.nombre_tienda} productoId={producto.id_producto} />
      )}
    </div>
  );
}
