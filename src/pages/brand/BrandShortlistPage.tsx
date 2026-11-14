import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import type { CreatorProfile, Profile } from '../../types';
import { EmptyState, Skeleton } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { Bookmark, ExternalLink, Trash2 } from 'lucide-react';

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
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-stone-200">
        <h1 className="text-2xl font-serif font-bold text-stone-900">Shortlisted Creators</h1>
        <p className="text-xs text-stone-500 mt-1">
          Creators saved for upcoming campaign outreach and collaboration review.
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {shortlistedCreators.map(({ profile, creator }) => (
            <div
              key={creator.user_id}
              onClick={() => navigate(`/brand/creators/${creator.user_id}`)}
              className="p-5 bg-white border border-stone-200 rounded-xl shadow-xs hover:border-stone-400 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    {creator.profile_image_url ? (
                      <img
                        src={creator.profile_image_url}
                        alt={creator.display_name || ''}
                        className="w-12 h-12 rounded-full object-cover border border-stone-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-surface-200 flex items-center justify-center font-serif font-bold text-stone-700">
                        {(creator.display_name || profile.name || 'C')[0]}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-sm text-stone-900">
                        {creator.display_name || profile.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5 inline-block">
                        {creator.niche}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleRemove(creator.user_id, e)}
                    className="p-1.5 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove from shortlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-600 py-2 border-t border-stone-100 font-mono-numbers">
                  <span>Followers: {(creator.follower_count || 0).toLocaleString('en-IN')}</span>
                  <span>Engagement: {creator.engagement_rate || 0}%</span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-brand-900">
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
