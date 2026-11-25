import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  User,
  Users,
  X,
} from 'lucide-react';
import { memo, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthState } from '../context/AuthContext';
import { ROLES } from '../utils/permissions';

function getNavItems(role) {
  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  if (role === ROLES.ADMIN) {
    items.push(
      { to: '/admin/faculty', label: 'Faculty', icon: Users },
      { to: '/admin/students', label: 'Students', icon: GraduationCap },
      { to: '/admin/courses', label: 'Courses', icon: BookOpen }
    );
  } else if (role === ROLES.FACULTY) {
    items.push(
      { to: '/faculty/courses', label: 'My Courses', icon: BookOpen },
      { to: '/faculty/all-courses', label: 'All Courses', icon: BookOpen },
      { to: '/faculty/students', label: 'Students', icon: GraduationCap },
      { to: '/faculty/faculty', label: 'Faculty', icon: Users }
    );
  } else if (role === ROLES.STUDENT) {
    items.push({ to: '/student/courses', label: 'My Courses', icon: BookOpen });
  }

  items.push({ to: '/profile', label: 'Profile', icon: User });
  return items;
}

const Sidebar = memo(function Sidebar({ isOpen, onClose }) {
  const { role } = useAuthState();
  const navItems = useMemo(() => getNavItems(role), [role]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              LMS Portal
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Main">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4 text-xs text-slate-500">
          <p className="font-medium text-slate-700">Role Access</p>
          <p className="mt-0.5 capitalize">{role || 'Guest'} workspace</p>
        </div>
      </aside>
    </>
  );
});

export default Sidebar;
