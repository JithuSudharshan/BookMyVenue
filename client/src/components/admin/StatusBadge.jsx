function StatusBadge({ status }) {
  const normalized = String(status || 'unknown').toLowerCase();

  return <span className={`status-badge status-${normalized}`}>{status || 'Unknown'}</span>;
}

export default StatusBadge;
