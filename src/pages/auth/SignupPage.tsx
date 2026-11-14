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
          Create your Creatix account
        </h2>
        <p className="mt-1 text-xs text-stone-500">
          Join India's dedicated creator-brand collaboration platform.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-stone-200 rounded-xl sm:px-10">
          {/* Role Selector (§4, §5.1) */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('creator')}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                  role === 'creator'
                    ? 'border-creator-900 bg-emerald-50/50 ring-1 ring-creator-900'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <Palette className={`w-4 h-4 ${role === 'creator' ? 'text-creator-900' : 'text-stone-400'}`} />
                <span className="text-xs font-bold text-stone-900">Creator</span>
                <span className="text-[10px] text-stone-500">Manage deals, contracts & profit</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('brand')}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                  role === 'brand'
                    ? 'border-brand-900 bg-blue-50/50 ring-1 ring-brand-900'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <Building2 className={`w-4 h-4 ${role === 'brand' ? 'text-brand-900' : 'text-stone-400'}`} />
                <span className="text-xs font-bold text-stone-900">Brand / Agency</span>
                <span className="text-[10px] text-stone-500">Discover creators & send proposals</span>
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

          <div className="mt-6 text-center text-xs text-stone-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-creator-900 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
