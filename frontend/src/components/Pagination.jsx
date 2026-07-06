import { ChevronLeftIcon, ChevronRightIcon } from './Icons.jsx';

/**
 * Pagination bar.
 * `page` is zero-based (matching Spring Data). Calls `onChange(newPage)`.
 */
export function Pagination({ page, totalPages, totalElements, size, onChange }) {
  if (totalElements === 0) return null;

  const from = page * size + 1;
  const to = Math.min((page + 1) * size, totalElements);
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row">
      <p className="text-xs text-slate-500">
        Showing <span className="font-medium text-slate-700">{from}</span>–
        <span className="font-medium text-slate-700">{to}</span> of{' '}
        <span className="font-medium text-slate-700">{totalElements}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={!canPrev}
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeftIcon /> Prev
        </button>
        <span className="px-2 text-sm text-slate-500">
          Page <span className="font-medium text-slate-700">{page + 1}</span> of{' '}
          {Math.max(totalPages, 1)}
        </span>
        <button
          onClick={() => onChange(page + 1)}
          disabled={!canNext}
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}
