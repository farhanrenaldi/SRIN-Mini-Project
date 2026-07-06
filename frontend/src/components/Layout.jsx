import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  DashboardIcon,
  BookIcon,
  AuthorIcon,
  MemberIcon,
  BorrowIcon,
  MenuIcon,
  CloseIcon,
} from './Icons.jsx';
import { IconButton } from './primitives.jsx';

const NAV = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon, end: true },
  { to: '/books', label: 'Books', icon: BookIcon },
  { to: '/authors', label: 'Authors', icon: AuthorIcon },
  { to: '/members', label: 'Members', icon: MemberIcon },
  { to: '/borrowed-books', label: 'Borrowed Books', icon: BorrowIcon },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
        <BookIcon />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-white">Library Manager</p>
        <p className="text-[11px] text-brand-200">Books · Authors · Members</p>
      </div>
    </div>
  );
}

function NavItems({ onNavigate }) {
  return (
    <nav className="flex-1 space-y-1 px-3 py-2">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-brand-100 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          <span className="text-lg">
            <Icon />
          </span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

const TITLES = {
  '/': 'Dashboard',
  '/books': 'Books',
  '/authors': 'Authors',
  '/members': 'Members',
  '/borrowed-books': 'Borrowed Books',
};

export function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const title = TITLES[location.pathname] || 'Library Manager';

  return (
    <div className="min-h-full lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-brand-900">
        <Brand />
        <NavItems />
        <div className="px-5 py-4 text-[11px] text-brand-300/80">
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setOpen(false)} />
          <aside className="relative flex h-full w-64 flex-col bg-brand-900">
            <div className="flex items-center justify-between pr-3">
              <Brand />
              <IconButton
                label="Close menu"
                onClick={() => setOpen(false)}
                className="text-brand-200 hover:bg-white/10"
              >
                <CloseIcon />
              </IconButton>
            </div>
            <NavItems onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-h-full flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <IconButton
            label="Open menu"
            onClick={() => setOpen(true)}
            className="text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <MenuIcon />
          </IconButton>
          <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
        </header>

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
