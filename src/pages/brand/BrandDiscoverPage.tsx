import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import type { CreatorProfile, Profile } from '../../types';
import { SelfReportedBadge } from '../../components/ui/SelfReportedBadge';
import { Select } from '../../components/ui/Input';
import { EmptyState, Skeleton } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import {
  Search,
  Bookmark,
  MapPin,
  ExternalLink,
} from 'lucide-react';

const NICHES = [
  'All',
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

const FOLLOWER_RANGES = [
  { label: 'All Follower Sizes', value: 'all' },
  { label: 'Nano (< 10k)', value: '<10k' },
  { label: 'Micro (10k – 50k)', value: '10k-50k' },
  { label: 'Mid-Tier (50k – 100k)', value: '50k-100k' },
  { label: 'Macro (100k+)', value: '100k+' },
];

export const BrandDiscoverPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [creators, setCreators] = useState<Array<{ profile: Profile; creator: CreatorProfile }>>([]);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state (§5.5 FR-DISC-2 & FR-DISC-3)
  const [search, setSearch] = useState('');
  const [niche, setNiche] = useState('All');
  const [platform, setPlatform] = useState<'all' | 'instagram' | 'youtube'>('all');
  const [followerRange, setFollowerRange] = useState('all');

  useEffect(() => {
    loadDirectory();
  }, [search, niche, platform, followerRange]);

  useEffect(() => {
    if (user) {
      loadShortlist();
    }
  }, [user]);

  const loadDirectory = async () => {
    try {
      setLoading(true);
      const data = await api.searchCreators({
        search,
        niche,
        platform,
        followerRange,
      });
      setCreators(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load creator directory.');
    } finally {
      setLoading(false);
    }
  };

  const loadShortlist = async () => {
    if (!user) return;
    try {
      const ids = await api.getShortlistedCreatorIds(user.id);
      setShortlistedIds(ids);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleShortlist = async (creatorUserId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      const { shortlisted } = await api.toggleShortlist(user.id, creatorUserId);
      if (shortlisted) {
        setShortlistedIds((prev) => [...prev, creatorUserId]);
        toast.success('Creator added to shortlist.');
      } else {
        setShortlistedIds((prev) => prev.filter((id) => id !== creatorUserId));
        toast.success('Creator removed from shortlist.');
      }
    } catch (err: any) {
      toast.error('Failed to update shortlist.');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setNiche('All');
    setPlatform('all');
    setFollowerRange('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-stone-200">
        <h1 className="text-2xl font-serif font-bold text-stone-900">Discover Indian Creators</h1>
        <p className="text-xs text-stone-500 mt-1">
          Explore vetted digital creators by niche, audience reach, and content specialisation.
        </p>
      </div>

      {/* Filter & Search Bar (§5.5 FR-DISC-2 & FR-DISC-3) */}
      <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search by display_name */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by creator name..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-surface-50 border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-800"
            />
          </div>

          {/* Niche Selector */}
          <Select
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            options={NICHES.map((n) => ({ label: n, value: n }))}
            className="text-xs py-2 bg-surface-50"
          />

          {/* Platform Filter */}
          <Select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as any)}
            options={[
              { label: 'All Channels', value: 'all' },
              { label: 'Has Instagram', value: 'instagram' },
              { label: 'Has YouTube', value: 'youtube' },
            ]}
            className="text-xs py-2 bg-surface-50"
          />

          {/* Follower Range Filter */}
          <Select
            value={followerRange}
            onChange={(e) => setFollowerRange(e.target.value)}
            options={FOLLOWER_RANGES}
            className="text-xs py-2 bg-surface-50"
          />
        </div>
      </div>

      {/* Creator Cards Grid (§5.5 FR-DISC-4) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : creators.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No creators match your filters"
          description="Try broadening your search term or resetting your niche and follower range filters."
          actionLabel="Clear All Filters"
          onAction={clearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {creators.map(({ profile, creator }) => {
            const isShortlisted = shortlistedIds.includes(creator.user_id);

            return (
              <div
                key={creator.user_id}
                onClick={() => navigate(`/brand/creators/${creator.user_id}`)}
                className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs hover:border-stone-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top Bar with Avatar and Shortlist Button */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {creator.profile_image_url ? (
                        <img
                          src={creator.profile_image_url}
                          alt={creator.display_name || profile.name || ''}
                          className="w-13 h-13 rounded-full object-cover border border-stone-200 shadow-2xs"
                        />
                      ) : (
                        <div className="w-13 h-13 rounded-full bg-surface-200 flex items-center justify-center font-serif font-bold text-lg text-stone-700 border border-stone-300">
                          {(creator.display_name || profile.name || 'C')[0]}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-sm text-stone-900 group-hover:text-brand-900 transition-colors">
                          {creator.display_name || profile.name}
                        </h3>
                        <span className="inline-block text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5 border border-emerald-200">
                          {creator.niche}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleToggleShortlist(creator.user_id, e)}
                      title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                      className={`p-2 rounded-lg border transition-colors ${
                        isShortlisted
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-white text-stone-400 hover:text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isShortlisted ? 'fill-amber-600' : ''}`} />
                    </button>
                  </div>

                  {creator.location && (
                    <p className="text-[11px] text-stone-500 flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3" />
                      {creator.location}
                    </p>
                  )}

                  {creator.bio && (
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
                      {creator.bio}
                    </p>
                  )}
                </div>

                {/* Metrics Bar with Self-reported label (§5.5 FR-DISC-4) */}
                <div className="pt-3 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider">
                      Audience Size
                    </span>
                    <SelfReportedBadge />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-surface-50 p-2 rounded-lg border border-stone-100">
                      <span className="text-xs font-bold font-mono-numbers text-stone-900 block">
                        {(creator.follower_count || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-stone-400">IG Followers</span>
                    </div>

                    <div className="bg-surface-50 p-2 rounded-lg border border-stone-100">
                      <span className="text-xs font-bold font-mono-numbers text-stone-900 block">
                        {creator.engagement_rate || 0}%
                      </span>
                      <span className="text-[10px] text-stone-400">Engagement</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-brand-900 font-semibold pt-1">
                    <span>View Profile & Pitch</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
