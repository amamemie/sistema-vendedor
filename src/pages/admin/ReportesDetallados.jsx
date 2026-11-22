import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { toast } from '../../components/ui/toast';
import { exportToExcel } from '../../utils/exportUtils';
import { formatMoney, formatDate, formatNumber } from '../../i18n/format';

const TIPOS = [
  { key: 'ganancias', icon: 'ti-coins' },
  { key: 'vendedores', icon: 'ti-building-store' },
  { key: 'compradores', icon: 'ti-users' },
  { key: 'productos', icon: 'ti-package' },
];

/**
 * Reportes detallados por rango de fechas (endpoints admin_reporte_*.php),
 * con exportación a PDF (jsPDF + autotable) y Excel.
 */
export default function ReportesDetallados() {
  const { t } = useTranslation();
  const [tipo, setTipo] = useState('ganancias');
  const [fechas, setFechas] = useState({ inicio: '', fin: '' });
  const [datos, setDatos] = useState({ total: 0, detalles: [] });
  const [loading, setLoading] = useState(true);

  const cargar = async (tipoActual = tipo, conFechas = false) => {
    if (conFechas && (!fechas.inicio || !fechas.fin)) {
      toast(t('admin.detailed.pickDates'), 'info');
      return;
    }
    setLoading(true);
    const res = await api.getReporteAdmin(tipoActual, conFechas ? fechas.inicio : null, conFechas ? fechas.fin : null);
    if (res.success) setDatos({ total: Number(res.total || 0), detalles: Array.isArray(res.detalles) ? res.detalles : [] });
    else toast(res.message || t('errors.generic'), 'error');
    setLoading(false);
  };

  useEffect(() => {
    cargar(tipo, Boolean(fechas.inicio && fechas.fin));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo]);

  // Columnas de cada reporte: [encabezado, valor para tabla/PDF, ¿numérica?]
  const columnas = {
    ganancias: [
      [t('admin.detailed.cols.payment'), (d) => `#${d.id_pago}`],
      [t('common.date'), (d) => formatDate(d.fecha_pago)],
      [t('admin.detailed.cols.gross'), (d) => formatMoney(d.pago_total), true],
      [t('admin.detailed.cols.pct'), (d) => `${Number(d.porcentaje)}%`, true],
      [t('admin.reports.commission'), (d) => formatMoney(d.comision_monto), true],
    ],
    vendedores: [
      [t('roles.seller'), (d) => `${d.nombres || ''} ${d.apellidos || ''}`.trim()],
      [t('auth.email'), (d) => d.email || '—'],
      [t('admin.reports.orders'), (d) => formatNumber(d.total_pedidos), true],
      [t('admin.detailed.cols.sales'), (d) => formatMoney(d.total_ventas), true],
    ],
    compradores: [
      [t('roles.buyer'), (d) => `${d.nombres || ''} ${d.apellidos || ''}`.trim()],
      [t('auth.email'), (d) => d.email || '—'],
      [t('admin.detailed.cols.purchases'), (d) => formatNumber(d.total_compras), true],
      [t('vendor.analytics.spent'), (d) => formatMoney(d.total_gastado), true],
    ],
    productos: [
      [t('vendor.products.product'), (d) => d.nombre],
      [t('store.store'), (d) => d.nombre_tienda],
      [t('vendor.analytics.quantity'), (d) => formatNumber(d.total_unidades), true],
      [t('admin.detailed.cols.amount'), (d) => formatMoney(d.total_monto), true],
    ],
  }[tipo];

  const titulo = t(`admin.detailed.types.${tipo}`);
  const periodo = fechas.inicio && fechas.fin
    ? t('admin.detailed.period', { from: formatDate(fechas.inicio), to: formatDate(fechas.fin) })
    : t('admin.detailed.allTime');

  const exportarPDF = async () => {
    if (!datos.detalles.length) return toast(t('export.empty'), 'info');
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
      const doc = new jsPDF();
      doc.setFontSize(17);
      doc.setTextColor(17, 20, 19);
      doc.text('MarketPlace Paceño', 14, 16);
      doc.setFontSize(13);
      doc.setTextColor(11, 122, 79);
      doc.text(titulo, 14, 25);
      doc.setFontSize(9.5);
      doc.setTextColor(110);
      doc.text(periodo, 14, 32);
      doc.text(t('admin.detailed.generated', { date: new Date().toLocaleString() }), 14, 37);
      const body = datos.detalles.map((d) => columnas.map(([, f]) => String(f(d))));
      if (tipo === 'ganancias') body.push(['', '', '', t('common.total'), formatMoney(datos.total)]);
      autoTable(doc, {
        head: [columnas.map(([h]) => h)],
        body,
        startY: 43,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 2.6 },
        headStyles: { fillColor: [17, 20, 19], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [246, 246, 241] },
        columnStyles: Object.fromEntries(columnas.map((c, i) => [i, c[2] ? { halign: 'right' } : {}])),
        didParseCell: (cell) => {
          if (tipo === 'ganancias' && cell.section === 'body' && cell.row.index === body.length - 1) {
            cell.cell.styles.fontStyle = 'bold';
            cell.cell.styles.fillColor = [225, 244, 234];
            cell.cell.styles.textColor = [11, 122, 79];
          }
        },
      });
      const pages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(140);
        doc.text(t('admin.detailed.page', { n: i, total: pages }), doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 8, { align: 'center' });
      }
      doc.save(`reporte_${tipo}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error(e);
      toast(t('admin.detailed.pdfError'), 'error');
    }
  };

  const exportarExcel = () =>
    exportToExcel(datos.detalles.map((d) => Object.fromEntries(columnas.map(([h, f]) => [h, f(d)]))), `reporte_${tipo}`, titulo);

  return (
    <section className="panel">
      <header className="panel-head" style={{ flexWrap: 'wrap' }}>
        <div>
          <h2>{t('admin.detailed.title')}</h2>
          <p>{periodo}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={exportarPDF}><i className="ti ti-file-type-pdf" aria-hidden="true" /> PDF</button>
          <button type="button" className="btn btn-outline btn-sm" onClick={exportarExcel}><i className="ti ti-file-spreadsheet" aria-hidden="true" /> Excel</button>
        </div>
      </header>

      <div className="report-controls">
        <div className="segmented" role="tablist" aria-label={t('admin.reports.type')}>
          {TIPOS.map((x) => (
            <button key={x.key} type="button" role="tab" aria-selected={tipo === x.key} onClick={() => setTipo(x.key)}>
              <i className={`ti ${x.icon}`} aria-hidden="true" /> {t(`admin.detailed.types.${x.key}`)}
            </button>
          ))}
        </div>
        <div className="report-dates">
          <label className="field">
            <span className="field-label">{t('common.from')}</span>
            <input className="input" type="date" value={fechas.inicio} onChange={(e) => setFechas({ ...fechas, inicio: e.target.value })} />
          </label>
          <label className="field">
            <span className="field-label">{t('common.to')}</span>
            <input className="input" type="date" value={fechas.fin} onChange={(e) => setFechas({ ...fechas, fin: e.target.value })} />
          </label>
          <button type="button" className="btn btn-primary" onClick={() => cargar(tipo, true)}>{t('common.applyFilter')}</button>
          {(fechas.inicio || fechas.fin) && (
            <button type="button" className="btn btn-ghost" onClick={() => { setFechas({ inicio: '', fin: '' }); cargar(tipo, false); }}>{t('admin.detailed.clearDates')}</button>
          )}
        </div>
      </div>

      {tipo === 'ganancias' && !loading && (
        <div className="report-total">
          <span>{t('admin.reports.totalCommissions')}</span>
          <strong>{formatMoney(datos.total)}</strong>
        </div>
      )}

      <div className="table-scroll" key={tipo}>
        {loading ? (
          <div className="skeleton" style={{ height: 220 }} />
        ) : datos.detalles.length === 0 ? (
          <div className="empty-state">{t('admin.detailed.empty')}</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>{columnas.map(([h, , num]) => <th key={h} style={num ? { textAlign: 'right' } : undefined}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {datos.detalles.map((d, i) => (
                <tr key={i}>
                  {columnas.map(([h, f, num]) => <td key={h} style={num ? { textAlign: 'right' } : undefined}>{f(d)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
