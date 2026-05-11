import { useState } from 'react';
import MetricCard from '../../components/vendor/MetricCard';

const VENTAS_SEMANA = [42, 78, 55, 120, 95, 140, 88];
const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MAX_VENTA = Math.max(...VENTAS_SEMANA);

const PEDIDOS = [
  { id: '#1041', nombre: 'Carlos Mendoza',  fecha: 'Hoy, 10:32 am',  estado: 'Pendiente', monto: '$85.00' },
  { id: '#1040', nombre: 'Luisa Fernández', fecha: 'Ayer, 3:14 pm',   estado: 'Pagado',    monto: '$210.00' },
  { id: '#1039', nombre: 'Andrés Torres',   fecha: '02 May',          estado: 'Pagado',    monto: '$134.50' },
  { id: '#1038', nombre: 'María López',     fecha: '01 May',          estado: 'Cancelado', monto: '$60.00' },
];

const STOCK = [
  { nombre: 'Camiseta Premium',   sku: 'SKU-0041', cantidad: 3,  icon: 'ti-shirt' },
  { nombre: 'Zapatillas Urbanas', sku: 'SKU-0028', cantidad: 1,  icon: 'ti-shoe' },
  { nombre: 'Mochila Canvas',     sku: 'SKU-0015', cantidad: 12, icon: 'ti-backpack' },
  { nombre: 'Lentes Sol Classic', sku: 'SKU-0033', cantidad: 0,  icon: 'ti-sunglasses' },
];

const estadoBadge = {
  Pendiente: { bg: '#fef3c7', color: '#92400e' },
  Pagado:    { bg: '#d1fae5', color: '#065f46' },
  Cancelado: { bg: '#fee2e2', color: '#991b1b' },
};

export default function VendorDashboard() {
  const [barActiva, setBarActiva] = useState(5);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <header style={{
        background: '#fff', borderBottom: '0.5px solid #e2e8f0',
        padding: '0 20px', height: 48,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          background: '#f6f6f7', border: '0.5px solid #e2e8f0',
          borderRadius: 8, padding: '0 12px', height: 32,
        }}>
          <i className="ti ti-search" style={{ fontSize: 14, color: '#94a3b8' }} />
          <input placeholder="Buscar productos, pedidos..."
            style={{ border: 'none', background: 'transparent', fontSize: 13, outline: 'none', flex: 1 }} />
        </div>
        <button style={{
          width: 32, height: 32, border: '0.5px solid #e2e8f0', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#64748b', background: '#fff',
        }}><i className="ti ti-bell" /></button>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        <div style={{
          background: '#fef9c3', border: '0.5px solid #fde047', borderRadius: 8,
          padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#854d0e',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <i className="ti ti-clock" style={{ fontSize: 16 }} />
          Tu cuenta está en revisión. Podrás publicar productos una vez que sea aprobada.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: '#0f172a' }}>Resumen</h1>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#0f172a', color: '#fff', border: 'none',
            borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600,
          }}>
            <i className="ti ti-plus" /> Agregar producto
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          <MetricCard label="Ventas del mes"   value="$1,240" change="+12% vs mes anterior" changeType="up" />
          <MetricCard label="Pedidos"           value="18"     change="+3 esta semana"       changeType="up" />
          <MetricCard label="Productos activos" value="7"      change="2 sin stock"          changeType="neutral" />
          <MetricCard label="Calificación"      value="4.8"    change="24 reseñas"           changeType="neutral" />
        </div>

        <div style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 10, padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Ventas de los últimos 7 días</span>
            <span style={{ fontSize: 12, color: '#2563eb', cursor: 'pointer' }}>Ver más</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
            {VENTAS_SEMANA.map((v, i) => (
              <div key={i} onClick={() => setBarActiva(i)} title={`$${v}`}
                style={{
                  flex: 1, borderRadius: '3px 3px 0 0', background: '#2563eb',
                  opacity: barActiva === i ? 1 : 0.15,
                  height: `${Math.round((v / MAX_VENTA) * 100)}%`,
                  cursor: 'pointer', transition: 'opacity .2s',
                }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            {DIAS.map((d, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: '#94a3b8' }}>{d}</div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12 }}>
          <div style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Pedidos recientes</span>
              <span style={{ fontSize: 12, color: '#2563eb', cursor: 'pointer' }}>Ver todos</span>
            </div>
            {PEDIDOS.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#2563eb', width: 60 }}>{p.id}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{p.nombre}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.fecha}</div>
                </div>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600, background: estadoBadge[p.estado].bg, color: estadoBadge[p.estado].color }}>{p.estado}</span>
                <span style={{ fontSize: 13, fontWeight: 600, width: 70, textAlign: 'right' }}>{p.monto}</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Stock bajo</span>
              <span style={{ fontSize: 12, color: '#2563eb', cursor: 'pointer' }}>Gestionar</span>
            </div>
            {STOCK.map((p) => (
              <div key={p.sku} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '0.5px solid #f1f5f9' }}>
                <div style={{ width: 36, height: 36, borderRadius: 6, flexShrink: 0, background: '#f8fafc', border: '0.5px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: 14 }}>
                  <i className={`ti ${p.icon}`} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{p.nombre}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.sku}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: p.cantidad <= 3 ? '#d97706' : '#059669' }}>{p.cantidad} und.</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
