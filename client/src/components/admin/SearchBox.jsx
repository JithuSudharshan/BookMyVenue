import { Search } from 'lucide-react';

function SearchBox({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`flex items-center gap-2 border border-line bg-[#fafafa] w-full sm:max-w-[430px] px-3 rounded-[7px] ${className}`.trim()}>
      <Search size={16} className="text-[#6b5555]" />
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-w-0 h-[38px] border-0 outline-none text-ink bg-transparent"
      />
    </div>
  );
}

export default SearchBox;
