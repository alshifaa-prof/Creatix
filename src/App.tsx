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

import { Sparkles, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

const HomePage: React.FC = () => {
  const { user, role } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f5]">
      {/* Navigation Bar */}
      <header className="border-b bg-white border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-creator-900 flex items-center justify-center text-white font-serif font-bold text-lg shadow-xs">
              C
            </span>
            <span className="text-xl font-serif font-bold tracking-tight text-stone-900">
              Creatix
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <SampleDataBadge />
            {user ? (
              <Link
                to={role === 'brand' ? '/brand/dashboard' : '/creator/dashboard'}
                className="text-xs font-semibold px-4 py-2 rounded-lg bg-creator-900 text-white hover:bg-stone-900 transition-colors shadow-xs"
              >
                Go to {role === 'brand' ? 'Brand' : 'Creator'} Portal →
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors px-2 py-1"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-creator-900 text-white hover:bg-stone-900 transition-colors shadow-xs"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          Creator Business Management & AI Contract Intelligence
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-stone-900 max-w-3xl leading-[1.15]">
          Empowering Indian Creators & Brands to Collaborate Smarter.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-stone-600 max-w-2xl leading-relaxed">
          From brand discovery and proposal negotiation to instant AI contract extraction and financial profitability tracking. One platform built for modern creators.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3.5 justify-center w-full max-w-md">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-creator-900 text-white font-semibold text-sm hover:bg-stone-900 transition-all shadow-xs"
          >
            Open Live Demo <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white border border-stone-300 text-stone-800 font-semibold text-sm hover:bg-surface-50 transition-all"
          >
            Create New Account
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left w-full max-w-4xl">
          <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-xs">
            <div className="text-creator-900 font-bold text-sm mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" /> AI Contract Review
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              PDF term extraction, plain English summaries, and automatic risk clause flags.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-xs">
            <div className="text-creator-900 font-bold text-sm mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Deals & Net Earnings
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Real-time net earnings, pending payment tracking, and milestone deadline alerts.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-xs">
            <div className="text-creator-900 font-bold text-sm mb-1.5 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-700" /> Two-Sided Ecosystem
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Brand discovery directory, shortlist management, and atomic enquiry-to-deal conversion.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
        Creatix Platform · Source of Truth: PRD v1.0 specifications · Mock Data Mode Enabled
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
              background: '#ffffff',
              color: '#1c1917',
              border: '1px solid #e7e5e4',
              fontSize: '13px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
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
