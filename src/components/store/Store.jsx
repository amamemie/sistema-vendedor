import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Tilt from '../ui/Tilt';
import Icon from '../ui/Icon';
import Prefs from '../ui/Prefs';
import { formatMoney } from '../../i18n/format';
import './store.css';

export const IMG_BASE = 'http://localhost/sistema-vendedor/backend/';
// eslint-disable-next-line react-refresh/only-export-components
export const imgUrl = (path) => (path ? (/^https?:/.test(path) ? path : IMG_BASE + path) : null);

export function Brand({ onClick }) {
  const { t } = useTranslation();
  return (
    <button type="button" className="store-brand" onClick={onClick}>
      <span className="store-brand-mark" aria-hidden="true">
        <span>M</span>
      </span>
      <span className="store-brand-name" translate="no">{t('brand.name')}</span>
    </button>
  );
}

export function SearchBox({ value, onChange }) {
  const { t } = useTranslation();
  return (
    <label className="store-search">
      <Icon name="search" size={17} />
      <span className="sr-only">{t('store.search')}</span>
      <input type="search" placeholder={t('store.searchPlaceholder')} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export function StoreHeader({ search, onSearch, cartCount, onCart, children }) {
  const { t } = useTranslation();
  return (
    <header className="store-header">
      <div className="store-header-inner">
        <Brand onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
        <SearchBox value={search} onChange={onSearch} />
        <div className="store-actions">
          <Prefs compact />
          <button type="button" className="icon-btn" onClick={onCart} aria-label={t('store.openCart')}>
            <Icon name="cart" />
            {cartCount > 0 && <span key={cartCount} className="icon-btn-badge">{cartCount}</span>}
          </button>
          {children}
        </div>
      </div>
    </header>
  );
}

export function CategoryChips({ categorias, value, onChange }) {
  const { t } = useTranslation();
  return (
    <div className="chips" role="tablist" aria-label={t('store.categories')}>
      {categorias.map((cat) => {
        const id = cat.id_categoria ?? 'Todos';
        const active = value === id;
        return (
          <button key={id} type="button" role="tab" aria-selected={active} className={`chip${active ? ' is-active' : ''}`} onClick={() => onChange(id)}>
            {cat.id_categoria == null ? t('store.all') : cat.nombre}
          </button>
        );
      })}
    </div>
  );
}

export function Stars({ value = 0 }) {
  const r = Math.round(Number(value) || 0);
  return (
    <span className="stars" aria-label={`${Number(value || 0).toFixed(1)} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name="star" size={13} className={i <= r ? 'on' : ''} />
      ))}
    </span>
  );
}

export function ProductCard({ p, index = 0, onAdd, onView }) {
  const { t } = useTranslation();
  const stock = Number(p.stock || 0);
  const out = stock <= 0;
  const rating = Number(p.calificacion_promedio || 0);
  const src = imgUrl(p.imagen_principal);

  return (
    <Tilt as="article" className="product-card" style={{ '--i': index }} max={6}>
      <button type="button" className="product-media" onClick={() => onView?.(p)} disabled={!onView} aria-label={p.nombre}>
        {src ? (
          <img src={src} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        ) : (
          <span className="product-media-empty"><Icon name="box" size={40} strokeWidth={1.4} /></span>
        )}
        {out ? (
          <span className="product-flag product-flag--out">{t('store.soldOut')}</span>
        ) : stock <= 5 ? (
          <span className="product-flag product-flag--low">{t('store.lowStock', { count: stock })}</span>
        ) : null}
      </button>
      <div className="product-body tilt-pop">
        <span className="product-store">{p.nombre_tienda || t('store.store')}</span>
        <h3 className="product-name">{p.nombre}</h3>
        <div className="product-meta">
          <Stars value={rating} />
          <span>{rating > 0 ? rating.toFixed(1) : t('store.new')}</span>
          {!out && <span className="product-stock">· {t('store.inStock', { count: stock })}</span>}
        </div>
        <div className="product-foot">
          <span className="product-price">{formatMoney(p.precio_unitario)}</span>
          <div className="product-buttons">
            {onView && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => onView(p)}>
                {t('store.details')}
              </button>
            )}
            <button type="button" className="btn btn-ink btn-sm" onClick={() => onAdd(p)} disabled={out} aria-label={`${t('store.add')} ${p.nombre}`}>
              {out ? t('store.noStock') : <><Icon name="plus" size={15} /> {t('store.add')}</>}
            </button>
          </div>
        </div>
      </div>
    </Tilt>
  );
}

export function ProductGrid({ children }) {
  return <div className="product-grid stagger">{children}</div>;
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="product-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="product-card product-card--skeleton">
          <div className="skeleton" style={{ aspectRatio: '4 / 3', borderRadius: 0 }} />
          <div className="product-body">
            <div className="skeleton" style={{ height: 12, width: '40%' }} />
            <div className="skeleton" style={{ height: 18, width: '75%', marginTop: 10 }} />
            <div className="skeleton" style={{ height: 22, width: '35%', marginTop: 18 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Panel lateral del carrito. `onQty` es opcional: sin él solo se muestra la cantidad. */
export function CartDrawer({ open, items, onClose, onQty, onRemove, onClear, onCheckout, checkoutLabel }) {
  const { t } = useTranslation();
  const count = items.reduce((s, i) => s + i.cantidad, 0);
  const total = items.reduce((s, i) => s + Number(i.precio_unitario) * i.cantidad, 0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="drawer-root">
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={t('cart.title')}>
        <header className="drawer-head">
          <div>
            <h2>{t('cart.title')}</h2>
            <p>{t('cart.items', { count })}</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t('common.close')}>
            <Icon name="x" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="empty-state drawer-empty">
            <span className="empty-icon"><Icon name="cart" size={28} /></span>
            <strong>{t('cart.empty')}</strong>
            <span>{t('cart.emptyHint')}</span>
          </div>
        ) : (
          <>
            <ul className="drawer-list stagger">
              {items.map((item, idx) => {
                const src = imgUrl(item.imagen_principal);
                return (
                  <li key={item.id_producto} className="drawer-item" style={{ '--i': idx }}>
                    <div className="drawer-thumb">{src ? <img src={src} alt="" /> : <Icon name="box" size={22} />}</div>
                    <div className="drawer-info">
                      <strong>{item.nombre}</strong>
                      <span>{item.nombre_tienda}</span>
                      <div className="drawer-row">
                        <span className="drawer-price">{formatMoney(item.precio_unitario * item.cantidad)}</span>
                        <div className="qty">
                          {onQty ? (
                            <>
                              <button type="button" onClick={() => onQty(item.id_producto, item.cantidad - 1)} aria-label={t('cart.less')}><Icon name="minus" size={14} /></button>
                              <span>{item.cantidad}</span>
                              <button type="button" onClick={() => onQty(item.id_producto, item.cantidad + 1)} aria-label={t('cart.more')}><Icon name="plus" size={14} /></button>
                            </>
                          ) : (
                            <span>×{item.cantidad}</span>
                          )}
                          <button type="button" className="qty-remove" onClick={() => onRemove(item.id_producto)} aria-label={t('cart.remove')}><Icon name="trash" size={15} /></button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <footer className="drawer-foot">
              <div className="drawer-total">
                <span>{t('cart.total')}</span>
                <strong>{formatMoney(total)}</strong>
              </div>
              <div className="drawer-actions">
                <button type="button" className="btn btn-outline" onClick={onClear}>{t('cart.clear')}</button>
                <button type="button" className="btn btn-ink" onClick={onCheckout}>
                  {checkoutLabel || t('cart.checkout')} <Icon name="arrowRight" size={16} />
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
