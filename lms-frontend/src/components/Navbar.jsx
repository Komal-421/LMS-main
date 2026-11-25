import { LogOut, Menu, UserCircle2 } from 'lucide-react';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthActions, useAuthState } from '../context/AuthContext';
import { capitalize } from '../utils/formatters';
import Button from './Button';

const Navbar = memo(function Navbar({ onMenuClick }) {
  const { user } = useAuthState();
  const { logout } = useAuthActions();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xs sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:block">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Learning Management System
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/profile"
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-slate-100"
        >
          <UserCircle2 className="h-7 w-7 text-indigo-600" />
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold leading-tight text-slate-900">
              {user?.name || 'User'}
            </p>
            <p className="text-xs leading-tight text-slate-500">
              {capitalize(user?.role)}
            </p>
          </div>
        </Link>

        <Button
          variant="secondary"
          size="sm"
          onClick={logout}
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
});

export default Navbar;
