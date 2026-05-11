import { useState } from 'react';

const PEDIDOS_MOCK = [
  { id: '#1041', cliente: 'Carlos Mendoza',  email: 'carlos@mail.com',  fecha: 'Hoy, 10:32 am',   estado: 'Pendiente', monto: 85.00,  items: 2 },
  { id: '#1040', cliente: 'Luisa Fernández', email: 'luisa@mail.com',   fecha: 'Ayer, 3:14 pm',   estado: 'Pagado',    monto: 210.00, items: 3 },
  { id: '#1039', cliente: 'Andrés Torres',   email: 'andres@mail.com',  fecha: '02 May, 9:00 am', estado: 'Pagado',    monto: 134.50, items: 1 },
  { id: '#1038', cliente: 'María López',     email: 'maria@mail.com',   fecha: '01 May, 5:45 pm', estado: 'Cancelado', monto: 60.00,  items: 1 },
  { id: '#1037', cliente: 'Juan Pérez',      email: 'juan@mail.com',    fecha: '30 Abr, 11:00 am',estado: 'Enviado',   monto: 320.00, items: 4 },
  { id: '#1036', cliente: 'Ana Gutiérrez',   email: 'ana@mail.com',     fecha: '29 Abr, 2:30 pm', estado: 'Pagado',    monto: 95.00,  items: 2 },
];

const estadoBadge = {
  Pendiente: { bg: '#fef3c7', color: '#92400e' },
  Pagado:    { bg: '#d1fae5', color: '#065f46' },
  Cancelado: { bg: '#fee2e2', color: '#991b1b' },
  Enviado:   { bg: '#dbeafe', color: '#1e40af' },
};

const FILTROS = ['Todos', 'Pendiente', 'Pagado', 'Enviado', 'Cancelado'];

export default function VendorPedidos() {
  const [filtro, setFiltro] = useState('Todos');

  const pedidosFiltrados = filtro === 'Todos'
    ? PEDIDOS_MOCK
    : PEDIDOS_MOCK.filter(p => p.estado === filtro);

  const total = pedidosFiltrados.reduce((acc, p) => acc + p.monto, 0);

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
          <input placeholder="Buscar pedidos..."
            style={{ border: 'none', background: 'transparent', fontSize: 13, outline: 'none', flex: 1 }} />
        </div>
        <button style={{
          width: 32, height: 32, border: '0.5px solid #e2e8f0', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#64748b', background: '#fff',
        }}><i className="ti ti-bell" /></button>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: '#0f172a' }}>Pedidos</h1>
            <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
              {pedidosFiltrados.length} pedidos · Total: ${total.toFixed(2)}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {FILTROS.map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                border: '0.5px solid',
                borderColor: filtro === f ? '#2563eb' : '#e2e8f0',
                background: filtro === f ? '#eff6ff' : '#fff',
                color: filtro === f ? '#2563eb' : '#64748b',
                fontWeight: filtro === f ? 500 : 400,
              }}>
              {f}
            </button>
          ))}
        </div>

        <div style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 80px',
            padding: '10px 16px', borderBottom: '0.5px solid #e2e8f0', background: '#f9fafb',
          }}>
            {['Pedido', 'Cliente', 'Fecha', 'Monto', 'Estado', 'Acción'].map(col => (
              <span key={col} style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {col}
              </span>
            ))}
          </div>

          {pedidosFiltrados.map((p, i) => (
            <div key={p.id}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 80px',
                padding: '12px 16px', alignItems: 'center',
                borderBottom: i < pedidosFiltrados.length - 1 ? '0.5px solid #f1f5f9' : 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: '#2563eb' }}>{p.id}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{p.cliente}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.email}</div>
              </div>
              <span style={{ fontSize: 12, color: '#64748b' }}>{p.fecha}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>${p.monto.toFixed(2)}</span>
              <span style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 600,
                display: 'inline-block', width: 'fit-content',
                background: estadoBadge[p.estado].bg, color: estadoBadge[p.estado].color,
              }}>{p.estado}</span>
              <button style={{
                padding: '5px 10px', fontSize: 11, border: '0.5px solid #e2e8f0',
                borderRadius: 6, cursor: 'pointer', background: '#fff', color: '#0f172a',
              }}>Ver</button>
            </div>
          ))}

          {pedidosFiltrados.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              <i className="ti ti-clipboard-off" style={{ fontSize: 32, display: 'block', marginBottom: 8 }} />
              No hay pedidos en esta categoría
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
