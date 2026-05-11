import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import VendorLayout from '../pages/vendor/VendorLayout';
import AdminPanel from '../pages/admin/Panel';
import Catalogo from '../pages/comprador/Catalogo';

export default function AppRouter() {
  const { user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  // Sin sesión → Login o Registro
  if (!user) {
    if (showRegister) {
      return <Register onGoToLogin={() => setShowRegister(false)} />;
    }
    return <Login onGoToRegister={() => setShowRegister(true)} />;
  }

  // Con sesión → panel según rol
  if (user.rol === 'Admin')     return <AdminPanel />;
  if (user.rol === 'Vendedor')  return <VendorLayout />;
  if (user.rol === 'Comprador') return <Catalogo />;

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <p>Rol no reconocido: <strong>{user.rol}</strong></p>
    </div>
  );
}
