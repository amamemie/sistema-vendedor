import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { solicitarSerVendedor } from './comprador.utils';
import './comprador.css';

export default function SolicitarVendedor() {
  const { user } = useAuth();
  const [solicitando, setSolicitando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [formData, setFormData] = useState({
    nombreEmpresa: '',
    nit_rut: '',
    telefono: '',
    direccion: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = user?.id || user?.id_usuario;
    
    if (!userId) {
      setMensaje('❌ Usuario no identificado');
      return;
    }
    
    setSolicitando(true);
    const result = await solicitarSerVendedor(userId, formData);
    setMensaje(result.success ? '✅ Solicitud enviada. Espera la aprobación del administrador.' : `❌ ${result.message}`);
    if (result.success) {
      setFormData({ nombreEmpresa: '', nit_rut: '', telefono: '', direccion: '' });
    }
    setTimeout(() => setMensaje(''), 5000);
    setSolicitando(false);
  };

  return (
    <div className="solicitar-vendedor-container">
      <div className="solicitar-vendedor-card">
        <div className="solicitar-vendedor-icon">🏪</div>
        <h2 className="solicitar-vendedor-title">¿Quieres vender en MarketPlace?</h2>
        <p className="solicitar-vendedor-desc">
          Convierte tu cuenta en vendedor y comienza a ofrecer tus productos a miles de compradores.
        </p>
        
        <div className="solicitar-beneficios">
          <h4>Beneficios de ser vendedor:</h4>
          <ul>
            <li>📈 Llega a más clientes</li>
            <li>💰 Comisiones bajas (solo 3%)</li>
            <li>📊 Estadísticas de ventas</li>
            <li>🛠️ Panel de gestión completo</li>
          </ul>
        </div>

        {mensaje && (
          <div className={`perfil-message ${mensaje.includes('✅') ? 'success' : 'error'}`}>
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre de la empresa *</label>
            <input 
              className="form-input" 
              name="nombreEmpresa" 
              value={formData.nombreEmpresa} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">NIT / RUT *</label>
            <input 
              className="form-input" 
              name="nit_rut" 
              value={formData.nit_rut} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono *</label>
            <input 
              className="form-input" 
              name="telefono" 
              value={formData.telefono} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Dirección</label>
            <input 
              className="form-input" 
              name="direccion" 
              value={formData.direccion} 
              onChange={handleChange} 
            />
          </div>
          <button 
            type="submit" 
            disabled={solicitando} 
            className="btn-primary" 
            style={{ width: '100%' }}
          >
            {solicitando ? 'Enviando...' : 'Solicitar ser vendedor'}
          </button>
        </form>
      </div>
    </div>
  );
}