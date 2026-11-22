import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './comprador.css';
import { cargarPerfil, guardarPerfil, validarPerfil, obtenerIniciales, imagenToBase64 } from './comprador.utils';
import MisPedidos from './MisPedidos';
import MisResenas from './MisResenas';
import SolicitarVendedor from './SolicitarVendedor';
import MisDescuentos from './MisDescuentos';

export default function PerfilComprador({ onBack }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');
  const [perfil, setPerfil] = useState({
    nombres: '',
    apellidos: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    metodoPago: 'tarjeta',
    imagenPerfil: null
  });
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [errores, setErrores] = useState([]);

  useEffect(() => {
    const perfilGuardado = cargarPerfil();
    if (perfilGuardado) setPerfil(perfilGuardado);
  }, []);

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'telefono') value = value.replace(/\D/g, '');
    setPerfil({ ...perfil, [e.target.name]: value });
    if (errores.length) setErrores([]);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await imagenToBase64(file);
      setPerfil({ ...perfil, imagenPerfil: base64 });
    }
  };

  const guardarPerfilHandler = () => {
    const erroresValidacion = validarPerfil(perfil);
    if (erroresValidacion.length) {
      setErrores(erroresValidacion);
      setMensaje('❌ Corrige los errores');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      guardarPerfil(perfil);
      setEditando(false);
      setMensaje('✅ Perfil guardado');
      setTimeout(() => setMensaje(''), 3000);
      setLoading(false);
    }, 500);
  };

 const tabs = [
  { id: 'perfil', label: '👤 Mi Perfil' },
  { id: 'pedidos', label: '📦 Mis Pedidos' },
  { id: 'resenas', label: '⭐ Mis Reseñas' },
  { id: 'descuentos', label: '🎁 Mis Descuentos' },  // ← NUEVO
  { id: 'solicitar', label: '🚀 Ser Vendedor', special: true }
];
  const renderContent = () => {
    switch (activeTab) {
        case 'pedidos': 
      return <MisPedidos />;
    case 'resenas': 
      return <MisResenas />;
    case 'descuentos':   // ← NUEVO
      return <MisDescuentos />;
    case 'vendedor': 
      return <SolicitarVendedor />;
    default:
        return (
          <>
            <div className="perfil-header">
              <h1 className="perfil-title">Mi perfil</h1>
              {!editando && <button className="perfil-edit-btn" onClick={() => setEditando(true)}>Editar perfil</button>}
            </div>

            {mensaje && <div className="perfil-message success">{mensaje}</div>}
            {errores.length > 0 && <div className="perfil-error-message">{errores.map(e => <div key={e}>⚠️ {e}</div>)}</div>}

            <div className="perfil-avatar">
              <div className="perfil-avatar-circle">
                {perfil.imagenPerfil ? <img src={perfil.imagenPerfil} alt="Perfil" className="perfil-avatar-image" /> : <span className="perfil-avatar-letter">{obtenerIniciales(user?.email)}</span>}
              </div>
              {editando && <label className="perfil-upload-btn"><input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} /> Cambiar foto</label>}
            </div>

            <div className="perfil-form-grid">
              <div className="perfil-field perfil-field-email"><label>Email</label><input type="email" value={user?.email || ''} disabled /></div>
              <div className="perfil-field"><label>Nombres</label><input name="nombres" value={perfil.nombres} onChange={handleChange} disabled={!editando} /></div>
              <div className="perfil-field"><label>Apellidos</label><input name="apellidos" value={perfil.apellidos} onChange={handleChange} disabled={!editando} /></div>
              <div className="perfil-field"><label>Teléfono</label><input name="telefono" value={perfil.telefono} onChange={handleChange} disabled={!editando} placeholder="Ej: 77777777" /></div>
              <div className="perfil-field"><label>Dirección</label><input name="direccion" value={perfil.direccion} onChange={handleChange} disabled={!editando} /></div>
              <div className="perfil-field"><label>Ciudad</label><input name="ciudad" value={perfil.ciudad} onChange={handleChange} disabled={!editando} /></div>
              <div className="perfil-field"><label>Método de pago</label><select name="metodoPago" value={perfil.metodoPago} onChange={handleChange} disabled={!editando}>
                <option value="tarjeta">💳 Tarjeta</option><option value="qr">📱 QR</option><option value="transferencia">🏦 Transferencia</option><option value="contraentrega">🚚 Contra entrega</option>
              </select></div>
            </div>

            {editando && <div className="perfil-actions"><button className="perfil-save-btn" onClick={guardarPerfilHandler} disabled={loading}>{loading ? 'Guardando...' : 'Guardar cambios'}</button><button className="perfil-cancel-btn" onClick={() => setEditando(false)}>Cancelar</button></div>}
          </>
        );
    }
  };

  return (
    <div className="perfil-container">
      <div className="perfil-content">
        <button onClick={onBack} className="carrito-btn-volver"><span>←</span> Volver a la tienda</button>

        <div className="perfil-card">
          {/* Barra de opciones */}
         <div className="perfil-options-bar">
  <button 
    className={`perfil-option-btn ${activeTab === 'perfil' ? 'perfil-option-btn-active' : ''}`}
    onClick={() => setActiveTab('perfil')}
  >
    👤 Mi Perfil
  </button>
  <button 
    className={`perfil-option-btn ${activeTab === 'pedidos' ? 'perfil-option-btn-active' : ''}`}
    onClick={() => setActiveTab('pedidos')}
  >
    📦 Mis Pedidos
  </button>
  <button 
    className={`perfil-option-btn ${activeTab === 'resenas' ? 'perfil-option-btn-active' : ''}`}
    onClick={() => setActiveTab('resenas')}
  >
    ⭐ Mis Reseñas
  </button>
  <button 
    className={`perfil-option-btn ${activeTab === 'descuentos' ? 'perfil-option-btn-active' : ''}`}
    onClick={() => setActiveTab('descuentos')}
  >
    🎁 Mis Descuentos
  </button>
  <button 
    className={`perfil-option-btn ${activeTab === 'vendedor' ? 'perfil-option-btn-active' : ''} perfil-option-danger`}
    onClick={() => setActiveTab('vendedor')}
  >
    🚀 Ser Vendedor
  </button>
</div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}