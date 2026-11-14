import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import type { BrandProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { Sparkles } from 'lucide-react';

export const BrandProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await api.getBrandProfile(user.id);
      setProfile(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load brand profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    if (!profile.brand_name.trim()) {
      toast.error('Brand name is required.');
      return;
    }

    try {
      setSaving(true);
      const updated = await api.updateBrandProfile(user.id, profile);
      setProfile(updated);
      toast.success('Brand profile updated!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update brand profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Skeleton className="h-12 w-64 rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-2xl space-y-8 w-full">
      {/* Header */}
      <div className="pb-6 border-b border-[#D4C2AE]/60">
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] mb-1">
          <Sparkles className="w-3 h-3 text-[#B49A70]" />
          05 / Brand Identity
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#171514] tracking-tight">
          Brand Profile Settings
        </h1>
        <p className="text-xs text-[#5A534F] mt-1">
          Information shared with creators when you send collaboration proposals and campaign briefs.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 bg-white border border-[#D4C2AE] p-7 rounded-2xl shadow-luxury">
        <Input
          label="Brand / Company Name *"
          value={profile.brand_name}
          onChange={(e) => setProfile({ ...profile, brand_name: e.target.value })}
          placeholder="e.g. Kaya Botanics India"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Industry / Niche"
            value={profile.industry || ''}
            onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
            placeholder="e.g. Beauty & Wellness"
          />

          <Input
            label="Official Website URL"
            type="url"
            value={profile.website || ''}
            onChange={(e) => setProfile({ ...profile, website: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <Input
          label="Logo Image URL"
          type="url"
          value={profile.logo_url || ''}
          onChange={(e) => setProfile({ ...profile, logo_url: e.target.value })}
          placeholder="https://..."
        />

        <Textarea
          label="About the Brand"
          value={profile.description || ''}
          onChange={(e) => setProfile({ ...profile, description: e.target.value })}
          placeholder="Explain your product categories, brand philosophy, and what creators you look for..."
          rows={3}
        />

        <div className="flex justify-end pt-3 border-t border-[#D4C2AE]/50">
          <Button
            type="submit"
            loading={saving}
          >
            Save Brand Details
          </Button>
        </div>
      </form>
    </div>
  );
};
