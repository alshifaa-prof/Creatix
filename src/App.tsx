import { BrowserRouter, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Sparkles, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

export function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <div className="min-h-screen flex flex-col bg-slate-50">
        {/* Navigation Bar */}
        <header className="border-b bg-white border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                C
              </span>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Creatix
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 max-w-5xl mx-auto px-4 py-16 text-center flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Creator Business Management & AI Contract Intelligence
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-3xl">
            Empowering Indian Creators & Brands to Collaborate Smarter.
          </h1>

          <p className="mt-6 text-lg text-slate-600 max-w-2xl">
            From brand discovery to AI contract extraction and financial profitability tracking. One unified platform built for modern creators.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-md"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
            >
              Log In to Portal
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left w-full max-w-3xl">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-indigo-600 font-semibold mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> AI Contract Review
              </div>
              <p className="text-sm text-slate-500">
                Instant PDF term extraction, plain English summaries and clause flags.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-indigo-600 font-semibold mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Finance & Deals
              </div>
              <p className="text-sm text-slate-500">
                Live net earnings, pending payment tracking, and collaboration deadlines.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-indigo-600 font-semibold mb-1 flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Row Level Security
              </div>
              <p className="text-sm text-slate-500">
                Private contracts in encrypted storage, role isolation, and self-reported stats.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          Creatix Platform · Built according to PRD v1.0 specifications
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
