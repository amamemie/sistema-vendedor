import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './vendor.css';
import { guardarTiendaLocal, cargarTiendaLocal, validarDatosEmpresa, imagenToBase64 } from './vendor.utils';

export default function PerfilVendedor({ onBack }) {
  const { user } = useAuth();
  const [tienda, setTienda] = useState({
    nombreEmpresa: '',
    nit_rut: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    descripcion: '',
    logo: null
  });
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [errores, setErrores] = useState([]);

  useEffect(() => {
    const tiendaGuardada = cargarTiendaLocal();
    if (tiendaGuardada) setTienda(tiendaGuardada);
  }, []);

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'telefono') value = value.replace(/\D/g, '');
    setTienda({ ...tienda, [e.target.name]: value });
    if (errores.length) setErrores([]);
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await imagenToBase64(file);
      setTienda({ ...tienda, logo: base64 });
    }
  };

  const guardarTienda = async () => {
    const erroresValidacion = validarDatosEmpresa(tienda);
    if (erroresValidacion.length) {
      setErrores(erroresValidacion);
      setMensaje('❌ Corrige los errores');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      guardarTiendaLocal(tienda);
      setEditando(false);
      setMensaje('✅ Datos de la empresa guardados');
      setTimeout(() => setMensaje(''), 3000);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="vendor-content">
      <div className="perfil-vendedor-container">
        <button onClick={onBack} className="carrito-btn-volver"><span>←</span> Volver al panel</button>

        <div className="perfil-vendedor-card">
          <div className="perfil-vendedor-header">
            <h1 className="perfil-vendedor-title">🏢 Mi empresa</h1>
            {!editando && <button className="btn-primary" onClick={() => setEditando(true)}>Editar información</button>}
          </div>

          {mensaje && <div className="perfil-message success">{mensaje}</div>}
          {errores.length > 0 && <div className="perfil-error-message">{errores.map(e => <div key={e}>⚠️ {e}</div>)}</div>}

          <div className="perfil-vendedor-avatar">
            <div className="perfil-vendedor-avatar-circle">
              {tienda.logo ? <img src={tienda.logo} alt="Logo" className="perfil-avatar-image" /> : <span className="perfil-vendedor-avatar-letter">🏢</span>}
            </div>
            {editando && <label className="perfil-upload-btn"><input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} /> Cambiar logo</label>}
          </div>

          <div className="perfil-vendedor-form-grid">
            <div className="perfil-field"><label>Email</label><input type="email" value={user?.email || ''} disabled /></div>
            <div className="perfil-field"><label>Nombre de la empresa *</label><input name="nombreEmpresa" value={tienda.nombreEmpresa} onChange={handleChange} disabled={!editando} /></div>
            <div className="perfil-field"><label>NIT / RUT *</label><input name="nit_rut" value={tienda.nit_rut} onChange={handleChange} disabled={!editando} /></div>
            <div className="perfil-field"><label>Teléfono *</label><input name="telefono" value={tienda.telefono} onChange={handleChange} disabled={!editando} /></div>
            <div className="perfil-field"><label>Dirección</label><input name="direccion" value={tienda.direccion} onChange={handleChange} disabled={!editando} /></div>
            <div className="perfil-field"><label>Ciudad</label><input name="ciudad" value={tienda.ciudad} onChange={handleChange} disabled={!editando} /></div>
            <div className="perfil-field"><label>Descripción de la tienda</label><textarea name="descripcion" value={tienda.descripcion} onChange={handleChange} disabled={!editando} rows="3" /></div>
          </div>

          {editando && (
            <div className="perfil-actions" style={{ marginTop: 24 }}>
              <button className="perfil-save-btn" onClick={guardarTienda} disabled={loading}>{loading ? 'Guardando...' : 'Guardar cambios'}</button>
              <button className="perfil-cancel-btn" onClick={() => setEditando(false)}>Cancelar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}