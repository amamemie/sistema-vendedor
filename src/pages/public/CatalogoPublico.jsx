import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import {
  StoreHeader, CategoryChips, ProductCard, ProductGrid, ProductGridSkeleton, CartDrawer,
} from '../../components/store/Store';
import Hero3D from '../../components/store/Hero3D';
import Icon from '../../components/ui/Icon';
import { toast } from '../../components/ui/toast';
import { formatMoney } from '../../i18n/format';

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem('carrito_publico')) || [];
  } catch {
    return [];
  }
};

export default function CatalogoPublico({ onLoginClick, onRegisterClick }) {
  const { t } = useTranslation();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState(readCart);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [checkoutData, setCheckoutData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('checkout_pendiente'));
    } catch {
      return null;
    }
  });
  const catalogRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getProductos(null, true);
        if (Array.isArray(data)) setProductos(data);
        else setError(t('errors.loadProducts'));
      } catch {
        setError(t('errors.connection'));
      }
      setLoading(false);
    })();
    api.getCategorias()
      .then((data) => Array.isArray(data) && setCategorias([{ id_categoria: null, nombre: 'Todos' }, ...data]))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const guardarCarrito = (nuevo) => {
    setCarrito(nuevo);
    localStorage.setItem('carrito_publico', JSON.stringify(nuevo));
  };

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find((i) => i.id_producto === producto.id_producto);
    const nuevo = existe
      ? carrito.map((i) => (i.id_producto === producto.id_producto ? { ...i, cantidad: i.cantidad + 1 } : i))
      : [...carrito, { ...producto, cantidad: 1 }];
    guardarCarrito(nuevo);
    toast(t('store.added', { name: producto.nombre }));
  };

  const eliminarDelCarrito = (id) => guardarCarrito(carrito.filter((i) => i.id_producto !== id));

  const actualizarCantidad = (id, cantidad) => {
    if (cantidad <= 0) return eliminarDelCarrito(id);
    guardarCarrito(carrito.map((i) => (i.id_producto === id ? { ...i, cantidad } : i)));
  };

  const vaciarCarrito = () => {
    if (confirm(t('cart.confirmClear'))) guardarCarrito([]);
  };

  const totalCarrito = carrito.reduce((s, i) => s + i.precio_unitario * i.cantidad, 0);
  const cantidadCarrito = carrito.reduce((s, i) => s + i.cantidad, 0);

  const irAcheckout = () => {
    if (carrito.length === 0) return toast(t('cart.empty'), 'info');
    const datos = { carrito, total: totalCarrito, items: carrito.length, timestamp: Date.now() };
    localStorage.setItem('checkout_pendiente', JSON.stringify(datos));
    setMostrarCarrito(false);
    setCheckoutData(datos);
  };

  const cancelarCheckout = () => {
    setCheckoutData(null);
    localStorage.removeItem('checkout_pendiente');
  };

  const productosFiltrados = useMemo(
    () =>
      productos.filter((p) => {
        const matchCategoria = categoriaSeleccionada === 'Todos' || p.id_categoria == categoriaSeleccionada;
        const matchBusqueda = !busqueda || p.nombre?.toLowerCase().includes(busqueda.toLowerCase());
        return matchCategoria && matchBusqueda;
      }),
    [productos, categoriaSeleccionada, busqueda]
  );

  const storeCount = useMemo(() => new Set(productos.map((p) => p.nombre_tienda).filter(Boolean)).size, [productos]);
  const scrollToCatalog = () => catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="store-page page-enter">
      <StoreHeader search={busqueda} onSearch={setBusqueda} cartCount={cantidadCarrito} onCart={() => setMostrarCarrito(true)}>
        <button type="button" className="btn btn-ghost hide-sm" onClick={onLoginClick}>{t('auth.login')}</button>
        <button type="button" className="btn btn-ink" onClick={onRegisterClick}>{t('auth.createAccount')}</button>
      </StoreHeader>

      <main className="store-wrap">
        {!busqueda && (
          <Hero3D products={productos} storeCount={storeCount} onPrimary={scrollToCatalog} onSecondary={onRegisterClick} />
        )}

        <section ref={catalogRef} className="store-main" style={{ scrollMarginTop: 80 }}>
          <div className="section-head">
            <div>
              <h2>{busqueda ? t('store.resultsFor', { q: busqueda }) : t('store.catalogTitle')}</h2>
              <p>{t('store.productCount', { count: productosFiltrados.length })}</p>
            </div>
          </div>

          <CategoryChips categorias={categorias} value={categoriaSeleccionada} onChange={setCategoriaSeleccionada} />

          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <ProductGridSkeleton />
          ) : productosFiltrados.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon"><Icon name="search" size={26} /></span>
              <strong>{t('store.noResults')}</strong>
              <span>{t('store.noResultsHint')}</span>
            </div>
          ) : (
            <ProductGrid key={`${categoriaSeleccionada}-${busqueda}`}>
              {productosFiltrados.map((p, i) => (
                <ProductCard key={p.id_producto} p={p} index={i} onAdd={agregarAlCarrito} />
              ))}
            </ProductGrid>
          )}
        </section>
      </main>

      <footer className="store-footer">
        <div className="store-wrap">
          <span>© {new Date().getFullYear()} {t('brand.name')}</span>
          <span>{t('footer.tagline')}</span>
        </div>
      </footer>

      <CartDrawer
        open={mostrarCarrito}
        items={carrito}
        onClose={() => setMostrarCarrito(false)}
        onQty={actualizarCantidad}
        onRemove={eliminarDelCarrito}
        onClear={vaciarCarrito}
        onCheckout={irAcheckout}
        checkoutLabel={t('cart.continue')}
      />

      {checkoutData && (
        <div className="dialog-root">
          <div className="drawer-scrim" onClick={cancelarCheckout} />
          <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
            <div className="dialog-icon"><Icon name="cart" size={28} /></div>
            <h3 id="checkout-title">{t('checkoutGate.title')}</h3>
            <p>{t('checkoutGate.body')}</p>
            <div className="dialog-total">
              <span>{t('cart.items', { count: checkoutData.items })}</span>
              <strong>{formatMoney(checkoutData.total)}</strong>
            </div>
            <div className="dialog-actions">
              <button type="button" className="btn btn-outline" onClick={cancelarCheckout}>{t('checkoutGate.keepShopping')}</button>
              <button
                type="button"
                className="btn btn-ink"
                onClick={() => {
                  localStorage.setItem('restaurar_carrito', 'true');
                  cancelarCheckout();
                  onLoginClick?.();
                }}
              >
                {t('auth.login')}
              </button>
            </div>
            <button
              type="button"
              className="dialog-link"
              onClick={() => {
                localStorage.setItem('restaurar_carrito', 'true');
                cancelarCheckout();
                onRegisterClick?.();
              }}
            >
              {t('checkoutGate.newAccount')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
