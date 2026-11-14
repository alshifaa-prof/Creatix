import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { SampleDataBadge } from '../ui/SampleDataBadge';
import {
  Compass,
  Bookmark,
  Send,
  Building2,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';

export const BrandLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { to: '/brand/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/brand/discover', label: 'Discover Creators', icon: Compass },
    { to: '/brand/shortlist', label: 'Shortlist', icon: Bookmark },
    { to: '/brand/enquiries', label: 'Enquiries Sent', icon: Send },
    { to: '/brand/profile', label: 'Brand Profile', icon: Building2 },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#faf9f5]">
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-stone-200 min-h-screen p-4 justify-between select-none">
        <div>
          {/* Brand Logo & Portal Tag */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-brand-900 flex items-center justify-center text-white font-serif font-bold text-lg shadow-xs">
                C
              </span>
              <div>
                <span className="font-serif font-bold tracking-tight text-stone-900 text-lg block leading-none">
                  Creatix
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-900/80 block mt-0.5">
                  Brand Discovery
                </span>
              </div>
            </div>
            <SampleDataBadge />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-brand-900 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Sign Out */}
        <div className="pt-4 border-t border-stone-200">
          <div className="flex items-center justify-between p-2 rounded-lg bg-surface-100 border border-stone-200/60 mb-2">
            <div className="truncate pr-2">
              <p className="text-xs font-bold text-stone-900 truncate">
                {user?.name || 'Kaya Botanics'}
              </p>
              <p className="text-[10px] text-stone-500 truncate">{user?.email}</p>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 uppercase tracking-wider">
              Brand
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-stone-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-brand-900 flex items-center justify-center text-white font-serif font-bold text-base shadow-xs">
              C
            </span>
            <span className="font-serif font-bold tracking-tight text-stone-900 text-base">
              Creatix
            </span>
          </div>
          <SampleDataBadge />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-stone-200 flex justify-around items-center h-16 z-40 px-2 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-brand-900 font-bold' : 'text-stone-500'
                }`
              }
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
