import { useState } from 'react';

function RegistroUsuario() {
  const initialState = {
    email: '',
    password: '',
    rol: 'Comprador',
    nombres: '',
    apellidos: '',
    telefono: '',
    documento_identidad: '',
    tipo_persona: 'Natural'
  };

  const [formData, setFormData] = useState(initialState);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ CORREGIDO: sistema-vendedor con guión, no sistema_vendedor con guión bajo
      const resp = await fetch('http://localhost:8080/sistema-vendedor/backend/crear_usuario.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await resp.json();
      setMsg(data.message);
      if (data.success) setFormData(initialState);
    } catch (error) {
      setMsg("Error de conexión con el servidor");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', background: '#f9f9f9' }}>
      <h3>Registrar Nuevo {formData.rol}</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input name="email" type="email" placeholder="Correo Electrónico" required value={formData.email} onChange={handleChange} />
          <input name="password" type="password" placeholder="Contraseña" required value={formData.password} onChange={handleChange} />
        </div>

        <select name="rol" value={formData.rol} onChange={handleChange}>
          <option value="Admin">Administrador</option>
          <option value="Vendedor">Vendedor</option>
          <option value="Comprador">Comprador</option>
        </select>

        {formData.rol !== 'Admin' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input name="nombres" placeholder="Nombres" required value={formData.nombres} onChange={handleChange} />
              <input name="apellidos" placeholder="Apellidos" required value={formData.apellidos} onChange={handleChange} />
            </div>
            <input name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} />
          </>
        )}

        {formData.rol === 'Vendedor' && (
          <div style={{ borderTop: '1px solid #ddd', paddingTop: '10px', marginTop: '5px' }}>
            <label style={{ fontSize: '0.8rem' }}>Información de Perfil:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '5px' }}>
              <input name="documento_identidad" placeholder="N° Documento / NIT" required value={formData.documento_identidad} onChange={handleChange} />
              <select name="tipo_persona" value={formData.tipo_persona} onChange={handleChange}>
                <option value="Natural">Persona Natural</option>
                <option value="Juridica">Persona Jurídica</option>
              </select>
            </div>
          </div>
        )}

        <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          Finalizar Registro
        </button>
      </form>
      {msg && <p style={{ color: msg.includes('Error') ? 'red' : 'green' }}>{msg}</p>}
    </div>
  );
}

export default RegistroUsuario;
