import { SearchIcon } from './Icons.jsx';

export function SearchBar({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
        <SearchIcon />
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-lg border-0 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm ring-1 ring-inset ring-slate-300 transition placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500"
      />
    </div>
  );
}
