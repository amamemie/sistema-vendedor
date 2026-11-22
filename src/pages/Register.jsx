// /src/pages/Register.jsx
import { useState } from 'react';
import { authService } from '../services/api';

export default function Register({ onGoToLogin, onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombres: '',
    apellidos: '',
    telefono: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = await authService.register({
      ...formData,
      rol: 'Comprador',
    });

    setLoading(false);

    if (data.success) {
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onGoToLogin) onGoToLogin();
      }, 2000);
    } else {
      setError(data.message || 'Error al registrar');
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f6f6f7',
      }}>
        <div style={{
          background: '#fff',
          padding: '40px',
          borderRadius: 16,
          textAlign: 'center',
          maxWidth: 400,
        }}>
          <i className="ti ti-circle-check" style={{ fontSize: 48, color: '#059669', marginBottom: 16 }} />
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>¡Cuenta creada!</h2>
          <p style={{ color: '#64748b', fontSize: 13 }}>Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f6f6f7',
      padding: '20px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '32px',
        width: '100%',
        maxWidth: 420,
        border: '0.5px solid #e2e8f0',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: '#0f172a',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 14,
          }}>M</div>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Crear cuenta</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Como comprador</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="text"
            name="nombres"
            placeholder="Nombres"
            value={formData.nombres}
            onChange={handleChange}
            required
            style={{
              padding: '10px 12px', fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 8,
              outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
          <input
            type="text"
            name="apellidos"
            placeholder="Apellidos"
            value={formData.apellidos}
            onChange={handleChange}
            required
            style={{
              padding: '10px 12px', fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 8,
              outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              padding: '10px 12px', fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 8,
              outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              padding: '10px 12px', fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 8,
              outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
          <input
            type="tel"
            name="telefono"
            placeholder="Teléfono (opcional)"
            value={formData.telefono}
            onChange={handleChange}
            style={{
              padding: '10px 12px', fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 8,
              outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#dc2626',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '11px', marginTop: 6,
              background: loading ? '#94a3b8' : '#0f172a',
              color: '#fff', border: 'none', borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            onClick={onGoToLogin}
            style={{
              background: 'none', border: 'none', color: '#2563eb', fontSize: 13,
              cursor: 'pointer',
            }}
          >
            ← Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
}