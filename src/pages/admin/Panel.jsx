import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const NAV = [
  { icon: 'ti-layout-dashboard', label: 'Resumen',   key: 'resumen' },
  { icon: 'ti-users',            label: 'Usuarios',  key: 'usuarios' },
  { icon: 'ti-store',            label: 'Vendedores',key: 'vendedores' },
  { icon: 'ti-user-plus',        label: 'Crear Vendedor', key: 'crear-vendedor' },
  { icon: 'ti-chart-bar',        label: 'Reportes',  key: 'reportes' },
];

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const [activeKey, setActiveKey] = useState('resumen');
  const [usuarios, setUsuarios] = useState([]);
  const [searchUsuarios, setSearchUsuarios] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [vendedores, setVendedores] = useState([]);
  const [searchVendedores, setSearchVendedores] = useState('');
  const [loadingVendedores, setLoadingVendedores] = useState(false);
  const [statsData, setStatsData] = useState({ compradores: '0', vendedores: '0', pedidos: '0', ingresos: '0.00' });

  const [formData, setFormData] = useState({
    email: '', password: '', nombres: '', apellidos: '', 
    telefono: '', tipo_persona: 'Natural', documento_identidad: '',
    direccion: '', ciudad: '', pais: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });

  // ── ESTADOS PARA REPORTES ──
  const [activeReport, setActiveReport] = useState('ganancias'); // 'ganancias', 'vendedores', 'compradores', 'productos'
  const [reporteFechas, setReporteFechas] = useState({ inicio: '', fin: '' });
  const [reporteData, setReporteData] = useState({ total: 0, detalles: [] });
  const [vendedoresReport, setVendedoresReport] = useState([]);
  const [compradoresReport, setCompradoresReport] = useState([]);
  const [productosReport, setProductosReport] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);

  const fetchActiveReport = async (isInitial = false) => {
    if (!isInitial && (!reporteFechas.inicio || !reporteFechas.fin)) {
      alert('Por favor selecciona ambas fechas');
      return;
    }

    setLoadingReport(true);
    
    const endpoints = {
      ganancias: 'admin_reporte_ganancias.php',
      vendedores: 'admin_reporte_vendedores.php',
      compradores: 'admin_reporte_compradores.php',
      productos: 'admin_reporte_productos.php'
    };

    const data = await api.post(endpoints[activeReport], {
      fecha_inicio: reporteFechas.inicio || null,
      fecha_fin: reporteFechas.fin || null
    });

    if (data.success) {
      if (activeReport === 'ganancias') {
        setReporteData({ total: data.total, detalles: data.detalles });
      } else if (activeReport === 'vendedores') {
        setVendedoresReport(data.detalles);
      } else if (activeReport === 'compradores') {
        setCompradoresReport(data.detalles);
      } else if (activeReport === 'productos') {
        setProductosReport(data.detalles);
      }
    } else {
      alert(data.message || 'Error al obtener el reporte');
    }
    setLoadingReport(false);
  };

  const generatePDF = () => {
    try {
      // Determinar qué datos se van a exportar basándose en lo que hay actualmente en el estado
      let currentData = [];
      if (activeReport === 'ganancias') currentData = reporteData.detalles || [];
      else if (activeReport === 'vendedores') currentData = vendedoresReport || [];
      else if (activeReport === 'compradores') currentData = compradoresReport || [];
      else if (activeReport === 'productos') currentData = productosReport || [];

      if (!currentData || currentData.length === 0) {
        alert("No hay datos cargados para generar este reporte. Intenta buscar o actualizar la tabla.");
        return;
      }

      const doc = new jsPDF();
      const reportTitle = activeReport.charAt(0).toUpperCase() + activeReport.slice(1);
      const dateInfo = reporteFechas.inicio && reporteFechas.fin 
        ? `Periodo: ${reporteFechas.inicio} hasta ${reporteFechas.fin}` 
        : 'Reporte: Consolidado Histórico General';
      
      // Encabezado
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42); // Navy Dark
      doc.text('MARKETPLACE - SISTEMA DE VENTAS', 14, 15);
      
      doc.setFontSize(14);
      doc.setTextColor(124, 58, 237); // Indigo/Violeta
      doc.text(`Reporte Detallado de ${reportTitle}`, 14, 25);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(dateInfo, 14, 32);
      doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 38);

      let headers = [];
      let dataRows = [];

      if (activeReport === 'ganancias') {
        headers = [['ID Pago', 'Fecha', 'Venta Bruta', '% Com.', 'Ganancia Neto']];
        dataRows = currentData.map(d => [
          `#${d.id_pago}`, 
          d.fecha_pago ? new Date(d.fecha_pago).toLocaleDateString('es-ES') : 'N/A', 
          `$${Number(d.pago_total || 0).toFixed(2)}`, 
          `${d.porcentaje}%`, 
          `$${Number(d.comision_monto || 0).toFixed(2)}`
        ]);
        dataRows.push(['', '', '', 'TOTAL GANANCIAS:', `$${Number(reporteData.total || 0).toFixed(2)}`]);
      } else if (activeReport === 'vendedores') {
        headers = [['Vendedor', 'Email', 'Cant. Pedidos', 'Volumen Ventas']];
        dataRows = currentData.map(v => [`${v.nombres} ${v.apellidos}`, v.email, v.total_pedidos, `$${Number(v.total_ventas || 0).toFixed(2)}`]);
      } else if (activeReport === 'compradores') {
        headers = [['Cliente', 'Email', 'Compras Realizadas', 'Inversión Total']];
        dataRows = currentData.map(c => [`${c.nombres} ${c.apellidos}`, c.email, c.total_compras, `$${Number(c.total_gastado || 0).toFixed(2)}`]);
      } else if (activeReport === 'productos') {
        headers = [['Nombre Producto', 'Tienda', 'Unidades Vendidas', 'Monto Generado']];
        dataRows = currentData.map(p => [p.nombre, p.nombre_tienda, p.total_unidades, `$${Number(p.total_monto || 0).toFixed(2)}`]);
      }

      autoTable(doc, {
        head: headers,
        body: dataRows,
        startY: 45,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [124, 58, 237], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didParseCell: function (data) {
          if (activeReport === 'ganancias' && data.row.index === dataRows.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [240, 253, 244]; // Verde muy claro
            data.cell.styles.textColor = [21, 128, 61];  // Verde oscuro
          }
        }
      });

      // Pie de página con numeración
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      for(let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.text(`Página ${i} de ${pageCount} - Generado por Sistema Administrativo`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, {align: 'center'});
      }

      doc.save(`Reporte_${activeReport}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Ocurrió un error al intentar crear el documento PDF.");
    }
  };

  const initials = user?.email?.substring(0, 2).toUpperCase() ?? 'AD';

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateVendedor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const data = await api.post('admin_crear_vendedor.php', formData);
    setFormMsg({ type: data.success ? 'success' : 'error', text: data.message });
    if (data.success) setFormData({ 
      email: '', password: '', nombres: '', apellidos: '', 
      telefono: '', tipo_persona: 'Natural', documento_identidad: '',
      direccion: '', ciudad: '', pais: ''
    });
    setSubmitting(false);
  };

  const handleToggleUserStatus = async (id_usuario, currentEstado) => {
    const isActivo = currentEstado?.toLowerCase() === 'activo';
    const confirmMsg = isActivo ? '¿Desactivar este usuario?' : '¿Activar este usuario?';
    if (!window.confirm(confirmMsg)) return;
    
    const nuevoEstado = isActivo ? 'Inactivo' : 'Activo';
    const res = await api.post('admin_toggle_usuario.php', { id_usuario, estado: nuevoEstado });
    if (res.success) {
      setUsuarios(prev => prev.map(u => u.id_usuario === id_usuario ? { ...u, estado: nuevoEstado } : u));
      // Limpiar datos relacionados para forzar recarga al cambiar de pestaña
      setVendedores([]);
      setStatsData({ compradores: '0', vendedores: '0', pedidos: '0', ingresos: '0.00' });
    } else {
      alert(res.message || 'Error al actualizar el estado');
    }
  };

  const handleSetPending = async (id_usuario) => {
    if (!window.confirm('¿Marcar este usuario como Pendiente?')) return;
    
    const res = await api.post('admin_toggle_usuario.php', { id_usuario, estado: 'Pendiente' });
    if (res.success) {
      setUsuarios(prev => prev.map(u => u.id_usuario === id_usuario ? { ...u, estado: 'Pendiente' } : u));
      // Limpiar datos relacionados para forzar recarga
      setVendedores([]);
      setStatsData({ compradores: '0', vendedores: '0', pedidos: '0', ingresos: '0.00' });
    } else {
      alert(res.message || 'Error al actualizar el estado');
    }
  };

  useEffect(() => {
    if (activeKey === 'resumen') {
      api.get('admin_stats.php').then(data => data.success && setStatsData(data));
    }
    if (activeKey === 'usuarios') {
      setLoadingUsers(true);
      api.get('usuarios.php')
        .then(data => setUsuarios(Array.isArray(data) ? data : []))
        .finally(() => setLoadingUsers(false));
    }
    if (activeKey === 'vendedores') {
      setLoadingVendedores(true);
      api.get('vendedores.php').then(data => setVendedores(Array.isArray(data) ? data : [])).finally(() => setLoadingVendedores(false));
    }
    if (activeKey === 'reportes') {
      fetchActiveReport(true);
    }
  }, [activeKey, activeReport]);

  // Lógica de búsqueda
  const filteredUsuarios = usuarios.filter(u => 
    u.email?.toLowerCase().includes(searchUsuarios.toLowerCase()) ||
    u.rol?.toLowerCase().includes(searchUsuarios.toLowerCase()) ||
    u.estado?.toLowerCase().includes(searchUsuarios.toLowerCase())
  );

  const filteredVendedores = vendedores.filter(v => 
    v.nombres?.toLowerCase().includes(searchVendedores.toLowerCase()) ||
    v.apellidos?.toLowerCase().includes(searchVendedores.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchVendedores.toLowerCase())
  );

  const STATS_CARDS = [
    { label: 'Compradores',      value: statsData.compradores, icon: 'ti-users',      color: '#2563eb' },
    { label: 'Vendedores activos',value: statsData.vendedores,  icon: 'ti-store',     color: '#059669' },
    { label: 'Pedidos del mes',   value: statsData.pedidos,     icon: 'ti-shopping-cart', color: '#d97706' },
    { label: 'Ingresos del mes',  value: `$${statsData.ingresos}`, icon: 'ti-cash',  color: '#7c3aed' },
  ];

  const REPORT_TABS = [
    { key: 'ganancias', label: 'Ganancias', icon: 'ti-cash' },
    { key: 'vendedores', label: 'Vendedores', icon: 'ti-store' },
    { key: 'compradores', label: 'Compradores', icon: 'ti-users' },
    { key: 'productos', label: 'Ventas Productos', icon: 'ti-package' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Sidebar admin */}
      <aside style={{
        width: 220, background: '#0f172a', display: 'flex',
        flexDirection: 'column', flexShrink: 0, height: '100vh',
        position: 'sticky', top: 0,
      }}>
        <div style={{
          padding: '16px 18px', borderBottom: '0.5px solid #1e293b',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: '#7c3aed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 600,
          }}>{initials}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>Admin</div>
            <div style={{ color: '#64748b', fontSize: 11 }}>{user?.email}</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '8px 0' }}>
          {NAV.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveKey(item.key)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 18px', background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'left', fontSize: 13,
                color: activeKey === item.key ? '#fff' : '#94a3b8',
                backgroundColor: activeKey === item.key ? '#1e293b' : 'transparent',
                borderLeft: activeKey === item.key ? '2px solid #7c3aed' : '2px solid transparent',
              }}
            >
              <i className={`ti ${item.icon}`} style={{ fontSize: 16 }} aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ borderTop: '0.5px solid #1e293b', padding: '8px 0' }}>
          <button
            onClick={logout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 18px', background: 'none', border: 'none',
              cursor: 'pointer', color: '#94a3b8', fontSize: 13,
            }}
          >
            <i className="ti ti-logout" style={{ fontSize: 16 }} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          background: 'var(--color-background-primary)',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 24px', height: 56,
          display: 'flex', alignItems: 'center',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#0f172a' }}>
            Panel de Administración
          </h2>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: 20 }}>

          {/* ── RESUMEN ── */}
          {activeKey === 'resumen' && (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#0f172a' }}>Resumen general</h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
                {STATS_CARDS.map(s => (
                  <div key={s.label} style={{
                    background: 'var(--color-background-primary)',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12, padding: '24px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, background: s.color + '1a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: s.color, fontSize: 20,
                    }}>
                      <i className={`ti ${s.icon}`} aria-hidden="true" />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2, fontWeight: 500 }}>{s.label}</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                background: 'var(--color-background-primary)',
                border: '1px solid #e2e8f0',
                borderRadius: 12, padding: 24,
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                  Bienvenido al panel de administración. Usa el menú lateral para gestionar usuarios, vendedores y reportes.
                </p>
              </div>
            </>
          )}

          {/* ── USUARIOS ── */}
          {activeKey === 'usuarios' && (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Usuarios del sistema</h1>
              
              {/* Buscador de Usuarios */}
              <div style={{ marginBottom: 20, position: 'relative', maxWidth: 400 }}>
                <i className="ti ti-search" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: 16 }} />
                <input 
                  type="text" 
                  placeholder="Buscar por email, rol o estado..." 
                  value={searchUsuarios}
                  onChange={(e) => setSearchUsuarios(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 40, fontSize: 14, height: 42, border: '1px solid #e2e8f0' }}
                />
              </div>

              <div style={{
                background: 'var(--color-background-primary)',
                border: '1px solid #e2e8f0',
                borderRadius: 12, overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '50px 2fr 1fr 1fr 150px',
                  padding: '12px 20px', borderBottom: '1px solid #e2e8f0',
                  background: '#f9fafb',
                }}>
                  {['ID', 'Email', 'Rol', 'Estado', 'Acciones'].map(c => (
                    <span key={c} style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c}</span>
                  ))}
                </div>

                {loadingUsers && (
                  <div style={{ padding: 30, textAlign: 'center', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    Cargando usuarios...
                  </div>
                )}

                {!loadingUsers && filteredUsuarios.map((u, i) => (
                  <div key={u.id_usuario} style={{
                    display: 'grid', gridTemplateColumns: '50px 2fr 1fr 1fr 150px',
                    padding: '14px 20px', alignItems: 'center',
                    borderBottom: i < filteredUsuarios.length - 1 ? '1px solid #f1f5f9' : 'none',
                  }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>#{u.id_usuario}</span>
                    <span style={{ fontSize: 13 }}>{u.email}</span>
                    <span style={{
                      fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 500,
                      display: 'inline-block', width: 'fit-content',
                      background: u.rol === 'Admin' ? '#ede9fe' : u.rol === 'Vendedor' ? '#dbeafe' : '#f0fdf4',
                      color: u.rol === 'Admin' ? '#6d28d9' : u.rol === 'Vendedor' ? '#1d4ed8' : '#166534',
                    }}>
                      {u.rol}
                    </span>
                    <span style={{
                      fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 500,
                      display: 'inline-block', width: 'fit-content',
                      background: u.estado?.toLowerCase() === 'activo' 
                        ? '#d1fae5' 
                        : (u.estado?.toLowerCase() === 'pendiente' ? '#fef3c7' : '#fee2e2'),
                      color: u.estado?.toLowerCase() === 'activo' 
                        ? '#065f46' 
                        : (u.estado?.toLowerCase() === 'pendiente' ? '#92400e' : '#991b1b'),
                    }}>
                      {u.estado || 'Inactivo'}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button 
                        onClick={() => handleToggleUserStatus(u.id_usuario, u.estado)}
                        title={u.estado?.toLowerCase() === 'activo' ? 'Desactivar' : 'Activar'}
                        style={{
                          width: 28, height: 28, border: u.estado?.toLowerCase() === 'activo' ? '0.5px solid #fecaca' : '0.5px solid #bbf7d0',
                          borderRadius: 6, cursor: 'pointer', background: u.estado?.toLowerCase() === 'activo' ? '#fef2f2' : '#f0fdf4',
                          color: u.estado?.toLowerCase() === 'activo' ? '#dc2626' : '#16a34a', fontSize: 13,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                        <i className={`ti ${u.estado?.toLowerCase() === 'activo' ? 'ti-user-off' : 'ti-user-check'}`} aria-hidden="true" />
                      </button>
                      <button 
                        onClick={() => handleSetPending(u.id_usuario)}
                        title="Marcar como Pendiente"
                        style={{
                          width: 28, height: 28, border: '0.5px solid #fef3c7',
                          borderRadius: 6, cursor: 'pointer', background: '#fffbeb',
                          color: '#d97706', fontSize: 13,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                        <i className="ti ti-clock" aria-hidden="true" />
                      </button>
                      <button style={{
                        width: 28, height: 28, border: '0.5px solid #dbeafe',
                        borderRadius: 6, cursor: 'pointer', background: '#eff6ff',
                        color: '#2563eb', fontSize: 13,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <i className="ti ti-edit" aria-hidden="true" />
                      </button>
                      <button style={{
                        width: 28, height: 28, border: '0.5px solid #fecaca',
                        borderRadius: 6, cursor: 'pointer', background: '#fef2f2',
                        color: '#dc2626', fontSize: 13,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <i className="ti ti-trash" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}

                {!loadingUsers && filteredUsuarios.length === 0 && (
                  <div style={{ padding: 30, textAlign: 'center', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    No se encontraron usuarios o hubo un error de conexión.
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── VENDEDORES ── */}
          {activeKey === 'vendedores' && (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Vendedores registrados</h1>
              
              {/* Buscador de Vendedores */}
              <div style={{ marginBottom: 20, position: 'relative', maxWidth: 400 }}>
                <i className="ti ti-search" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: 16 }} />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre o email..." 
                  value={searchVendedores}
                  onChange={(e) => setSearchVendedores(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 35, fontSize: 13, height: 38 }}
                />
              </div>

              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '50px 2fr 1.5fr 1fr 100px', padding: '12px 20px', background: '#f9fafb', borderBottom: '1px solid #e2e8f0' }}>
                  {['ID', 'Nombre', 'Email', 'Doc', 'Estado'].map(h => <span key={h} style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{h}</span>)}
                </div>
                {!loadingVendedores && filteredVendedores.map(v => (
                  <div key={v.id_vendedor} style={{ display: 'grid', gridTemplateColumns: '50px 2fr 1.5fr 1fr 100px', padding: '14px 20px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                    <span style={{ fontSize: 12 }}>#{v.id_vendedor}</span>
                    <span style={{ fontSize: 13 }}>{v.nombres} {v.apellidos}</span>
                    <span style={{ fontSize: 13 }}>{v.email}</span>
                    <span style={{ fontSize: 12 }}>{v.documento_identidad}</span>
                    <span style={{ fontSize: 11, background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: 10 }}>{v.estado}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── CREAR VENDEDOR ── */}
          {activeKey === 'crear-vendedor' && (
            <div style={{ 
              background: '#fff', 
              border: '1px solid #e2e8f0', 
              borderRadius: 16, 
              padding: 32, 
              maxWidth: 640, 
              margin: '20px auto',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, color: '#0f172a' }}>Registrar Nuevo Vendedor</h2>
              <form onSubmit={handleCreateVendedor} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <input name="nombres" placeholder="Nombres" required value={formData.nombres} onChange={handleFormChange} style={inputStyle} />
                  <input name="apellidos" placeholder="Apellidos" required value={formData.apellidos} onChange={handleFormChange} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input name="email" type="email" placeholder="Email" required value={formData.email} onChange={handleFormChange} style={inputStyle} />
                  <input name="password" type="password" placeholder="Contraseña" required value={formData.password} onChange={handleFormChange} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleFormChange} style={inputStyle} />
                  <select name="tipo_persona" value={formData.tipo_persona} onChange={handleFormChange} style={inputStyle}>
                    <option value="Natural">Natural</option>
                    <option value="Juridica">Jurídica</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input name="documento_identidad" placeholder="Documento / NIT" required value={formData.documento_identidad} onChange={handleFormChange} style={inputStyle} />
                  <input name="pais" placeholder="País" value={formData.pais} onChange={handleFormChange} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
                  <input name="ciudad" placeholder="Ciudad" value={formData.ciudad} onChange={handleFormChange} style={inputStyle} />
                  <input name="direccion" placeholder="Dirección completa" value={formData.direccion} onChange={handleFormChange} style={inputStyle} />
                </div>
                {formMsg.text && <div style={{ fontSize: 13, color: formMsg.type === 'success' ? 'green' : 'red' }}>{formMsg.text}</div>}
                <button type="submit" disabled={submitting} style={{ 
                  background: '#7c3aed', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '12px', 
                  borderRadius: 10, 
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                  marginTop: 8,
                  boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.2)'
                }}>
                  {submitting ? 'Procesando...' : 'Crear Cuenta de Vendedor'}
                </button>
              </form>
            </div>
          )}

          {/* ── REPORTES ── */}
          {activeKey === 'reportes' && (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Centro de Reportes</h1>
              
              {/* Sub-navbar de Reportes */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #e2e8f0' }}>
                {REPORT_TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveReport(tab.key)}
                    style={{
                      padding: '14px 24px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 600,
                      color: activeReport === tab.key ? '#7c3aed' : '#64748b',
                      borderBottom: activeReport === tab.key ? '2px solid #7c3aed' : '2px solid transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: '0.2s'
                    }}
                  >
                    <i className={`ti ${tab.icon}`} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ 
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, 
                padding: 20, marginBottom: 24, display: 'flex', gap: 16, alignItems: 'flex-end',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#64748b', display: 'block', marginBottom: 6 }}>Fecha Inicio</label>
                  <input 
                    type="date" 
                    value={reporteFechas.inicio} 
                    onChange={e => setReporteFechas({...reporteFechas, inicio: e.target.value})}
                    style={{ ...inputStyle, border: '1px solid #cbd5e1', fontWeight: '500' }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#64748b', display: 'block', marginBottom: 6 }}>Fecha Fin</label>
                  <input 
                    type="date" 
                    value={reporteFechas.fin} 
                    onChange={e => setReporteFechas({...reporteFechas, fin: e.target.value})}
                    style={{ ...inputStyle, border: '1px solid #cbd5e1', fontWeight: '500' }} 
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button 
                    onClick={() => fetchActiveReport(false)}
                    disabled={loadingReport}
                    style={{
                      background: '#7c3aed', color: '#fff', border: 'none', 
                      padding: '12px 24px', borderRadius: 10, cursor: 'pointer', 
                      fontWeight: 600, fontSize: 14, boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.2)',
                      minWidth: 160
                    }}
                  >
                    {loadingReport ? 'Cargando...' : 'Actualizar Reporte'}
                  </button>
                  <button 
                    onClick={generatePDF}
                    title="Descargar PDF"
                    style={{
                      background: '#0f172a', color: '#fff', border: 'none',
                      padding: '12px 20px', borderRadius: 10, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 8, fontWeight: 600, fontSize: 14,
                      transition: 'background 0.2s'
                    }}
                  >
                    <i className="ti ti-file-download" style={{ fontSize: 18 }} />
                    Generar Reporte PDF
                  </button>
                </div>
              </div>

              {/* Renderizado condicional según el reporte activo */}
              {activeReport === 'ganancias' && (reporteData.detalles.length > 0 || reporteData.total > 0) && (
                <>
                  <div style={{
                    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, 
                    padding: '24px', marginBottom: 24, textAlign: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4, fontWeight: 500 }}>Ganancias Totales (Comisiones)</div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: '#059669' }}>${Number(reporteData.total).toFixed(2)}</div>
                  </div>

                  <div style={{ 
                    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, 
                    overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                  }}>
                    <div style={{ 
                      display: 'grid', gridTemplateColumns: '100px 2fr 1fr 1fr 1fr', 
                      padding: '12px 20px', background: '#f9fafb', borderBottom: '1px solid #e2e8f0' 
                    }}>
                      {['ID Pago', 'Fecha', 'Venta Total', '% Com.', 'Ganancia'].map(h => (
                        <span key={h} style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{h}</span>
                      ))}
                    </div>
                    {reporteData.detalles.map((d, i) => (
                      <div key={i} style={{ 
                        display: 'grid', gridTemplateColumns: '100px 2fr 1fr 1fr 1fr', 
                        padding: '14px 20px', borderBottom: i < reporteData.detalles.length - 1 ? '1px solid #f1f5f9' : 'none', 
                        alignItems: 'center' 
                      }}>
                        <span style={{ fontSize: 12, color: '#64748b' }}>#{d.id_pago}</span>
                        <span style={{ 
                          fontSize: 12, 
                          background: '#f1f5f9', 
                          padding: '4px 10px', 
                          borderRadius: '6px', 
                          color: '#334155', 
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <i className="ti ti-calendar" style={{ color: '#7c3aed' }} />
                          {new Date(d.fecha_pago).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                        <span style={{ fontSize: 13 }}>${Number(d.pago_total).toFixed(2)}</span>
                        <span style={{ fontSize: 13 }}>{d.porcentaje}%</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#059669' }}>${Number(d.comision_monto).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeReport === 'vendedores' && vendedoresReport.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr', padding: '12px 20px', background: '#f9fafb', borderBottom: '1px solid #e2e8f0' }}>
                    {['Vendedor', 'Email', 'Ventas Realizadas', 'Monto Total'].map(h => <span key={h} style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{h}</span>)}
                  </div>
                  {vendedoresReport.map((v, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr', padding: '14px 20px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{v.nombres} {v.apellidos}</span>
                      <span style={{ fontSize: 13, color: '#64748b' }}>{v.email}</span>
                      <span style={{ fontSize: 13 }}>{v.total_pedidos} pedidos</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#7c3aed' }}>${Number(v.total_ventas).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeReport === 'compradores' && compradoresReport.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr', padding: '12px 20px', background: '#f9fafb', borderBottom: '1px solid #e2e8f0' }}>
                    {['Comprador', 'Email', 'Compras', 'Total Gastado'].map(h => <span key={h} style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{h}</span>)}
                  </div>
                  {compradoresReport.map((c, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr', padding: '14px 20px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{c.nombres} {c.apellidos}</span>
                      <span style={{ fontSize: 13, color: '#64748b' }}>{c.email}</span>
                      <span style={{ fontSize: 13 }}>{c.total_compras} compras</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#2563eb' }}>${Number(c.total_gastado).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeReport === 'productos' && productosReport.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', padding: '12px 20px', background: '#f9fafb', borderBottom: '1px solid #e2e8f0' }}>
                    {['Producto', 'Tienda', 'Unid. Vendidas', 'Ingresos'].map(h => <span key={h} style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{h}</span>)}
                  </div>
                  {productosReport.map((p, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', padding: '14px 20px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{p.nombre}</span>
                      <span style={{ fontSize: 13, color: '#64748b' }}>{p.nombre_tienda}</span>
                      <span style={{ fontSize: 13 }}>{p.total_unidades} unid.</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#059669' }}>${Number(p.total_monto).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {!loadingReport && (
                (activeReport === 'ganancias' && reporteData.detalles.length === 0) ||
                (activeReport === 'vendedores' && vendedoresReport.length === 0) ||
                (activeReport === 'compradores' && compradoresReport.length === 0) ||
                (activeReport === 'productos' && productosReport.length === 0)
              ) && (
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 40, textAlign: 'center' }}>
                  <i className="ti ti-chart-bar" style={{ fontSize: 40, color: '#cbd5e1', marginBottom: 12, display: 'block' }} />
                  <p style={{ color: '#64748b', fontSize: 14 }}>No hay datos registrados para este reporte en el rango seleccionado.</p>
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  background: '#f8fafc',
  color: '#0f172a'
};
