import { useState } from 'react';
import Login from './Login';

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  // Vistas según el rol
  return (
    <div style={{ padding: '20px' }}>
      <nav>
        <span>Bienvenido, <strong>{user.email}</strong> (Rol: {user.rol})</span>
        <button onClick={() => setUser(null)} style={{ marginLeft: '10px' }}>Cerrar Sesión</button>
      </nav>

      <hr />

      {user.rol === 'Admin' && (
        <div>
          <h1>Panel de Administrador</h1>
          <p>Casos de uso: Validar documentos de vendedores.</p>
        </div>
      )}

      {user.rol === 'Vendedor' && (
        <div>
          <h1>Panel de Vendedor</h1>
          <p>Casos de uso: Monitorear niveles de stock y gestionar tienda.</p>
        </div>
      )}

      {user.rol === 'Comprador' && (
        <div>
          <h1>Portal del Comprador</h1>
          <p>Casos de uso: Realizar pedidos y procesar pagos.</p>
        </div>
      )}
    </div>
  );
}

export default App;