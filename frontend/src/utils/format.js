/** Format an ISO date string (YYYY-MM-DD) as e.g. "Jan 15, 2023". */
export function formatDate(iso) {
  if (!iso) return '—';
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Map a BorrowStatus to a Badge tone + label. */
export function statusMeta(status) {
  switch (status) {
    case 'RETURNED':
      return { tone: 'green', label: 'Returned' };
    case 'OVERDUE':
      return { tone: 'red', label: 'Overdue' };
    case 'BORROWED':
    default:
      return { tone: 'amber', label: 'Borrowed' };
  }
}

export const BORROW_STATUSES = ['BORROWED', 'RETURNED', 'OVERDUE'];
