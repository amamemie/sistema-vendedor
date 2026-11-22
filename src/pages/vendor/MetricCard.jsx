// /src/components/vendor/MetricCard.jsx
export default function MetricCard({ label, value, change, changeType }) {
  const changeColor = changeType === 'up' ? '#059669' : changeType === 'down' ? '#dc2626' : '#64748b';
  const changeIcon = changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : '•';

  return (
    <div style={{
      background: '#fff',
      border: '0.5px solid #e2e8f0',
      borderRadius: 10,
      padding: '14px 16px',
    }}>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: changeColor }}>
        <span>{changeIcon} {change}</span>
      </div>
    </div>
  );
}