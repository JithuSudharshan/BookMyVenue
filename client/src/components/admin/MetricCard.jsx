function MetricCard({ title, value, detail, icon: Icon, tone = 'red' }) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <div>
        <span className="metric-title">{title}</span>
        <strong>{value}</strong>
        {detail ? <small>{detail}</small> : null}
      </div>
      {Icon ? (
        <div className="metric-icon">
          <Icon size={20} />
        </div>
      ) : null}
    </article>
  );
}

export default MetricCard;
