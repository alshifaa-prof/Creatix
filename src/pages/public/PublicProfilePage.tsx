import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import type { CreatorProfile, Profile } from '../../types';
import { SelfReportedBadge } from '../../components/ui/SelfReportedBadge';
import { SampleDataBadge } from '../../components/ui/SampleDataBadge';
import { Skeleton } from '../../components/ui/EmptyState';
import { Lock, Instagram, Youtube, MapPin, ArrowUpRight } from 'lucide-react';

export const PublicProfilePage: React.FC = () => {
  const { creatorId } = useParams<{ creatorId: string }>();
  const [data, setData] = useState<{ profile: Profile; creator: CreatorProfile } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!creatorId) return;
    loadPublicProfile();
  }, [creatorId]);

  const loadPublicProfile = async () => {
    if (!creatorId) return;
    try {
      setLoading(true);
      const res = await api.getPublicCreatorProfile(creatorId);
      setData(res);
    } catch (e) {
      console.error(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center p-4">
        <div className="w-full max-w-xl space-y-4">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // PRD §5.2 FR-PROF-4: Share link works only when is_public = true
  if (!data || !data.creator.is_public) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold font-serif text-stone-900 mb-1">
          This profile is private
        </h1>
        <p className="text-xs text-stone-500 max-w-sm mb-6">
          The creator has not published their media kit publicly yet, or the profile link has expired.
        </p>
        <Link
          to="/"
          className="text-xs font-semibold text-creator-900 hover:underline"
        >
          Return to Creatix Home
        </Link>
      </div>
    );
  }

  const { creator } = data;

  return (
    <div className="min-h-screen bg-[#faf9f5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-creator-900 flex items-center justify-center text-white font-serif font-bold text-base shadow-xs">
              C
            </span>
            <span className="font-serif font-bold tracking-tight text-stone-900 text-lg">
              Creatix
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <SampleDataBadge />
            <Link
              to="/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Profile Pitch Header */}
        <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {creator.profile_image_url ? (
              <img
                src={creator.profile_image_url}
                alt={creator.display_name || 'Creator'}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-stone-200 shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-surface-200 flex items-center justify-center text-stone-700 font-serif font-bold text-3xl border border-stone-300">
                {(creator.display_name || 'C')[0]}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                  {creator.display_name || data.profile.name}
                </h1>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {creator.niche}
                </span>
              </div>

              {creator.location && (
                <p className="text-xs text-stone-500 flex items-center gap-1 mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  {creator.location}
                </p>
              )}

              {creator.bio && (
                <p className="text-sm text-stone-700 leading-relaxed max-w-xl">
                  {creator.bio}
                </p>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-6 pt-6 border-t border-stone-100 flex flex-wrap gap-3">
            {creator.instagram_url && (
              <a
                href={creator.instagram_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-surface-50 text-stone-800 hover:bg-stone-100 text-xs font-medium transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-rose-600" />
                Instagram Profile
                <ArrowUpRight className="w-3 h-3 text-stone-400" />
              </a>
            )}

            {creator.youtube_url && (
              <a
                href={creator.youtube_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-surface-50 text-stone-800 hover:bg-stone-100 text-xs font-medium transition-colors"
              >
                <Youtube className="w-3.5 h-3.5 text-red-600" />
                YouTube Channel
                <ArrowUpRight className="w-3 h-3 text-stone-400" />
              </a>
            )}
          </div>
        </div>

        {/* Audience Reach Cards */}
        <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              Audience Reach & Demographics
            </h2>
            <SelfReportedBadge />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-surface-50 border border-stone-200/80">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Instagram
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono-numbers text-stone-900 block mt-1">
                {(creator.follower_count || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">Followers</span>
            </div>

            <div className="p-4 rounded-lg bg-surface-50 border border-stone-200/80">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                YouTube
              </span>
              <span className="text-xl sm:text-2xl font-mono-numbers font-bold text-stone-900 block mt-1">
                {(creator.subscriber_count || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">Subscribers</span>
            </div>

            <div className="p-4 rounded-lg bg-surface-50 border border-stone-200/80">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Avg. Views
              </span>
              <span className="text-xl sm:text-2xl font-mono-numbers font-bold text-stone-900 block mt-1">
                {(creator.average_views || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">Per video / reel</span>
            </div>

            <div className="p-4 rounded-lg bg-surface-50 border border-stone-200/80">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Engagement
              </span>
              <span className="text-xl sm:text-2xl font-mono-numbers font-bold text-emerald-800 block mt-1">
                {creator.engagement_rate || 0}%
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">Avg. interaction</span>
            </div>
          </div>
        </div>

        {/* Footer Pitch */}
        <div className="p-6 rounded-xl bg-creator-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-serif font-bold text-lg">Interested in partnering?</h3>
            <p className="text-xs text-stone-200 mt-0.5">
              Sign in as a Brand to send a collaboration enquiry and negotiate deliverables.
            </p>
          </div>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-lg bg-white text-creator-900 font-semibold text-xs hover:bg-stone-100 transition-colors shrink-0 shadow-xs"
          >
            Send Collaboration Enquiry
          </Link>
        </div>
      </div>
    </div>
  );
};
