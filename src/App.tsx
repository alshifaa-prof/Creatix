import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { CreatorLayout } from './components/layout/CreatorLayout';
import { BrandLayout } from './components/layout/BrandLayout';
import { SampleDataBadge } from './components/ui/SampleDataBadge';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';

// Public Page
import { PublicProfilePage } from './pages/public/PublicProfilePage';

// Creator Pages
import { CreatorDashboard } from './pages/creator/CreatorDashboard';
import { CreatorProfilePage } from './pages/creator/CreatorProfilePage';
import { DealsListPage } from './pages/creator/DealsListPage';
import { DealDetailPage } from './pages/creator/DealDetailPage';
import { EnquiriesPage } from './pages/creator/EnquiriesPage';
import { ContractsListPage } from './pages/creator/ContractsListPage';
import { ContractReviewPage } from './pages/creator/ContractReviewPage';
import { FinancePage } from './pages/creator/FinancePage';

// Brand Pages
import { BrandDashboard } from './pages/brand/BrandDashboard';
import { BrandDiscoverPage } from './pages/brand/BrandDiscoverPage';
import { BrandCreatorViewPage } from './pages/brand/BrandCreatorViewPage';
import { BrandShortlistPage } from './pages/brand/BrandShortlistPage';
import { BrandEnquiriesPage } from './pages/brand/BrandEnquiriesPage';
import { BrandProfilePage } from './pages/brand/BrandProfilePage';

import { Sparkles, Shield, ArrowRight, CheckCircle2, TrendingUp, FileCheck } from 'lucide-react';

