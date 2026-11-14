import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import type { BrandProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

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
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-stone-200">
        <h1 className="text-2xl font-serif font-bold text-stone-900">Brand Profile Settings</h1>
        <p className="text-xs text-stone-500 mt-1">
          Information shared with creators when you send collaboration proposals.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 bg-white border border-stone-200 p-6 rounded-xl shadow-xs">
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

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            loading={saving}
            className="bg-brand-900 hover:bg-black text-white"
          >
            Save Brand Details
          </Button>
        </div>
      </form>
    </div>
  );
};
