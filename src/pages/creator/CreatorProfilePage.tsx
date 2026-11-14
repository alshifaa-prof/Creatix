import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import type { CreatorProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { SelfReportedBadge } from '../../components/ui/SelfReportedBadge';
import { Skeleton } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { Globe, Lock, ExternalLink, Check, Copy, Sparkles } from 'lucide-react';

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
        <Skeleton className="h-12 w-64 rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-4xl space-y-8 w-full">
      {/* Header and Public Link Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#D4C2AE]/60">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] mb-1">
            <Sparkles className="w-3 h-3 text-[#B49A70]" />
            06 / Media Kit & Reach
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#171514] tracking-tight">
            Creator Profile & Media Kit
          </h1>
          <p className="text-xs text-[#5A534F] mt-1">
            Complete your public pitch, audience demographics, and social stats to showcase to brand partners.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {profile.is_public ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E2F1E9] text-[#1E4936] border border-[#B7DAC7]">
              <Globe className="w-3.5 h-3.5 text-[#2D6A4F]" />
              Public Media Kit
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F1ECE4] text-[#695644] border border-[#D4C2AE]">
              <Lock className="w-3.5 h-3.5 text-[#7B726C]" />
              Private
            </span>
          )}

          <Button variant="secondary" size="sm" onClick={copyPublicLink} className="gap-1.5">
            {copied ? <Check className="w-3.5 h-3.5 text-[#2D6A4F]" /> : <Copy className="w-3.5 h-3.5 text-[#B49A70]" />}
            <span>Copy Link</span>
          </Button>

          {profile.is_public && user && (
            <a
              href={`/c/${user.id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center p-2 rounded-xl border border-[#D4C2AE] bg-white hover:bg-[#FAF7F2] text-[#171514] transition-colors shadow-xs"
              title="Preview public profile"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Identity */}
        <div className="p-6 sm:p-7 bg-white border border-[#D4C2AE] rounded-2xl space-y-4 shadow-luxury">
          <div className="pb-3 border-b border-[#D4C2AE]/50">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] block">
              Identity
            </span>
            <h2 className="text-xl font-serif font-bold text-[#171514]">
              Profile Bio & Location
            </h2>
          </div>

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
        <div className="p-6 sm:p-7 bg-white border border-[#D4C2AE] rounded-2xl space-y-4 shadow-luxury">
          <div className="flex items-center justify-between pb-3 border-b border-[#D4C2AE]/50">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] block">
                Social Demographics
              </span>
              <h2 className="text-xl font-serif font-bold text-[#171514]">
                Audience Metrics
              </h2>
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
        <div className="p-6 sm:p-7 bg-white border border-[#D4C2AE] rounded-2xl space-y-4 shadow-luxury">
          <div className="pb-3 border-b border-[#D4C2AE]/50">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] block">
              Channels
            </span>
            <h2 className="text-xl font-serif font-bold text-[#171514]">
              Social Channels & Media Handles
            </h2>
          </div>

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
        <div className="p-6 sm:p-7 bg-white border border-[#D4C2AE] rounded-2xl flex items-center justify-between shadow-luxury">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#171514]">Public Media Kit Visibility</h3>
            <p className="text-xs text-[#5A534F] mt-0.5">
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
            <div className="w-12 h-6 bg-[#D4C2AE] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D4C2AE] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#171514]"></div>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <Button type="submit" loading={saving} size="md">
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
