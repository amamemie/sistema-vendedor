import { useState } from 'react';
import { authService } from '../services/auth.service';

export default function Register({ onGoToLogin }) {
  const [step, setStep]       = useState(1); // 1 = cuenta, 2 = perfil
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmar: '',
    nombres: '',
    apellidos: '',
    telefono: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  // Paso 1 → validar y avanzar
  const handleStep1 = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setStep(2);
  };

  // Paso 2 → enviar al backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      email:    formData.email,
      password: formData.password,
      rol:      'Comprador',
      nombres:  formData.nombres,
      apellidos: formData.apellidos,
      telefono: formData.telefono,
    };

    const data = await authService.register(payload);
    setLoading(false);

    if (data.success) {
      setSuccess(true);
    } else {
      setError(data.message || 'Error al registrarse');
    }
  };

  // ── Pantalla de éxito ──
  if (success) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#f6f6f7', padding: 16,
      }}>
        <div style={{
          background: '#fff', border: '0.5px solid #e2e8f0',
          borderRadius: 16, padding: '40px 32px',
          maxWidth: 380, width: '100%', textAlign: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: '#d1fae5', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 28, marginBottom: 16,
          }}>✓</div>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px', color: '#0f172a' }}>
            ¡Cuenta creada!
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px' }}>
            Tu cuenta de comprador fue registrada exitosamente.
          </p>
          <button
            onClick={onGoToLogin}
            style={{
              width: '100%', padding: '10px 0',
              background: '#0f172a', color: '#fff',
              border: 'none', borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Ir al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  // ── Formulario ──
  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#f6f6f7', padding: '24px 16px',
    }}>
      <div style={{
        background: '#fff', border: '0.5px solid #e2e8f0',
        borderRadius: 16, padding: '36px 32px',
        width: '100%', maxWidth: 400,
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={step === 1 ? onGoToLogin : () => setStep(1)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#64748b', fontSize: 12, display: 'flex',
              alignItems: 'center', gap: 4, padding: 0, marginBottom: 16,
            }}
          >
            <i className="ti ti-arrow-left" aria-hidden="true" />
            {step === 1 ? 'Volver al login' : 'Paso anterior'}
          </button>

          <h1 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 4px', color: '#0f172a', letterSpacing: '-0.3px' }}>
            Crear cuenta
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            {step === 1 ? 'Paso 1 de 2 — Datos de acceso' : 'Paso 2 de 2 — Datos personales'}
          </p>
        </div>

        {/* Indicador de pasos */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              flex: 1, height: 3, borderRadius: 3,
              background: s <= step ? '#0f172a' : '#e2e8f0',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {/* ── Paso 1: email + contraseña ── */}
        {step === 1 && (
          <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Correo electrónico</label>
              <input
                name="email" type="email" required
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div>
              <label style={labelStyle}>Contraseña</label>
              <input
                name="password" type="password" required
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div>
              <label style={labelStyle}>Confirmar contraseña</label>
              <input
                name="confirmar" type="password" required
                placeholder="Repite tu contraseña"
                value={formData.confirmar}
                onChange={handleChange}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {error && <ErrorBox msg={error} />}

            <button type="submit" style={btnPrimaryStyle}>
              Continuar →
            </button>
          </form>
        )}

        {/* ── Paso 2: datos personales ── */}
        {step === 2 && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>Nombres</label>
                <input
                  name="nombres" required
                  placeholder="Tu nombre"
                  value={formData.nombres}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
              <div>
                <label style={labelStyle}>Apellidos</label>
                <input
                  name="apellidos" required
                  placeholder="Tus apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Teléfono <span style={{ color: '#94a3b8', fontWeight: 400 }}>(opcional)</span></label>
              <input
                name="telefono"
                placeholder="+591 70000000"
                value={formData.telefono}
                onChange={handleChange}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Resumen de cuenta */}
            <div style={{
              background: '#f8fafc', border: '0.5px solid #e2e8f0',
              borderRadius: 8, padding: '10px 12px', fontSize: 12,
            }}>
              <div style={{ color: '#64748b', marginBottom: 2 }}>Cuenta a crear:</div>
              <div style={{ color: '#0f172a', fontWeight: 500 }}>{formData.email}</div>
              <div style={{ color: '#2563eb', fontSize: 11, marginTop: 2 }}>Rol: Comprador</div>
            </div>

            {error && <ErrorBox msg={error} />}

            <button
              type="submit"
              disabled={loading}
              style={{ ...btnPrimaryStyle, background: loading ? '#94a3b8' : '#0f172a', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Registrando...' : 'Finalizar registro'}
            </button>
          </form>
        )}

        <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', margin: '16px 0 0' }}>
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={onGoToLogin}
            style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 11, cursor: 'pointer', padding: 0 }}
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}

// ── Estilos reutilizables ──
const labelStyle = {
  fontSize: 12, fontWeight: 500, color: '#374151',
  display: 'block', marginBottom: 5,
};

const inputStyle = {
  width: '100%', padding: '9px 12px', fontSize: 13,
  border: '1px solid #e2e8f0', borderRadius: 8,
  outline: 'none', boxSizing: 'border-box',
  color: '#0f172a', background: '#fff',
  transition: 'border-color 0.15s',
};

const btnPrimaryStyle = {
  width: '100%', padding: '10px 0', marginTop: 2,
  background: '#0f172a', color: '#fff',
  border: 'none', borderRadius: 8,
  fontSize: 13, fontWeight: 600, cursor: 'pointer',
  letterSpacing: '0.01em',
};

function ErrorBox({ msg }) {
  return (
    <div style={{
      background: '#fef2f2', border: '1px solid #fecaca',
      borderRadius: 8, padding: '8px 12px',
      fontSize: 12, color: '#dc2626',
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      <i className="ti ti-alert-circle" style={{ fontSize: 14 }} aria-hidden="true" />
      {msg}
    </div>
  );
}
