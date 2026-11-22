import { useState, useEffect } from 'react';
import { formatearFecha } from './admin.utils';
import './admin.css';
import { useTranslation } from 'react-i18next';
import { toast } from '../../components/ui/toast';

export default function SolicitudesVendedores() {
  const { t } = useTranslation();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(null);

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost/sistema-vendedor/backend/solicitudes_vendedores.php');
      const data = await response.json();
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const procesarSolicitud = async (idVendedor, accion) => {
    setProcesando(idVendedor);
    try {
      const response = await fetch('http://localhost/sistema-vendedor/backend/solicitudes_vendedores.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_vendedor: idVendedor, accion })
      });
      const result = await response.json();
      if (result.success) {
        toast(result.message);
        cargarSolicitudes();
      } else {
        toast(result.message, 'error');
      }
    } catch {
      toast(t('errors.connection'), 'error');
    }
    setProcesando(null);
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  if (loading) return <div className="skeleton" style={{ height: 240, borderRadius: 16 }} />;

  return (
    <div>
      {solicitudes.length === 0 ? (
        <div className="empty-state panel"><span className="empty-icon"><i className="ti ti-user-check" aria-hidden="true" /></span>{t('admin.requests.empty')}</div>
      ) : (
        <div className="stagger" style={{ display: 'grid', gap: 16 }}>
          {solicitudes.map((s, i) => (
            <div key={s.id_vendedor} className="panel" style={{ '--i': i, marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{s.nombre_tienda || t('admin.requests.noName')}</span>
                <span className="badge badge-warning">{t('productStatus.Pendiente')}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8, fontSize: 13.5, marginBottom: 16, color: 'var(--text-2)' }}>
                <div><strong>{t('vendor.company.nit')}:</strong> {s.documento_identidad || '—'}</div>
                <div><strong>{t('auth.phone')}:</strong> {s.telefono || '—'}</div>
                <div><strong>{t('auth.email')}:</strong> {s.email || '—'}</div>
                <div><strong>{t('vendor.company.address')}:</strong> {s.direccion || '—'}</div>
                <div><strong>{t('admin.requests.date')}:</strong> {formatearFecha(s.fecha_creacion)}</div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button className="admin-btn-danger" onClick={() => procesarSolicitud(s.id_vendedor, 'rechazar')} disabled={procesando === s.id_vendedor}>{t('admin.reject')}</button>
                <button className="admin-btn-success" onClick={() => procesarSolicitud(s.id_vendedor, 'aprobar')} disabled={procesando === s.id_vendedor}>{t('admin.approve')}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}