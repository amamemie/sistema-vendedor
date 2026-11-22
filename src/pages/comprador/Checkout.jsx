import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Checkout({ carrito, total, onConfirm, onBack }) {
  const { user } = useAuth();
  const [metodoPago, setMetodoPago] = useState('tarjeta');
  const [loading, setLoading] = useState(false);
  const [direccion, setDireccion] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simular proceso de pago
    setTimeout(() => {
      setLoading(false);
      onConfirm({
        metodoPago,
        direccion,
        fecha: new Date().toISOString()
      });
    }, 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f6f6f7' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
        <button onClick={onBack} style={{ marginBottom: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }}>← Volver al carrito</button>
        
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {/* Formulario de pago */}
          <div style={{ flex: 2, background: '#fff', borderRadius: 12, padding: 24 }}>
            <h2 style={{ marginBottom: 20 }}>Información de pago</h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Dirección de envío</label>
                <input
                  type="text"
                  required
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Calle, número, ciudad"
                  style={{ width: '100%', padding: 10, border: '1px solid #e2e8f0', borderRadius: 8 }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Método de pago</label>
                <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="radio" name="pago" value="tarjeta" checked={metodoPago === 'tarjeta'} onChange={(e) => setMetodoPago(e.target.value)} />
                    💳 Tarjeta de crédito/débito
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="radio" name="pago" value="qr" checked={metodoPago === 'qr'} onChange={(e) => setMetodoPago(e.target.value)} />
                    📱 Código QR
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="radio" name="pago" value="transferencia" checked={metodoPago === 'transferencia'} onChange={(e) => setMetodoPago(e.target.value)} />
                    🏦 Transferencia bancaria
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: 14, background: loading ? '#94a3b8' : '#1a1a1a',
                  color: '#fff', border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 16, fontWeight: 600
                }}
              >
                {loading ? 'Procesando pago...' : `Pagar Bs. ${total.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Resumen del pedido */}
          <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: 20, height: 'fit-content' }}>
            <h3 style={{ marginBottom: 16 }}>Tu pedido</h3>
            {carrito.slice(0, 3).map(item => (
              <div key={item.id_producto} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
                <span>{item.nombre} x{item.cantidad}</span>
                <span>Bs. {(item.precio_unitario * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
            {carrito.length > 3 && <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>... y {carrito.length - 3} más</div>}
            <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 12, paddingTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>Total</span>
                <span>Bs. {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}