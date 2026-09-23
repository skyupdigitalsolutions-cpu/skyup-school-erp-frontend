import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/features/authentication/authSlice';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', path: '/student/dashboard' },
  // Add student-specific modules here as they're built (homework, exams,
  // timetable, fees, attendance, ...).
];

function Sidebar({ collapsed, onToggle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const initial = (user?.name || 'S').trim().charAt(0).toUpperCase();

  async function handleLogout() {
    await dispatch(logout());
    navigate('/login', { replace: true });
  }

  return (
    <aside
      className={`flex flex-col bg-[#1a1f2e] text-white transition-all duration-300 ease-in-out
        h-screen sticky top-0 shrink-0 ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}
    >
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-lg text-xs font-bold">
          {initial}
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold leading-tight tracking-wide">School ERP</p>
            <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">
              {user?.viewerType === 'parent' ? 'Parent' : 'Student'}
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.key}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {!collapsed && item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-2 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition"
        >
          {!collapsed && 'Log out'}
        </button>
        <button
          onClick={onToggle}
          className="w-full mt-1 flex items-center justify-center px-3 py-2 rounded-lg text-xs text-white/40 hover:bg-white/5 hover:text-white transition"
        >
          {collapsed ? '»' : '« Collapse'}
        </button>
      </div>
    </aside>
  );
}

function Topbar() {
  const user = useSelector((s) => s.auth.user);
  return (
    <header className="h-14 bg-white border-b flex items-center gap-4 px-5 sticky top-0 z-30 shadow-sm">
      <div className="flex-1">
        <h2 className="text-sm font-semibold text-gray-800">Student Portal</h2>
      </div>
      <div className="text-sm text-gray-500">{user?.name}</div>
    </header>
  );
}

export default function StudentLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
