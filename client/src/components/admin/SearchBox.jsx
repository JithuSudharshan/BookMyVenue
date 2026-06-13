import { Search } from 'lucide-react';

function SearchBox({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`search-box ${className}`.trim()}>
      <Search size={16} />
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export default SearchBox;