const HomePage: React.FC = () => {
  const { user, role } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#171514]">
      {/* Editorial Navigation Bar */}
      <header className="border-b border-[#D4C2AE]/60 bg-[#FAF7F2]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B49A70] to-[#7A6440] flex items-center justify-center text-[#171514] font-serif font-bold text-xl shadow-luxury transition-transform group-hover:scale-105">
              C
            </span>
            <div>
              <span className="text-2xl font-serif font-bold tracking-tight text-[#171514] block leading-none">
                Creatix
              </span>
              <span className="text-[9px] font-bold tracking-[0.2em] text-[#B49A70] uppercase block mt-1">
                Editorial Platform
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <SampleDataBadge />
            {user ? (
              <Link
                to={role === 'brand' ? '/brand/dashboard' : '/creator/dashboard'}
                className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-[#171514] text-[#FAF7F2] hover:bg-[#282422] transition-all shadow-luxury border border-[#282422]"
              >
                Go to {role === 'brand' ? 'Brand' : 'Creator'} Portal →
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-[#5A534F] hover:text-[#171514] transition-colors px-3 py-1.5"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-[#171514] text-[#FAF7F2] hover:bg-[#282422] transition-all shadow-luxury border border-[#282422]"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Expansive Editorial Hero */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Editorial Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] bg-[#F3EAE0] text-[#7A6440] border border-[#D4C2AE]">
                <Sparkles className="w-3.5 h-3.5 text-[#B49A70]" />
                01 / Creator Commerce & AI Contracts
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-[#171514] leading-[1.08]">
                Where creator talent meets <span className="italic font-normal text-[#B49A70]">financial clarity</span>.
              </h1>

              <p className="text-base sm:text-lg text-[#5A534F] max-w-xl leading-relaxed">
                A unified editorial platform for Indian digital creators and brand partners: from creator discovery and collaboration proposals to instant AI contract extraction and financial profitability tracking.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3.5 max-w-md">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#171514] text-[#FAF7F2] font-semibold text-sm hover:bg-[#282422] transition-all shadow-luxury border border-[#282422]"
                >
                  Open Live Demo <ArrowRight className="w-4 h-4 text-[#B49A70]" />
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-[#F3EAE0] border border-[#D4C2AE] text-[#171514] font-semibold text-sm hover:bg-[#EAE1D6] transition-all"
                >
                  Create New Account
                </Link>
              </div>

              {/* Editorial Stat Strip */}
              <div className="pt-8 border-t border-[#D4C2AE]/60 grid grid-cols-3 gap-4 max-w-lg">
                <div>
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-[#171514] block">100%</span>
                  <span className="text-[11px] text-[#7B726C] uppercase tracking-wider block mt-0.5">Dual-Sided Portal</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-[#171514] block">Instant</span>
                  <span className="text-[11px] text-[#7B726C] uppercase tracking-wider block mt-0.5">AI Contract Review</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-[#171514] block">Real-time</span>
                  <span className="text-[11px] text-[#7B726C] uppercase tracking-wider block mt-0.5">Net Profit Math</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-Contrast Live Preview Card */}
            <div className="lg:col-span-5">
              <div className="p-6 sm:p-8 rounded-3xl bg-[#171514] text-[#FAF7F2] border border-[#282422] shadow-luxury-lg relative overflow-hidden">
                {/* Decorative Subtle Gold Corner Glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#B49A70]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between pb-4 border-b border-[#282422] mb-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B49A70] block">
                      Live Financial Snapshot
                    </span>
                    <span className="font-serif font-bold text-lg text-white">
                      Aanya Sharma Media Kit
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-[#282422] text-[#D4C2AE] border border-[#3D3835]">
                    Beauty & Lifestyle
                  </span>
                </div>

                {/* Hero Stat within Preview */}
                <div className="p-4 rounded-2xl bg-[#1E1B1A] border border-[#282422] mb-4">
                  <span className="text-[10px] font-semibold text-[#A9927A] uppercase tracking-wider block">
                    Net Monthly Earnings (After Expenses)
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-serif font-bold text-white tracking-tight">₹10,000</span>
                    <span className="text-xs text-[#2D6A4F] font-semibold bg-[#2D6A4F]/20 px-2 py-0.5 rounded border border-[#2D6A4F]/30">
                      +100% on target
                    </span>
                  </div>
                  <span className="text-[10px] text-[#7B726C] mt-2 block font-mono">
                    ₹12,000 Received Income − ₹2,000 Verified Expenses
                  </span>
                </div>

                {/* Sub-cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3.5 rounded-xl bg-[#1E1B1A] border border-[#282422]">
                    <span className="text-[10px] text-[#7B726C] uppercase tracking-wider block">Active Deals</span>
                    <span className="text-xl font-serif font-bold text-white mt-0.5 block">1 Partner</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#1E1B1A] border border-[#282422]">
                    <span className="text-[10px] text-[#7B726C] uppercase tracking-wider block">Pending Receivables</span>
                    <span className="text-xl font-serif font-bold text-[#B49A70] mt-0.5 block">₹0.00</span>
                  </div>
                </div>

                {/* Recent Contract Intelligence Snippet */}
                <div className="p-4 rounded-xl bg-[#282422]/70 border border-[#3D3835] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#B49A70]/20 flex items-center justify-center text-[#B49A70]">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">Kaya Botanics Agreement</p>
                      <p className="text-[10px] text-[#A9927A]">Extracted terms linked to deal</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#2D6A4F] font-bold uppercase tracking-wider">
                    Confirmed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* High-Contrast Editorial Section: Three Feature Pillars */}
        <section className="bg-[#171514] text-[#FAF7F2] py-20 border-y border-[#282422]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between pb-10 border-b border-[#282422] mb-12 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] block mb-2">
                  02 / ARCHITECTURE & CORE CAPABILITIES
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                  Engineered for the Modern Creator Economy
                </h2>
              </div>
              <p className="text-xs text-[#A9927A] max-w-sm">
                Strict adherence to PRD v1.0 specifications with in-memory persistence and live dual-layer architecture.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-7 rounded-2xl bg-[#1E1B1A] border border-[#282422] hover:border-[#B49A70]/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#282422] border border-[#3D3835] flex items-center justify-center text-[#B49A70] mb-5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-2">
                  AI Contract Intelligence
                </h3>
                <p className="text-xs text-[#A9927A] leading-relaxed">
                  Upload PDF brand agreements to immediately extract payment terms, exclusivity clauses, publishing deadlines, and automatic risk flags in plain English.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-7 rounded-2xl bg-[#1E1B1A] border border-[#282422] hover:border-[#B49A70]/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#282422] border border-[#3D3835] flex items-center justify-center text-[#B49A70] mb-5">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-2">
                  Deals & Net Earnings
                </h3>
                <p className="text-xs text-[#A9927A] leading-relaxed">
                  Real-time net earnings calculation deducting expenses from received payouts, tracking pending invoices, and warning of upcoming submission deadlines.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-7 rounded-2xl bg-[#1E1B1A] border border-[#282422] hover:border-[#B49A70]/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#282422] border border-[#3D3835] flex items-center justify-center text-[#B49A70] mb-5">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-2">
                  Two-Sided Direct Marketplace
                </h3>
                <p className="text-xs text-[#A9927A] leading-relaxed">
                  Brand discovery directory with multi-filter search, bookmark shortlist, and direct campaign proposals that convert atomically into creator pipeline deals.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Editorial Luxury Footer */}
      <footer className="border-t border-[#D4C2AE]/60 bg-[#FAF7F2] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-[#171514] text-[#FAF7F2] font-serif font-bold text-base flex items-center justify-center">
              C
            </span>
            <span className="font-serif font-bold text-lg text-[#171514]">Creatix</span>
            <span className="text-xs text-[#7B726C] ml-2">
              · Source of Truth: PRD v1.0 specifications
            </span>
          </div>
          <div className="text-xs text-[#7B726C]">
            Editorial Luxury × Modern SaaS × Contemporary Minimalism
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#171514',
              color: '#FAF7F2',
              border: '1px solid #3D3835',
              fontSize: '13px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(23, 21, 20, 0.3)',
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/c/:creatorId" element={<PublicProfilePage />} />

          {/* Creator Portal Protected Routes */}
          <Route element={<ProtectedRoute allowedRole="creator" />}>
            <Route element={<CreatorLayout />}>
              <Route path="/creator/dashboard" element={<CreatorDashboard />} />
              <Route path="/creator/profile" element={<CreatorProfilePage />} />
              <Route path="/creator/deals" element={<DealsListPage />} />
              <Route path="/creator/deals/:id" element={<DealDetailPage />} />
              <Route path="/creator/enquiries" element={<EnquiriesPage />} />
              <Route path="/creator/contracts" element={<ContractsListPage />} />
              <Route path="/creator/contracts/:id" element={<ContractReviewPage />} />
              <Route path="/creator/finance" element={<FinancePage />} />
            </Route>
          </Route>

          {/* Brand Portal Protected Routes */}
          <Route element={<ProtectedRoute allowedRole="brand" />}>
            <Route element={<BrandLayout />}>
              <Route path="/brand/dashboard" element={<BrandDashboard />} />
              <Route path="/brand/discover" element={<BrandDiscoverPage />} />
              <Route path="/brand/creators/:id" element={<BrandCreatorViewPage />} />
              <Route path="/brand/shortlist" element={<BrandShortlistPage />} />
              <Route path="/brand/enquiries" element={<BrandEnquiriesPage />} />
              <Route path="/brand/profile" element={<BrandProfilePage />} />
            </Route>
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
