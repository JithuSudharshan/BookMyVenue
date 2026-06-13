function StateBlock({ title, message }) {
  return (
    <div className="state-block">
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}

export default StateBlock;
