import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HiHome,
  HiCreditCard,
  HiCash,
  HiChartPie,
  HiDocumentReport,
  HiUser,
  HiLogout,
  HiMenuAlt2,
  HiX,
} from 'react-icons/hi';
import { useAuthStore } from '../store/authStore';
import { authService } from '../api/authService';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: HiHome, label: 'Dashboard' },
  { to: '/expenses', icon: HiCreditCard, label: 'Expenses' },
  { to: '/income', icon: HiCash, label: 'Income' },
  { to: '/budgets', icon: HiChartPie, label: 'Budgets' },
  { to: '/reports', icon: HiDocumentReport, label: 'Reports' },
  { to: '/profile', icon: HiUser, label: 'Profile' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-dark-700/50">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
          E
        </div>
        {!collapsed && (
          <span className="text-lg font-bold gradient-text">Expensora</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-500/20'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700/50'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="px-3 py-4 border-t border-dark-700/50 space-y-2">
        {!collapsed && user && (
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-dark-200 truncate">{user.name}</p>
            <p className="text-xs text-dark-500 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full"
        >
          <HiLogout className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-dark-800 border border-dark-700 text-dark-300"
      >
        <HiMenuAlt2 className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-dark-900 border-r border-dark-700/50 transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-dark-700 text-dark-400"
        >
          <HiX className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:block fixed inset-y-0 left-0 z-30 ${
          collapsed ? 'w-20' : 'w-64'
        } bg-dark-900/80 backdrop-blur-xl border-r border-dark-700/50 transition-all duration-300`}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 p-1 rounded-full bg-dark-800 border border-dark-700 text-dark-400 hover:text-dark-200 z-10"
        >
          {collapsed ? (
            <HiMenuAlt2 className="w-4 h-4" />
          ) : (
            <HiX className="w-4 h-4" />
          )}
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
