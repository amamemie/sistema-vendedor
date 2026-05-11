import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';

export default function Login({ onGoToRegister }) {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const data = await authService.login(email, password);
    setLoading(false);

    if (data.success) {
      login(data);
    } else {
      setError(data.message || 'Credenciales incorrectas');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#f6f6f7',
    }}>
      {/* Panel izquierdo — decorativo */}
      <div style={{
        display: 'none',
        width: '45%',
        background: '#0f172a',
        position: 'relative',
        overflow: 'hidden',
        // mostrar en pantallas grandes via media query no aplica con inline styles,
        // pero lo dejamos listo para que lo activen con CSS si quieren
      }} />

      {/* Panel derecho — formulario */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}>
        <div style={{
          background: '#ffffff',
          border: '0.5px solid #e2e8f0',
          borderRadius: 16,
          padding: '36px 32px',
          width: '100%',
          maxWidth: 380,
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          {/* Logo + título */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: '#0f172a',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 14,
              letterSpacing: '-0.5px',
            }}>M</div>
            <h1 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 4px', color: '#0f172a', letterSpacing: '-0.3px' }}>
              Bienvenido
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
              Ingresa a tu cuenta del Marketplace
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                style={{
                  width: '100%', padding: '9px 12px', fontSize: 13,
                  border: '1px solid #e2e8f0', borderRadius: 8,
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                  color: '#0f172a', background: '#fff',
                }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 5 }}>
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '9px 12px', fontSize: 13,
                  border: '1px solid #e2e8f0', borderRadius: 8,
                  outline: 'none', boxSizing: 'border-box',
                  color: '#0f172a', background: '#fff',
                }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 8, padding: '8px 12px',
                fontSize: 12, color: '#dc2626',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <i className="ti ti-alert-circle" style={{ fontSize: 14 }} aria-hidden="true" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '10px 0', marginTop: 2,
                background: loading ? '#94a3b8' : '#0f172a',
                color: '#fff', border: 'none', borderRadius: 8,
                fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.01em', transition: 'background 0.15s',
              }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Separador */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            margin: '20px 0',
          }}>
            <div style={{ flex: 1, height: '0.5px', background: '#e2e8f0' }} />
            <span style={{ fontSize: 11, color: '#94a3b8' }}>¿No tienes cuenta?</span>
            <div style={{ flex: 1, height: '0.5px', background: '#e2e8f0' }} />
          </div>

          {/* Botón registrarse */}
          <button
            onClick={onGoToRegister}
            style={{
              width: '100%', padding: '10px 0',
              background: 'transparent',
              color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: 8,
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = '#0f172a'; e.target.style.background = '#f8fafc'; }}
            onMouseLeave={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = 'transparent'; }}
          >
            Crear cuenta
          </button>

          <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', margin: '16px 0 0' }}>
            ¿Quieres vender?{' '}
            <span style={{ color: '#2563eb', cursor: 'default' }}>
              Contacta al administrador
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
