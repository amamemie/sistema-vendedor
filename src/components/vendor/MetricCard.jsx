export default function MetricCard({ label, value, change, changeType = 'neutral' }) {
  const changeColor = {
    up: '#059669',
    down: '#dc2626',
    neutral: '#6b7280',
  }[changeType];

  const changeIcon = {
    up: 'ti-trending-up',
    down: 'ti-trending-down',
    neutral: '',
  }[changeType];

  return (
    <div style={{
      background: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: 10, padding: '14px 16px',
    }}>
      <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '0 0 6px' }}>
        {label}
      </p>
      <p style={{ fontSize: 22, fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>
        {value}
      </p>
      {change && (
        <p style={{ fontSize: 11, color: changeColor, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
          {changeIcon && <i className={`ti ${changeIcon}`} style={{ fontSize: 11 }} aria-hidden="true" />}
          {change}
        </p>
      )}
    </div>
  );
}
