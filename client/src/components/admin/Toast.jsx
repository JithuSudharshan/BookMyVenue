function Toast({ message, type = 'success', onClose }) {
  if (!message) {
    return null;
  }

  const isError = type === 'error';
  const typeClasses = isError 
    ? 'text-admin-red bg-[#fff1f2] border-[#fecaca]' 
    : 'text-[#047857] bg-[#ecfdf5] border-[#bbf7d0]';

  return (
    <div className={`fixed top-[18px] right-[18px] z-30 flex items-center gap-3 max-w-[min(360px,calc(100vw-36px))] p-[13px_14px] border rounded-lg shadow-admin transition-all ${typeClasses}`} role="status">
      <span className="text-sm font-bold">{message}</span>
      <button className="ml-auto text-inherit bg-transparent border-0 font-bold hover:opacity-75 transition-opacity px-1" type="button" onClick={onClose} aria-label="Dismiss notification">
        x
      </button>
    </div>
  );
}

export default Toast;
