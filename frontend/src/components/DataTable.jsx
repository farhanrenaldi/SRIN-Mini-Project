import { EditIcon, TrashIcon, AlertIcon } from './Icons.jsx';
import { IconButton, Spinner, EmptyState } from './primitives.jsx';

/**
 * Responsive table.
 *
 * columns: [{ key, header, render?: (row) => node, cell?: field name, className }]
 * On small screens the table scrolls horizontally.
 */
export function DataTable({
  columns,
  rows,
  rowKey = (r) => r.id,
  loading,
  error,
  empty,
  onEdit,
  onDelete,
}) {
  const hasActions = Boolean(onEdit || onDelete);
  const colSpan = columns.length + (hasActions ? 1 : 0);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-3 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
            {hasActions && <th className="px-4 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading && (
            <tr>
              <td colSpan={colSpan} className="px-4 py-16 text-center">
                <Spinner />
              </td>
            </tr>
          )}

          {!loading && error && (
            <tr>
              <td colSpan={colSpan} className="px-4 py-12">
                <div className="flex flex-col items-center gap-2 text-rose-600">
                  <span className="text-2xl">
                    <AlertIcon />
                  </span>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </td>
            </tr>
          )}

          {!loading && !error && rows.length === 0 && (
            <tr>
              <td colSpan={colSpan} className="p-0">
                <EmptyState title={empty?.title || 'Nothing here yet'} description={empty?.description} />
              </td>
            </tr>
          )}

          {!loading &&
            !error &&
            rows.map((row) => (
              <tr key={rowKey(row)} className="transition hover:bg-slate-50/70">
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 align-middle text-slate-700 ${col.className || ''}`}>
                    {col.render ? col.render(row) : row[col.cell ?? col.key]}
                  </td>
                ))}
                {hasActions && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {onEdit && (
                        <IconButton
                          label="Edit"
                          onClick={() => onEdit(row)}
                          className="text-slate-500 hover:bg-brand-50 hover:text-brand-600"
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      {onDelete && (
                        <IconButton
                          label="Delete"
                          onClick={() => onDelete(row)}
                          className="text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <TrashIcon />
                        </IconButton>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
