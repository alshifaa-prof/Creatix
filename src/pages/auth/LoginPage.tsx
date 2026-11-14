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
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#FAF7F2] text-[#171514]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3 mb-5 group">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B49A70] to-[#7A6440] flex items-center justify-center text-[#171514] font-serif font-bold text-2xl shadow-luxury group-hover:scale-105 transition-transform">
            C
          </span>
          <span className="font-serif font-bold text-3xl tracking-tight text-[#171514]">
            Creatix
          </span>
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B49A70] block mb-1">
          01 / Portal Authentication
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#171514]">
          Sign in to your portal
        </h2>
        <p className="mt-1.5 text-xs text-[#5A534F]">
          Discover deals, manage contracts, and track net creator profits.
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-9 px-6 sm:px-10 shadow-luxury-lg border border-[#D4C2AE] rounded-2xl">
          {/* Quick Demo Logins */}
          <div className="mb-6 p-4 rounded-xl bg-[#F3EAE0] border border-[#D4C2AE]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-[#171514] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#B49A70]" />
                One-Click Demo Passkeys
              </span>
              <SampleDataBadge />
            </div>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('aanya@creatix.dev', 'creator')}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 text-left bg-white border border-[#D4C2AE] rounded-xl hover:border-[#B49A70] hover:bg-[#FAF7F2] transition-all text-xs group shadow-xs"
              >
                <div>
                  <div className="font-bold text-[#171514] flex items-center gap-1.5 font-serif text-sm">
                    <UserCheck className="w-3.5 h-3.5 text-[#B49A70]" />
                    <span>Aanya Sharma (Creator Demo)</span>
                  </div>
                  <div className="text-[10px] text-[#7B726C] font-mono mt-0.5">
                    aanya@creatix.dev · Pass: creator123
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#A9927A] group-hover:text-[#171514] transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('partners@kayabotanics.com', 'brand')}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 text-left bg-white border border-[#D4C2AE] rounded-xl hover:border-[#B49A70] hover:bg-[#FAF7F2] transition-all text-xs group shadow-xs"
              >
                <div>
                  <div className="font-bold text-[#171514] flex items-center gap-1.5 font-serif text-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#B49A70]" />
                    <span>Kaya Botanics (Brand Demo)</span>
                  </div>
                  <div className="text-[10px] text-[#7B726C] font-mono mt-0.5">
                    partners@kayabotanics.com · Pass: brand123
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#A9927A] group-hover:text-[#171514] transition-colors" />
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#D4C2AE]/60" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
              <span className="bg-white px-2.5 text-[#7B726C] font-semibold">Or enter credentials</span>
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

          <div className="mt-6 text-center text-xs text-[#5A534F]">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-[#171514] hover:text-[#B49A70] hover:underline transition-colors">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
