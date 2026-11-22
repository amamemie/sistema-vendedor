import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  StoreHeader, CategoryChips, ProductCard, ProductGrid, ProductGridSkeleton, CartDrawer,
} from '../../components/store/Store';
import Icon from '../../components/ui/Icon';
import { toast } from '../../components/ui/toast';

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem('carrito')) || [];
  } catch {
    return [];
  }
};

export default function CatalogoComprador({ user, onViewProduct, onViewCart, onViewProfile }) {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState(readCart);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getProductos(null, true);
        if (Array.isArray(data)) setProductos(data);
      } catch {
        setError(t('errors.loadProducts'));
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
    localStorage.setItem('carrito', JSON.stringify(nuevo));
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

  const cantidadCarrito = carrito.reduce((s, i) => s + i.cantidad, 0);

  const productosFiltrados = useMemo(
    () =>
      productos.filter((p) => {
        const matchCategoria = categoriaSeleccionada === 'Todos' || p.id_categoria == categoriaSeleccionada;
        const matchBusqueda = !busqueda || p.nombre?.toLowerCase().includes(busqueda.toLowerCase());
        return matchCategoria && matchBusqueda;
      }),
    [productos, categoriaSeleccionada, busqueda]
  );

  const nombre = user?.email?.split('@')[0] || '';

  return (
    <div className="store-page page-enter">
      <StoreHeader search={busqueda} onSearch={setBusqueda} cartCount={cantidadCarrito} onCart={() => setMostrarCarrito(true)}>
        <button type="button" className="avatar-btn" onClick={onViewProfile} aria-label={t('nav.profile')} title={t('nav.profile')}>
          {user?.email?.substring(0, 2).toUpperCase() || 'U'}
        </button>
        <button type="button" className="icon-btn" onClick={logout} aria-label={t('auth.logout')} title={t('auth.logout')}>
          <Icon name="logout" />
        </button>
      </StoreHeader>

      <main className="store-wrap store-main">
        <section className="buyer-welcome">
          <div>
            <span className="buyer-welcome-eyebrow">{t('buyer.welcomeEyebrow')}</span>
            <h1>{t('buyer.welcome', { name: nombre })}</h1>
            <p>{t('buyer.welcomeLead')}</p>
          </div>
          <div className="buyer-welcome-actions">
            <button type="button" className="btn btn-outline" onClick={onViewProfile}>
              <Icon name="user" size={16} /> {t('buyer.myAccount')}
            </button>
            <button type="button" className="btn btn-ink" onClick={onViewCart}>
              <Icon name="cart" size={16} /> {t('buyer.goToCart')}
            </button>
          </div>
        </section>

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
              <ProductCard key={p.id_producto} p={p} index={i} onAdd={agregarAlCarrito} onView={onViewProduct} />
            ))}
          </ProductGrid>
        )}
      </main>

      <CartDrawer
        open={mostrarCarrito}
        items={carrito}
        onClose={() => setMostrarCarrito(false)}
        onQty={actualizarCantidad}
        onRemove={eliminarDelCarrito}
        onClear={vaciarCarrito}
        onCheckout={onViewCart}
        checkoutLabel={t('cart.buyNow')}
      />
    </div>
  );
}
