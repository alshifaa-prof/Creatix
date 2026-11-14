import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import type { CreatorProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { SelfReportedBadge } from '../../components/ui/SelfReportedBadge';
import { Skeleton } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { Globe, Lock, ExternalLink, Check, Copy } from 'lucide-react';

const NICHES = [
  'Beauty & Lifestyle',
  'Fashion',
  'Food',
  'Travel',
  'Tech',
  'Gaming',
  'Fitness & Health',
  'Education',
  'Entertainment',
  'Finance',
  'Parenting',
  'Other',
];

export const CreatorProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await api.getCreatorProfile(user.id);
      setProfile(data);
    } catch (err: any) {
      toast.error('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    // Validate engagement rate and counts per §5.2 FR-PROF-2
    if (profile.engagement_rate < 0 || profile.engagement_rate > 100) {
      toast.error('Engagement rate must be between 0 and 100%.');
      return;
    }
    if (profile.follower_count < 0 || profile.subscriber_count < 0 || profile.average_views < 0) {
      toast.error('Counts must be whole numbers >= 0.');
      return;
    }

    try {
      setSaving(true);
      const updated = await api.updateCreatorProfile(user.id, profile);
      setProfile(updated);
      toast.success('Profile saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const copyPublicLink = () => {
    if (!user) return;
    const url = `${window.location.origin}/c/${user.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Public media kit link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header and Public Link Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Creator Profile & Media Kit</h1>
          <p className="text-xs text-stone-500 mt-1">
            Complete your public pitch and showcase your audience reach to brand partners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {profile.is_public ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              Public Media Kit
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
              <Lock className="w-3.5 h-3.5 text-stone-500" />
              Private
            </span>
          )}

          <Button variant="outline" size="sm" onClick={copyPublicLink}>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Link</span>
          </Button>

          {profile.is_public && user && (
            <a
              href={`/c/${user.id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center p-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors"
              title="Preview public profile"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Identity */}
        <div className="p-6 bg-white border border-stone-200 rounded-xl space-y-4">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            Identity & Bio
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Display Name (shown in Directory)"
              value={profile.display_name || ''}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              placeholder="e.g. Aanya Sharma"
              required
            />

            <Select
              label="Primary Niche"
              value={profile.niche}
              onChange={(e) => setProfile({ ...profile, niche: e.target.value })}
              options={NICHES.map((n) => ({ label: n, value: n }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              value={profile.location || ''}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              placeholder="e.g. Bandra, Mumbai"
            />

            <Input
              label="Profile Avatar URL"
              value={profile.profile_image_url || ''}
              onChange={(e) => setProfile({ ...profile, profile_image_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <Textarea
            label="Bio (Max 250 words)"
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Introduce your content style, audience demographics, and past collaboration themes..."
            rows={3}
          />
        </div>

        {/* Audience Statistics (§5.2 FR-PROF-1 to FR-PROF-3) */}
        <div className="p-6 bg-white border border-stone-200 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Audience Metrics
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Self-reported statistics presented to prospective brand partners.
              </p>
            </div>
            <SelfReportedBadge />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Follower Count (IG)"
              type="number"
              min="0"
              value={profile.follower_count}
              onChange={(e) => setProfile({ ...profile, follower_count: parseInt(e.target.value) || 0 })}
            />

            <Input
              label="Subscribers (YT)"
              type="number"
              min="0"
              value={profile.subscriber_count}
              onChange={(e) => setProfile({ ...profile, subscriber_count: parseInt(e.target.value) || 0 })}
            />

            <Input
              label="Average Views / Post"
              type="number"
              min="0"
              value={profile.average_views}
              onChange={(e) => setProfile({ ...profile, average_views: parseInt(e.target.value) || 0 })}
            />

            <Input
              label="Engagement Rate (%)"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={profile.engagement_rate}
              onChange={(e) => setProfile({ ...profile, engagement_rate: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        {/* Social Profiles & External Links */}
        <div className="p-6 bg-white border border-stone-200 rounded-xl space-y-4">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            Social Links & Channels
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Instagram URL"
              type="url"
              value={profile.instagram_url || ''}
              onChange={(e) => setProfile({ ...profile, instagram_url: e.target.value })}
              placeholder="https://instagram.com/..."
            />

            <Input
              label="YouTube Channel URL"
              type="url"
              value={profile.youtube_url || ''}
              onChange={(e) => setProfile({ ...profile, youtube_url: e.target.value })}
              placeholder="https://youtube.com/@..."
            />
          </div>
        </div>

        {/* Visibility Setting */}
        <div className="p-6 bg-white border border-stone-200 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Public Media Kit Visibility</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              When enabled, brand partners can discover your profile and view your media kit via your share link.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={profile.is_public}
              onChange={(e) => setProfile({ ...profile, is_public: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-creator-900"></div>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" loading={saving} size="md">
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
