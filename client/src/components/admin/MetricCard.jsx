const toneClasses = {
  green: 'text-green bg-[#dcfce7]',
  mint: 'text-green bg-[#dcfce7]',
  blue: 'text-blue bg-[#dbeafe]',
  amber: 'text-amber bg-[#fef3c7]',
  violet: 'text-[#7c3aed] bg-[#ede9fe]',
  red: 'text-admin-red bg-admin-red-soft',
};

function MetricCard({ title, value, detail, icon: Icon, tone = 'red' }) {
  const selectedTone = toneClasses[tone] || toneClasses.red;

  return (
    <article className="relative flex justify-between min-h-[122px] p-[22px] overflow-hidden bg-surface border border-line rounded-lg">
      <div className="absolute -top-[28px] -right-[18px] w-[94px] h-[94px] rounded-full bg-admin-red-soft pointer-events-none"></div>
      <div className="z-10">
        <span className="block text-[#6b5555] text-[12px] font-extrabold tracking-normal uppercase">{title}</span>
        <strong className="block mt-2.5 mb-2 text-[30px] font-bold leading-none">{value}</strong>
        {detail ? <small className="block text-muted text-[12px]">{detail}</small> : null}
      </div>
      {Icon ? (
        <div className={`z-10 grid place-items-center w-[38px] h-[38px] rounded-lg ${selectedTone}`}>
          <Icon size={20} />
        </div>
      ) : null}
    </article>
  );
}

export default MetricCard;
