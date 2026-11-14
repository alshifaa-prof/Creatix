import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { SampleDataBadge } from '../ui/SampleDataBadge';
import {
  LayoutDashboard,
  Briefcase,
  IndianRupee,
  FileText,
  Mail,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react';

export const CreatorLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { to: '/creator/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/creator/deals', label: 'Collaborations', icon: Briefcase },
    { to: '/creator/finance', label: 'Finance & Payouts', icon: IndianRupee },
    { to: '/creator/enquiries', label: 'Brand Enquiries', icon: Mail },
    { to: '/creator/contracts', label: 'AI Contracts', icon: FileText },
    { to: '/creator/profile', label: 'Media Kit', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF7F2]">
      {/* Desktop Left Sidebar: High-Contrast Deep Ink with Gold Detailing */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-[#171514] text-[#FAF7F2] border-r border-[#282422] min-h-screen p-5 justify-between select-none shadow-luxury-lg z-20">
        <div>
          {/* Brand Logo & Portal Tag */}
          <div className="pb-5 mb-6 border-b border-[#282422]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B49A70] to-[#7A6440] flex items-center justify-center text-[#171514] font-serif font-bold text-xl shadow-luxury">
                  C
                </span>
                <div>
                  <span className="font-serif font-bold tracking-tight text-white text-xl block leading-none">
                    Creatix
                  </span>
                  <span className="text-[10px] font-medium tracking-[0.18em] text-[#B49A70] uppercase block mt-1">
                    Editorial Studio
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#282422]/70 text-[10px]">
              <span className="text-[#A9927A] uppercase tracking-wider font-semibold">Creator Workspace</span>
              <SampleDataBadge className="bg-[#282422] text-[#B49A70] border-[#3D3835]" />
            </div>
          </div>

          {/* Section Kicker */}
          <div className="px-3 mb-2 text-[10px] uppercase font-bold tracking-[0.2em] text-[#7B726C]">
            Navigation
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all duration-150 ${
                      isActive
                        ? 'bg-[#282422] text-[#FAF7F2] border border-[#B49A70]/40 shadow-xs'
                        : 'text-[#A9927A] hover:text-[#FAF7F2] hover:bg-[#1E1B1A]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#B49A70]' : 'text-[#7B726C]'}`} />
                        <span className={isActive ? 'font-semibold text-white' : ''}>{item.label}</span>
                      </div>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B49A70] shadow-[0_0_8px_#B49A70]" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Sign Out */}
        <div className="pt-4 border-t border-[#282422]">
          <div className="p-3 rounded-xl bg-[#1E1B1A] border border-[#282422] mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B49A70] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#B49A70]" />
                Creator Verified
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#B49A70]/20 text-[#D4C2AE] border border-[#B49A70]/30 uppercase">
                Pro
              </span>
            </div>
            <p className="text-xs font-serif font-bold text-white truncate">
              {user?.name || 'Aanya Sharma'}
            </p>
            <p className="text-[11px] text-[#7B726C] truncate mt-0.5 font-mono">{user?.email}</p>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-medium text-[#7B726C] hover:text-[#FAF7F2] hover:bg-[#1E1B1A] rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#171514] text-[#FAF7F2] border-b border-[#282422] sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-[#B49A70] flex items-center justify-center text-[#171514] font-serif font-bold text-base shadow-xs">
              C
            </span>
            <span className="font-serif font-bold tracking-tight text-white text-base">
              Creatix
            </span>
          </div>
          <SampleDataBadge className="bg-[#282422] text-[#B49A70] border-[#3D3835]" />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#171514] border-t border-[#282422] flex justify-around items-center h-16 z-40 px-2 shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[50px] min-h-[44px] py-1 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[#B49A70] font-bold' : 'text-[#7B726C]'
                }`
              }
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="truncate max-w-[54px]">{item.label.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
