import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/principal/dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <rect x="3" y="3" width="8" height="8" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="13" y="3" width="8" height="5" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="13" y="10" width="8" height="11" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'students',
    label: 'Student Management',
    path: '/principal/students',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14c-4.418 0-8 1.79-8 4v1h16v-1c0-2.21-3.582-4-8-4z" />
        <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'teachers',
    label: 'Teacher Management',
    path: '/principal/teachers',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <rect x="3" y="3" width="18" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 16v5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    key: 'caretaker',
    label: 'Caretaker Management',
    path: '/principal/caretakers',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20H7a2 2 0 01-2-2v-1c0-2.21 3.134-4 7-4s7 1.79 7 4v1a2 2 0 01-2 2z" />
        <circle cx="12" cy="7" r="3" strokeLinecap="round" strokeLinejoin="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 8a3 3 0 010 6" />
      </svg>
    ),
  },
  {
    key: 'finance',
    label: 'Finance',
    path: '/principal/finance',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v10M15 9.5c0-1.38-1.34-2.5-3-2.5s-3 1.12-3 2.5S10.34 12 12 12s3 1.12 3 2.5-1.34 2.5-3 2.5-3-1.12-3-2.5" />
      </svg>
    ),
  },
  {
    key: 'events',
    label: 'Event Management',
    path: '/principal/events',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
        <circle cx="8" cy="15" r="1" fill="currentColor" />
        <circle cx="12" cy="15" r="1" fill="currentColor" />
        <circle cx="16" cy="15" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: 'leave-management',
    label: 'Leave Management',
    path: '/principal/leave-management',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <rect x="3" y="4" width="18" height="17" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 15l2.5 2.5L16 12" />
      </svg>
    ),
  },
  {
    key: 'classes',
    label: 'Class Management',
    path: '/principal/classes',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h8M4 18h8" />
        <rect x="14" y="12" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'exams',
    label: 'Exam Management',
    path: '/principal/exams',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" strokeLinecap="round" strokeLinejoin="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    key: 'notices',
    label: 'Notices & Quick Actions',
    path: '/principal/notices',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17H5a2 2 0 01-1.98-2.28l1-7A2 2 0 016 6h12a2 2 0 011.98 1.72l1 7A2 2 0 0119 17h-4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v1a3 3 0 006 0v-1" />
      </svg>
    ),
  },
  {
    key: 'reports',
    label: 'Reports',
    path: '/principal/reports',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16" />
        <rect x="6" y="10" width="3" height="9" rx="0.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="11" y="6" width="3" height="13" rx="0.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="16" y="13" width="3" height="6" rx="0.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

// ── Sidebar component ─────────────────────────────────────────────────────────
function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`
        flex flex-col bg-[#1a1f2e] text-white transition-all duration-300 ease-in-out
        h-screen sticky top-0 shrink-0
        ${collapsed ? 'w-[68px]' : 'w-[240px]'}
      `}
    >
      {/* Logo / Brand */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg">
          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
          </svg>
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold leading-tight tracking-wide">School ERP</p>
            <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Principal</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden scrollbar-none">
        {!collapsed && (
          <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Management
          </p>
        )}
        <ul className="space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.key}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 relative
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : item.comingSoon
                      ? 'text-white/30 cursor-not-allowed'
                      : 'text-white/60 hover:bg-white/8 hover:text-white'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                onClick={(e) => item.comingSoon && e.preventDefault()}
                title={collapsed ? item.label : undefined}
              >
                <span className="shrink-0">{item.icon}</span>

                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.comingSoon && (
                      <span className="text-[9px] font-semibold uppercase tracking-wide bg-white/10 text-white/40 px-1.5 py-0.5 rounded">
                        Soon
                      </span>
                    )}
                  </>
                )}

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div className="
                    absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs
                    rounded-lg whitespace-nowrap opacity-0 pointer-events-none
                    group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-white/10
                  ">
                    {item.label}
                    {item.comingSoon && <span className="ml-1.5 text-white/40">(Soon)</span>}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom: collapse toggle + profile stub */}
      <div className="border-t border-white/10 p-2 space-y-1">
        {/* Profile stub */}
        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold shrink-0">
            P
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/80 truncate">Principal</p>
              <p className="text-[10px] text-white/30 truncate">Admin</p>
            </div>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={onToggle}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all text-xs font-medium ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
          </svg>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

// ── Top bar ───────────────────────────────────────────────────────────────────
function Topbar({ sidebarCollapsed, onMenuClick }) {
  const location = useLocation();

  const PAGE_LABELS = {
    dashboard: 'Dashboard',
    students: 'Student Management',
    teachers: 'Teacher Management',
    caretakers: 'Caretaker Management',
    finance: 'Finance',
    events: 'Event Management',
    'leave-management': 'Leave Management',
    classes: 'Class Management',
    exams: 'Exam Management',
    notices: 'Notices & Quick Actions',
    reports: 'Reports',
  };

  const segment = location.pathname.split('/')[2] || 'students';
  const pageLabel = PAGE_LABELS[segment] ?? 'Principal';

  return (
    <header className="h-14 bg-white border-b flex items-center gap-4 px-5 sticky top-0 z-30 shadow-sm">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Page title */}
      <div className="flex-1">
        <h2 className="text-sm font-semibold text-gray-800">{pageLabel}</h2>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17H5a2 2 0 01-1.98-2.28l1-7A2 2 0 016 6h12a2 2 0 011.98 1.72l1 7A2 2 0 0119 17h-4z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v1a3 3 0 006 0v-1" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
          P
        </div>
      </div>
    </header>
  );
}

// ── Coming Soon placeholder ───────────────────────────────────────────────────
export function ComingSoon({ module }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">{module} — Coming Soon</h2>
      <p className="text-sm text-gray-500 max-w-sm">
        This module is currently under development. Check back soon.
      </p>
    </div>
  );
}

// ── Root Layout ───────────────────────────────────────────────────────────────
export default function PrincipalLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — desktop: always visible, mobile: slide-in */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 md:relative md:z-auto
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar sidebarCollapsed={collapsed} onMenuClick={() => setMobileOpen(true)} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}