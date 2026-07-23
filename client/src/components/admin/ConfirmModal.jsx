function ConfirmModal({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel, danger, children }) {
  return (
    <div className="fixed inset-0 z-20 grid place-items-center p-5 bg-[#27272a]/35" role="presentation">
      <section className="w-full max-w-[420px] p-6 bg-white rounded-lg shadow-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title" className="m-0 text-[20px] font-bold text-ink">{title}</h2>
        <p className="mt-2 text-sm text-muted">{message}</p>
        {children}
        <div className="flex items-center justify-between gap-3.5 mt-6">
          <button className="min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold text-[#6b5555] bg-white border border-line hover:bg-admin-red-soft hover:text-admin-red transition-all" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className={`min-h-[36px] px-3.5 rounded-[7px] text-[13px] font-extrabold text-white border transition-all ${
            danger 
              ? 'bg-admin-red border-admin-red hover:bg-admin-red-dark hover:border-admin-red-dark' 
              : 'bg-admin-red border-admin-red hover:bg-admin-red-dark hover:border-admin-red-dark'
          }`} type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ConfirmModal;
