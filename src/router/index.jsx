import { useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '../components/ui/toast';
import { formatMoney } from '../i18n/format';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
const VendorLayout = lazy(() => import('../pages/vendor/VendorLayout'));
const AdminPanel = lazy(() => import('../pages/admin/AdminPanel'));
import CatalogoPublico from '../pages/public/CatalogoPublico';
import CatalogoComprador from '../pages/comprador/CatalogoComprador';
const DetalleProducto = lazy(() => import('../pages/comprador/DetalleProducto'));
const Carrito = lazy(() => import('../pages/comprador/Carrito'));
const Checkout = lazy(() => import('../pages/comprador/Checkout'));
const PerfilComprador = lazy(() => import('../pages/comprador/PerfilComprador'));

function PageFallback() {
  return (
    <div style={{ minHeight: '100svh', display: 'grid', placeItems: 'center' }} aria-busy="true">
      <span className="btn-spinner" style={{ width: 28, height: 28, color: 'var(--accent)' }} />
    </div>
  );
}

export default function AppRouter() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes />
    </Suspense>
  );
}

function Routes() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  
  // Estados para navegación del comprador
  const [vistaComprador, setVistaComprador] = useState('catalogo');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [carritoCompra, setCarritoCompra] = useState([]);
  const [totalCompra, setTotalCompra] = useState(0);

  // Si no hay usuario
  if (!user) {
    if (showAuthModal) {
      if (showRegister) {
        return <Register onGoToLogin={() => setShowRegister(false)} onSuccess={() => setShowAuthModal(false)} onBack={() => { setShowRegister(false); setShowAuthModal(false); }} />;
      }
      return <Login onGoToRegister={() => setShowRegister(true)} onSuccess={() => setShowAuthModal(false)} onBack={() => setShowAuthModal(false)} />;
    }
    return <CatalogoPublico onLoginClick={() => { setShowRegister(false); setShowAuthModal(true); }} onRegisterClick={() => { setShowRegister(true); setShowAuthModal(true); }} />;
  }

  // Panel según rol
  if (user.rol === 'Admin') return <AdminPanel />;
  if (user.rol === 'Vendedor') return <VendorLayout />;
  // Dentro de tu función de login en AppRouter.jsx
// Después de que el usuario se autentique correctamente:

if (user.rol === 'Comprador') {
  // Restaurar carrito público al carrito del comprador
  const carritoPublico = localStorage.getItem('carrito_publico');
  const restaurarCarrito = localStorage.getItem('restaurar_carrito');
  
  if (carritoPublico && restaurarCarrito === 'true') {
    // Guardar el carrito público en el carrito del comprador
    localStorage.setItem('carrito', carritoPublico);
    localStorage.removeItem('carrito_publico');
    localStorage.removeItem('restaurar_carrito');
    
    // También guardar en localStorage del comprador
    const carritoData = JSON.parse(carritoPublico);
    localStorage.setItem('carrito', JSON.stringify(carritoData));
  }
  
  // Redirigir al catálogo del comprador
  // ...
}



  // Comprador - navegación entre vistas
  if (user.rol === 'Comprador') {
    if (vistaComprador === 'detalle' && productoSeleccionado) {
      return (
        <DetalleProducto
          producto={productoSeleccionado}
          onBack={() => { setVistaComprador('catalogo'); setProductoSeleccionado(null); }}
          onAddToCart={(producto) => {
            const carritoGuardado = localStorage.getItem('carrito');
            let carritoActual = carritoGuardado ? JSON.parse(carritoGuardado) : [];
            const existe = carritoActual.find(i => i.id_producto === producto.id_producto);
            if (existe) {
              existe.cantidad += producto.cantidad || 1;
            } else {
              carritoActual.push({ ...producto, cantidad: producto.cantidad || 1 });
            }
            localStorage.setItem('carrito', JSON.stringify(carritoActual));
            toast(t('store.added', { name: producto.nombre }));
            setVistaComprador('catalogo');
            setProductoSeleccionado(null);
          }}
        />
      );
    }
    if (vistaComprador === 'carrito') {
      return (
        <Carrito
          onCheckout={(carrito, total) => {
            setCarritoCompra(carrito);
            setTotalCompra(total);
            setVistaComprador('checkout');
          }}
          onBack={() => setVistaComprador('catalogo')}
        />
      );
    }
    if (vistaComprador === 'checkout') {
      return (
        <Checkout
          carrito={carritoCompra}
          total={totalCompra}
          onConfirm={() => {
            toast(t('checkout.success', { total: formatMoney(totalCompra) }));
            localStorage.removeItem('carrito');
            setVistaComprador('catalogo');
          }}
          onBack={() => setVistaComprador('carrito')}
        />
      );
    }
    if (vistaComprador === 'perfil') {
      return <PerfilComprador onBack={() => setVistaComprador('catalogo')} />;
    }
    
    // Catálogo principal
    return (
      <CatalogoComprador
        user={user}
        onViewProduct={(producto) => {
          setProductoSeleccionado(producto);
          setVistaComprador('detalle');
        }}
        onViewCart={() => setVistaComprador('carrito')}
        onViewProfile={() => setVistaComprador('perfil')}
      />
    );
  }

  return <div className="empty-state">{t('errors.unknownRole', { role: user.rol })}</div>;
}