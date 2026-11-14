import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import type { CreatorProfile, Profile } from '../../types';
import { EmptyState, Skeleton } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { Bookmark, ExternalLink, Trash2, Sparkles } from 'lucide-react';

export const BrandShortlistPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shortlistedCreators, setShortlistedCreators] = useState<
    Array<{ profile: Profile; creator: CreatorProfile }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadShortlist();
  }, [user]);

  const loadShortlist = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const ids = await api.getShortlistedCreatorIds(user.id);
      const allCreators = await api.searchCreators({});
      const filtered = allCreators.filter((c) => ids.includes(c.creator.user_id));
      setShortlistedCreators(filtered);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load shortlisted creators.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (creatorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await api.toggleShortlist(user.id, creatorId);
      setShortlistedCreators((prev) => prev.filter((c) => c.creator.user_id !== creatorId));
      toast.success('Creator removed from shortlist.');
    } catch (err: any) {
      toast.error('Failed to update shortlist.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-12 w-64 rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 w-full">
      {/* Header */}
      <div className="pb-6 border-b border-[#D4C2AE]/60">
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] mb-1">
          <Sparkles className="w-3 h-3 text-[#B49A70]" />
          03 / Talent Roster
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#171514] tracking-tight">
          Shortlisted Creators
        </h1>
        <p className="text-xs text-[#5A534F] mt-1">
          Creators bookmarked for upcoming campaign outreach and collaboration review.
        </p>
      </div>

      {shortlistedCreators.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Your shortlist is empty"
          description="Browse our creator directory and bookmark talent that aligns with your brand voice and target demographics."
          actionLabel="Explore Creators"
          onAction={() => navigate('/brand/discover')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {shortlistedCreators.map(({ profile, creator }) => (
            <div
              key={creator.user_id}
              onClick={() => navigate(`/brand/creators/${creator.user_id}`)}
              className="p-6 bg-white border border-[#D4C2AE] rounded-2xl shadow-luxury hover:border-[#B49A70] hover:shadow-luxury-lg cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-3.5">
                    {creator.profile_image_url ? (
                      <img
                        src={creator.profile_image_url}
                        alt={creator.display_name || ''}
                        className="w-13 h-13 rounded-2xl object-cover border border-[#D4C2AE] shadow-xs"
                      />
                    ) : (
                      <div className="w-13 h-13 rounded-2xl bg-[#F3EAE0] flex items-center justify-center font-serif font-bold text-xl text-[#171514] border border-[#D4C2AE]">
                        {(creator.display_name || profile.name || 'C')[0]}
                      </div>
                    )}
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#171514] group-hover:text-[#B49A70] transition-colors">
                        {creator.display_name || profile.name}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A6440] bg-[#F4ECE1] px-2.5 py-0.5 rounded-full mt-1 inline-block border border-[#DEC6A5]">
                        {creator.niche}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleRemove(creator.user_id, e)}
                    className="p-2 rounded-xl text-[#7B726C] hover:text-[#A85F48] hover:bg-[#FAF3F1] transition-colors"
                    title="Remove from shortlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-[#7B726C] py-2.5 border-t border-[#D4C2AE]/50 font-mono">
                  <span>Followers: {(creator.follower_count || 0).toLocaleString('en-IN')}</span>
                  <span>Engagement: {creator.engagement_rate || 0}%</span>
                </div>
              </div>

              <div className="pt-3.5 border-t border-[#D4C2AE]/50 flex items-center justify-between text-xs font-semibold text-[#171514] group-hover:text-[#B49A70] transition-colors">
                <span>View Profile & Pitch</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
