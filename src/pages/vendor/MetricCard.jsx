// /src/components/vendor/MetricCard.jsx
export default function MetricCard({ label, value, change, changeType }) {
  const changeColor = changeType === 'up' ? 'var(--success)' : changeType === 'down' ? 'var(--error)' : 'var(--gray-500)';
  const changeIcon = changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : '•';

  return (
    <div style={{
      background: 'var(--surface)',
      border: '0.5px solid var(--gray-200)',
      borderRadius: 10,
      padding: '14px 16px',
    }}>
      <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--gray-900)', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: changeColor }}>
        <span>{changeIcon} {change}</span>
      </div>
    </div>
  );
}