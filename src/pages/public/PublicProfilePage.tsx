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
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="w-full max-w-xl space-y-4">
          <Skeleton className="h-12 w-48 mx-auto rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  // PRD §5.2 FR-PROF-4: Share link works only when is_public = true
  if (!data || !data.creator.is_public) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center text-[#171514]">
        <div className="w-14 h-14 rounded-2xl bg-[#F3EAE0] border border-[#D4C2AE] flex items-center justify-center text-[#7B726C] mb-4 shadow-luxury">
          <Lock className="w-6 h-6 text-[#B49A70]" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B49A70] block mb-1">
          Restricted Access
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171514] mb-2">
          This profile is private
        </h1>
        <p className="text-xs text-[#5A534F] max-w-sm mb-6 leading-relaxed">
          The creator has not published their media kit publicly yet, or the profile link has expired.
        </p>
        <Link
          to="/"
          className="text-xs font-semibold px-4 py-2 rounded-xl bg-[#171514] text-[#FAF7F2] hover:bg-[#282422] transition-colors shadow-luxury"
        >
          Return to Creatix Home
        </Link>
      </div>
    );
  }

  const { creator } = data;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#171514] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between pb-5 border-b border-[#D4C2AE]/60">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#B49A70] to-[#7A6440] flex items-center justify-center text-[#171514] font-serif font-bold text-lg shadow-luxury group-hover:scale-105 transition-transform">
              C
            </span>
            <span className="font-serif font-bold tracking-tight text-[#171514] text-xl">
              Creatix
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <SampleDataBadge />
            <Link
              to="/login"
              className="text-xs font-semibold px-4 py-2 rounded-xl border border-[#D4C2AE] bg-white hover:bg-[#FAF7F2] text-[#171514] shadow-xs transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Profile Pitch Header Card */}
        <div className="bg-white border border-[#D4C2AE] rounded-3xl p-6 sm:p-10 shadow-luxury relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
            {creator.profile_image_url ? (
              <img
                src={creator.profile_image_url}
                alt={creator.display_name || 'Creator'}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-[#D4C2AE] shadow-luxury"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#F3EAE0] flex items-center justify-center text-[#171514] font-serif font-bold text-4xl border border-[#D4C2AE] shadow-luxury">
                {(creator.display_name || 'C')[0]}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#171514] tracking-tight">
                  {creator.display_name || data.profile.name}
                </h1>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F4ECE1] text-[#7A6440] border border-[#DEC6A5]">
                  {creator.niche}
                </span>
              </div>

              {creator.location && (
                <p className="text-xs text-[#7B726C] flex items-center gap-1.5 mb-3 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#B49A70]" />
                  {creator.location}
                </p>
              )}

              {creator.bio && (
                <p className="text-sm text-[#5A534F] leading-relaxed max-w-2xl font-normal">
                  {creator.bio}
                </p>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-8 pt-6 border-t border-[#D4C2AE]/50 flex flex-wrap gap-3">
            {creator.instagram_url && (
              <a
                href={creator.instagram_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#D4C2AE] bg-[#FAF7F2] text-[#171514] hover:bg-[#F3EAE0] text-xs font-semibold transition-colors"
              >
                <Instagram className="w-4 h-4 text-[#A85F48]" />
                Instagram Profile
                <ArrowUpRight className="w-3.5 h-3.5 text-[#7B726C]" />
              </a>
            )}

            {creator.youtube_url && (
              <a
                href={creator.youtube_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#D4C2AE] bg-[#FAF7F2] text-[#171514] hover:bg-[#F3EAE0] text-xs font-semibold transition-colors"
              >
                <Youtube className="w-4 h-4 text-[#A85F48]" />
                YouTube Channel
                <ArrowUpRight className="w-3.5 h-3.5 text-[#7B726C]" />
              </a>
            )}
          </div>
        </div>

        {/* Audience Reach Cards */}
        <div className="bg-white border border-[#D4C2AE] rounded-3xl p-6 sm:p-10 space-y-4 shadow-luxury">
          <div className="flex items-center justify-between pb-3 border-b border-[#D4C2AE]/50">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] block">
                Audience Scale
              </span>
              <h2 className="text-xl font-serif font-bold text-[#171514]">
                Reach & Demographics
              </h2>
            </div>
            <SelfReportedBadge />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D4C2AE]">
              <span className="text-[10px] font-bold text-[#7B726C] uppercase tracking-[0.18em] block">
                Instagram
              </span>
              <span className="text-2xl sm:text-3xl font-serif font-bold font-mono-numbers text-[#171514] block mt-1">
                {(creator.follower_count || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-[#7B726C] block mt-1">Followers</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D4C2AE]">
              <span className="text-[10px] font-bold text-[#7B726C] uppercase tracking-[0.18em] block">
                YouTube
              </span>
              <span className="text-2xl sm:text-3xl font-serif font-bold font-mono-numbers text-[#171514] block mt-1">
                {(creator.subscriber_count || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-[#7B726C] block mt-1">Subscribers</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#D4C2AE]">
              <span className="text-[10px] font-bold text-[#7B726C] uppercase tracking-[0.18em] block">
                Avg. Views
              </span>
              <span className="text-2xl sm:text-3xl font-serif font-bold font-mono-numbers text-[#171514] block mt-1">
                {(creator.average_views || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-[#7B726C] block mt-1">Per video / reel</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#F3EAE0] border border-[#D4C2AE]">
              <span className="text-[10px] font-bold text-[#7A6440] uppercase tracking-[0.18em] block">
                Engagement
              </span>
              <span className="text-2xl sm:text-3xl font-serif font-bold font-mono-numbers text-[#171514] block mt-1">
                {creator.engagement_rate || 0}%
              </span>
              <span className="text-[10px] text-[#7B726C] block mt-1">Avg. interaction</span>
            </div>
          </div>
        </div>

        {/* Footer Pitch Section */}
        <div className="p-7 sm:p-9 rounded-3xl bg-[#171514] text-[#FAF7F2] border border-[#282422] shadow-luxury-lg flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#B49A70]/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B49A70] block mb-1">
              Brand Partnerships
            </span>
            <h3 className="font-serif font-bold text-2xl text-white">Interested in partnering?</h3>
            <p className="text-xs text-[#A9927A] mt-1 max-w-md">
              Sign in as a Brand to send a collaboration enquiry, propose commercial fees, and review contract deliverables.
            </p>
          </div>
          <Link
            to="/signup"
            className="px-6 py-3 rounded-xl bg-[#F3EAE0] text-[#171514] font-semibold text-xs hover:bg-[#EAE1D6] transition-colors shrink-0 shadow-luxury border border-[#D4C2AE]"
          >
            Send Collaboration Enquiry
          </Link>
        </div>
      </div>
    </div>
  );
};
