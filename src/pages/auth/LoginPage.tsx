import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SampleDataBadge } from '../../components/ui/SampleDataBadge';
import toast from 'react-hot-toast';
import { Sparkles, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signIn, role } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email.');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      toast.success('Welcome back to Creatix!');
      navigate(email.includes('brand') || role === 'brand' ? '/brand/dashboard' : '/creator/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, targetRole: 'creator' | 'brand') => {
    try {
      setLoading(true);
      await signIn(demoEmail, targetRole === 'creator' ? 'creator123' : 'brand123');
      toast.success(`Logged in as ${targetRole === 'creator' ? 'Aanya (Creator)' : 'Kaya Botanics (Brand)'}`);
      navigate(targetRole === 'creator' ? '/creator/dashboard' : '/brand/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#faf9f5]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <span className="w-9 h-9 rounded-lg bg-creator-900 flex items-center justify-center text-white font-serif font-bold text-xl shadow-xs">
            C
          </span>
          <span className="font-serif font-bold text-2xl tracking-tight text-stone-900">
            Creatix
          </span>
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-stone-900">
          Sign in to your portal
        </h2>
        <p className="mt-1 text-xs text-stone-500">
          Discover deals, manage contracts, and track net creator profits.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-stone-200 rounded-xl sm:px-10">
          {/* Quick Demo Logins per User Rule 3 */}
          <div className="mb-6 p-4 rounded-lg bg-surface-100 border border-stone-200/80">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                Quick Demo Accounts
              </span>
              <SampleDataBadge />
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('aanya@creatix.dev', 'creator')}
                disabled={loading}
                className="w-full flex items-center justify-between p-2.5 text-left bg-white border border-stone-200 rounded-md hover:border-creator-900 hover:bg-emerald-50/30 transition-all text-xs group"
              >
                <div>
                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-creator-900" />
                    <span>Aanya Sharma (Creator Demo)</span>
                  </div>
                  <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                    aanya@creatix.dev · Pass: creator123
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-creator-900 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('partners@kayabotanics.com', 'brand')}
                disabled={loading}
                className="w-full flex items-center justify-between p-2.5 text-left bg-white border border-stone-200 rounded-md hover:border-brand-900 hover:bg-blue-50/30 transition-all text-xs group"
              >
                <div>
                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-900" />
                    <span>Kaya Botanics (Brand Demo)</span>
                  </div>
                  <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                    partners@kayabotanics.com · Pass: brand123
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-brand-900 transition-colors" />
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-white px-2 text-stone-400 font-semibold">Or enter credentials</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. aanya@creatix.dev"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button type="submit" className="w-full" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-stone-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-creator-900 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
