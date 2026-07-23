function StateBlock({ title, message }) {
  return (
    <div className="p-6 text-muted text-center">
      <strong className="block text-ink mb-1.5 font-bold">{title}</strong>
      <p className="m-0 text-sm">{message}</p>
    </div>
  );
}

export default StateBlock;
