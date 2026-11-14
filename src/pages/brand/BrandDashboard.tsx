import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import type { Enquiry } from '../../types';
import { formatINR, formatDate } from '../../lib/format';
import { Skeleton } from '../../components/ui/EmptyState';
import {
  Compass,
  Bookmark,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export const BrandDashboard: React.FC = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [shortlistCount, setShortlistCount] = useState(0);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);

  useEffect(() => {
    if (!user) return;
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [ids, sentEnqs] = await Promise.all([
        api.getShortlistedCreatorIds(user.id),
        api.getSentEnquiries(user.id),
      ]);
      setShortlistCount(ids.length);
      setEnquiries(sentEnqs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const acceptedCount = enquiries.filter((e) => e.status === 'accepted').length;
  const pendingCount = enquiries.filter((e) => e.status === 'sent').length;

  if (loading) {
    return (
      <div className="space-y-6 w-full">
        <Skeleton className="h-12 w-64 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#D4C2AE]/60">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] mb-1">
            <Sparkles className="w-3 h-3 text-[#B49A70]" />
            01 / Brand Campaign HQ
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#171514] tracking-tight">
            Brand Campaign Hub
          </h1>
          <p className="text-xs text-[#5A534F] mt-1">
            Discover verified creator talent, manage shortlist rosters, and track proposal negotiation outcomes.
          </p>
        </div>

        <Link
          to="/brand/discover"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#171514] text-[#FAF7F2] font-semibold text-xs hover:bg-[#282422] transition-colors shadow-luxury border border-[#282422]"
        >
          <Compass className="w-4 h-4 text-[#B49A70]" />
          <span>Discover Creators</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Shortlist Card */}
        <div className="p-6 bg-white border border-[#D4C2AE] rounded-2xl shadow-luxury flex flex-col justify-between hover:border-[#B49A70] transition-colors">
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold text-[#7B726C] uppercase tracking-[0.18em]">
              <span>Shortlisted Talent</span>
              <Bookmark className="w-4 h-4 text-[#B49A70]" />
            </div>
            <span className="text-3xl sm:text-4xl font-serif font-bold font-mono-numbers text-[#171514] block mt-2">
              {shortlistCount}
            </span>
          </div>
          <Link
            to="/brand/shortlist"
            className="text-xs font-semibold text-[#171514] hover:text-[#B49A70] mt-4 flex items-center gap-1 transition-colors"
          >
            View Shortlist <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Accepted Proposals Card */}
        <div className="p-6 bg-[#171514] text-[#FAF7F2] border border-[#282422] rounded-2xl shadow-luxury-lg flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#B49A70]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#B49A70]/20 transition-all" />
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold text-[#B49A70] uppercase tracking-[0.18em]">
              <span>Accepted Proposals</span>
              <CheckCircle2 className="w-4 h-4 text-[#B49A70]" />
            </div>
            <span className="text-3xl sm:text-4xl font-serif font-bold font-mono-numbers text-white block mt-2">
              {acceptedCount}
            </span>
          </div>
          <Link
            to="/brand/enquiries"
            className="text-xs font-semibold text-[#D4C2AE] hover:text-white mt-4 flex items-center gap-1 transition-colors"
          >
            Review Statuses <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Awaiting Response Card */}
        <div className="p-6 bg-[#F3EAE0] border border-[#D4C2AE] rounded-2xl shadow-luxury flex flex-col justify-between hover:border-[#B49A70] transition-colors">
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold text-[#7A6440] uppercase tracking-[0.18em]">
              <span>Awaiting Response</span>
              <Clock className="w-4 h-4 text-[#7A6440]" />
            </div>
            <span className="text-3xl sm:text-4xl font-serif font-bold font-mono-numbers text-[#171514] block mt-2">
              {pendingCount}
            </span>
          </div>
          <span className="text-[10px] text-[#7B726C] mt-4 block">Sent enquiries</span>
        </div>
      </div>

      {/* Sent Enquiries Summary Table */}
      <div className="bg-white border border-[#D4C2AE] rounded-2xl p-6 sm:p-7 shadow-luxury">
        <div className="flex items-center justify-between pb-3 border-b border-[#D4C2AE]/50 mb-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] block">
              Recent Activity
            </span>
            <h2 className="text-xl font-serif font-bold text-[#171514]">
              Recent Collaboration Proposals
            </h2>
          </div>
          <Link
            to="/brand/enquiries"
            className="text-xs font-semibold text-[#171514] hover:text-[#B49A70] transition-colors"
          >
            All Sent Enquiries →
          </Link>
        </div>

        {enquiries.length === 0 ? (
          <p className="text-xs text-[#7B726C] py-8 text-center italic">
            No proposals sent yet. Explore the creator directory to send your first campaign brief.
          </p>
        ) : (
          <div className="divide-y divide-[#D4C2AE]/40">
            {enquiries.slice(0, 5).map((enq) => (
              <div key={enq.id} className="py-3.5 flex items-center justify-between text-xs hover:bg-[#FAF7F2] px-2 rounded-lg transition-colors">
                <div>
                  <p className="font-serif font-bold text-sm text-[#171514]">{enq.campaign_title}</p>
                  <p className="text-[11px] text-[#7B726C] font-mono mt-0.5">
                    Fee: {formatINR(enq.offered_payment)} · Sent {formatDate(enq.created_at)}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    enq.status === 'accepted'
                      ? 'bg-[#E2F1E9] text-[#1E4936] border-[#B7DAC7]'
                      : enq.status === 'rejected'
                      ? 'bg-[#FAF3F1] text-[#A85F48] border-[#E7C2B9]'
                      : 'bg-[#F4ECE1] text-[#7A6440] border-[#DEC6A5]'
                  }`}
                >
                  {enq.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
