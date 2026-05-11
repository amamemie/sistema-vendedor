import { useState } from 'react';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ CORREGIDO: URL apunta a login.php (no a crear_usuario.php)
      const resp = await fetch('http://localhost:8080/sistema-vendedor/backend/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      // ✅ CORREGIDO: resp.json() (antes decía response.json() — variable inexistente)
      const data = await resp.json();

      if (data.success) {
        onLoginSuccess(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error conectando al servidor");
    }
  };

  return (
    <div style={{ maxWidth: '300px', margin: '50px auto', textAlign: 'center' }}>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email" placeholder="Email" required
          value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: '10px' }}
        />
        <input
          type="password" placeholder="Contraseña" required
          value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: '10px' }}
        />
        <button type="submit" style={{ width: '100%' }}>Ingresar</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Login;
