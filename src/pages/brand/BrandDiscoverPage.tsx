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
  Sparkles,
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
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="pb-6 border-b border-[#D4C2AE]/60">
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] mb-1">
          <Sparkles className="w-3 h-3 text-[#B49A70]" />
          02 / Creator Directory
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#171514] tracking-tight">
          Discover Indian Creators
        </h1>
        <p className="text-xs text-[#5A534F] mt-1">
          Explore vetted digital talent filtered by niche categories, follower scale, and engagement performance.
        </p>
      </div>

      {/* Filter & Search Bar (§5.5 FR-DISC-2 & FR-DISC-3) */}
      <div className="p-5 bg-white border border-[#D4C2AE] rounded-2xl shadow-luxury space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Search by display_name */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#B49A70]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by creator name..."
              className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#D4C2AE] rounded-xl text-[#171514] placeholder:text-[#A9927A] focus:outline-none focus:border-[#B49A70] transition-colors"
            />
          </div>

          {/* Niche Selector */}
          <Select
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            options={NICHES.map((n) => ({ label: n, value: n }))}
            className="text-xs py-2.5 bg-[#FAF7F2] border-[#D4C2AE] rounded-xl"
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
            className="text-xs py-2.5 bg-[#FAF7F2] border-[#D4C2AE] rounded-xl"
          />

          {/* Follower Range Filter */}
          <Select
            value={followerRange}
            onChange={(e) => setFollowerRange(e.target.value)}
            options={FOLLOWER_RANGES}
            className="text-xs py-2.5 bg-[#FAF7F2] border-[#D4C2AE] rounded-xl"
          />
        </div>
      </div>

      {/* Creator Cards Grid (§5.5 FR-DISC-4) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map(({ profile, creator }) => {
            const isShortlisted = shortlistedIds.includes(creator.user_id);

            return (
              <div
                key={creator.user_id}
                onClick={() => navigate(`/brand/creators/${creator.user_id}`)}
                className="bg-white border border-[#D4C2AE] rounded-2xl p-6 shadow-luxury hover:border-[#B49A70] hover:shadow-luxury-lg cursor-pointer transition-all flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top Bar with Avatar and Shortlist Button */}
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className="flex items-center gap-3.5">
                      {creator.profile_image_url ? (
                        <img
                          src={creator.profile_image_url}
                          alt={creator.display_name || profile.name || ''}
                          className="w-13 h-13 rounded-2xl object-cover border border-[#D4C2AE] shadow-xs"
                        />
                      ) : (
                        <div className="w-13 h-13 rounded-2xl bg-[#F3EAE0] flex items-center justify-center font-serif font-bold text-xl text-[#171514] border border-[#D4C2AE]">
                          {(creator.display_name || profile.name || 'C')[0]}
                        </div>
                      )}
                      <div>
                        <h3 className="font-serif font-bold text-base text-[#171514] group-hover:text-[#B49A70] transition-colors leading-tight">
                          {creator.display_name || profile.name}
                        </h3>
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#7A6440] bg-[#F4ECE1] px-2.5 py-0.5 rounded-full mt-1 border border-[#DEC6A5]">
                          {creator.niche}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleToggleShortlist(creator.user_id, e)}
                      title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                      className={`p-2 rounded-xl border transition-colors ${
                        isShortlisted
                          ? 'bg-[#F3EAE0] text-[#7A6440] border-[#B49A70]'
                          : 'bg-white text-[#A9927A] hover:text-[#171514] border-[#D4C2AE] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isShortlisted ? 'fill-[#B49A70] text-[#B49A70]' : ''}`} />
                    </button>
                  </div>

                  {creator.location && (
                    <p className="text-[11px] text-[#7B726C] flex items-center gap-1.5 mb-2.5">
                      <MapPin className="w-3.5 h-3.5 text-[#B49A70]" />
                      {creator.location}
                    </p>
                  )}

                  {creator.bio && (
                    <p className="text-xs text-[#5A534F] line-clamp-2 leading-relaxed mb-4">
                      {creator.bio}
                    </p>
                  )}
                </div>

                {/* Metrics Bar with Self-reported label (§5.5 FR-DISC-4) */}
                <div className="pt-3.5 border-t border-[#D4C2AE]/50">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-bold text-[#7B726C] uppercase tracking-wider">
                      Audience Size
                    </span>
                    <SelfReportedBadge />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-center">
                    <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#D4C2AE]/60">
                      <span className="text-sm font-serif font-bold font-mono-numbers text-[#171514] block">
                        {(creator.follower_count || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-[#7B726C]">IG Followers</span>
                    </div>

                    <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#D4C2AE]/60">
                      <span className="text-sm font-serif font-bold font-mono-numbers text-[#171514] block">
                        {creator.engagement_rate || 0}%
                      </span>
                      <span className="text-[10px] text-[#7B726C]">Engagement</span>
                    </div>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between text-xs text-[#171514] group-hover:text-[#B49A70] font-semibold pt-1 transition-colors">
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
