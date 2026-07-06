export function Card({ children, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

/** Row above a table: a description on the left, controls (search/add) on the right. */
export function Toolbar({ description, children }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {description && <p className="text-sm text-slate-500">{description}</p>}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">{children}</div>
    </div>
  );
}
