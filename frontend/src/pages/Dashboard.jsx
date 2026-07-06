import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { booksApi, authorsApi, membersApi, borrowedBooksApi } from '../api/resources.js';
import { extractError } from '../api/client.js';
import { Card } from '../components/page.jsx';
import { Badge, Spinner, EmptyState } from '../components/primitives.jsx';
import { BookIcon, AuthorIcon, MemberIcon, BorrowIcon } from '../components/Icons.jsx';
import { formatDate, statusMeta } from '../utils/format.js';

const STATS = [
  { key: 'books', label: 'Books', to: '/books', icon: BookIcon, tone: 'bg-brand-600' },
  { key: 'authors', label: 'Authors', to: '/authors', icon: AuthorIcon, tone: 'bg-emerald-600' },
  { key: 'members', label: 'Members', to: '/members', icon: MemberIcon, tone: 'bg-sky-600' },
  { key: 'borrowed', label: 'Borrow Records', to: '/borrowed-books', icon: BorrowIcon, tone: 'bg-amber-600' },
];

export default function Dashboard() {
  const [counts, setCounts] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      booksApi.list({ size: 1 }),
      authorsApi.list({ size: 1 }),
      membersApi.list({ size: 1 }),
      borrowedBooksApi.list({ size: 5, sort: 'borrowDate,desc' }),
    ])
      .then(([books, authors, members, borrowed]) => {
        if (!active) return;
        setCounts({
          books: books.totalElements,
          authors: authors.totalElements,
          members: members.totalElements,
          borrowed: borrowed.totalElements,
        });
        setRecent(borrowed.content);
        setError(null);
      })
      .catch((err) => active && setError(extractError(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="px-6 py-16 text-center text-sm text-rose-600">{error}</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map(({ key, label, to, icon: Icon, tone }) => (
          <Link key={key} to={to}>
            <Card className="transition hover:shadow-md">
              <div className="flex items-center gap-4 p-5">
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl text-white ${tone}`}>
                  <Icon />
                </span>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{counts[key]}</p>
                  <p className="text-sm text-slate-500">{label}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-800">Recent Borrow Activity</h3>
          <Link to="/borrowed-books" className="text-xs font-medium text-brand-600 hover:text-brand-700">
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState title="No borrow activity yet" description="Borrow records will appear here." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((r) => {
              const meta = statusMeta(r.status);
              return (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{r.book?.title}</p>
                    <p className="text-xs text-slate-500">
                      {r.member?.name} · Borrowed {formatDate(r.borrowDate)}
                    </p>
                  </div>
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
