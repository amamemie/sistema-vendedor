import { useState } from 'react';
import Login from './Login';
import RegistroUsuario from './components/RegistroUsuario'; // Importar el nuevo componente

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div style={{ padding: '20px' }}>
      <nav>
        <span>Hola, <strong>{user.email}</strong></span>
        <button onClick={() => setUser(null)}>Cerrar Sesión</button>
      </nav>

      {user.rol === 'Admin' && (
        <div>
          <h1>Panel de Administrador</h1>
          <button onClick={() => alert("Cargando lista de usuarios...")}>Ver Usuarios Actuales</button>
          
          {/* Aquí aparece la opción para crear usuarios */}
          <RegistroUsuario /> 
        </div>
      )}

      {user.rol === 'Vendedor' && (
        <div>
          <h1>Panel de Vendedor</h1>
          <p>Gestión de productos e inventario.</p>
        </div>
      )}

      {user.rol === 'Comprador' && (
        <div>
          <h1>Portal de Compras</h1>
          <p>Explora nuestro catálogo.</p>
        </div>
      )}
    </div>
  );
}

export default App;