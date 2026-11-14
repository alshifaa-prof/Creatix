import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UserRole } from '../../types';
import toast from 'react-hot-toast';
import { Palette, Building2 } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('creator');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      await signUp(name, email, password, role);
      toast.success(`Account created as ${role === 'creator' ? 'Creator' : 'Brand'}!`);
      navigate(role === 'creator' ? '/creator/dashboard' : '/brand/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Signup failed.');
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
          01 / Onboarding
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#171514]">
          Create your Creatix account
        </h2>
        <p className="mt-1.5 text-xs text-[#5A534F]">
          Join India's dedicated creator-brand collaboration platform.
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-9 px-6 sm:px-10 shadow-luxury-lg border border-[#D4C2AE] rounded-2xl">
          {/* Role Selector (§4, §5.1) */}
          <div className="mb-6">
            <label className="block text-[11px] font-semibold text-[#5A534F] uppercase tracking-[0.08em] mb-2.5">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('creator')}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                  role === 'creator'
                    ? 'border-[#B49A70] bg-[#F3EAE0] ring-1 ring-[#B49A70]'
                    : 'border-[#D4C2AE] hover:border-[#B49A70]/60 bg-white'
                }`}
              >
                <Palette className={`w-4 h-4 ${role === 'creator' ? 'text-[#171514]' : 'text-[#7B726C]'}`} />
                <span className="text-sm font-serif font-bold text-[#171514]">Creator</span>
                <span className="text-[10px] text-[#7B726C] leading-tight">Manage deals, contracts & profit</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('brand')}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                  role === 'brand'
                    ? 'border-[#B49A70] bg-[#F3EAE0] ring-1 ring-[#B49A70]'
                    : 'border-[#D4C2AE] hover:border-[#B49A70]/60 bg-white'
                }`}
              >
                <Building2 className={`w-4 h-4 ${role === 'brand' ? 'text-[#171514]' : 'text-[#7B726C]'}`} />
                <span className="text-sm font-serif font-bold text-[#171514]">Brand / Agency</span>
                <span className="text-[10px] text-[#7B726C] leading-tight">Discover talent & send briefs</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={role === 'creator' ? 'Your Name' : 'Brand Name'}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === 'creator' ? 'e.g. Aanya Sharma' : 'e.g. Kaya Botanics'}
              required
            />

            <Input
              label="Work Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. you@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />

            <Button type="submit" className="w-full mt-2" loading={loading}>
              Create {role === 'creator' ? 'Creator' : 'Brand'} Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-[#5A534F]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#171514] hover:text-[#B49A70] hover:underline transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
