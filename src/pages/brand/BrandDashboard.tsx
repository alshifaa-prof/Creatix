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
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Brand Campaign Hub
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Discover creators, shortlist talent, and track responses to your collaboration proposals.
          </p>
        </div>

        <Link
          to="/brand/discover"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-900 text-white font-semibold text-xs hover:bg-black transition-colors shadow-xs"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Discover Creators</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-stone-200 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              <span>Shortlisted Creators</span>
              <Bookmark className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-3xl font-bold font-mono-numbers text-stone-900 block mt-2">
              {shortlistCount}
            </span>
          </div>
          <Link
            to="/brand/shortlist"
            className="text-xs font-semibold text-brand-900 hover:underline mt-4 flex items-center gap-1"
          >
            View Shortlist →
          </Link>
        </div>

        <div className="p-5 bg-white border border-stone-200 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              <span>Accepted Proposals</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-3xl font-bold font-mono-numbers text-emerald-800 block mt-2">
              {acceptedCount}
            </span>
          </div>
          <Link
            to="/brand/enquiries"
            className="text-xs font-semibold text-brand-900 hover:underline mt-4 flex items-center gap-1"
          >
            Review Statuses →
          </Link>
        </div>

        <div className="p-5 bg-white border border-stone-200 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              <span>Awaiting Response</span>
              <Clock className="w-4 h-4 text-stone-400" />
            </div>
            <span className="text-3xl font-bold font-mono-numbers text-stone-900 block mt-2">
              {pendingCount}
            </span>
          </div>
          <span className="text-[10px] text-stone-400 mt-4 block">Sent enquiries</span>
        </div>
      </div>

      {/* Sent Enquiries Summary Table */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            Recent Collaboration Proposals
          </h2>
          <Link
            to="/brand/enquiries"
            className="text-xs font-semibold text-brand-900 hover:underline"
          >
            All Sent Enquiries →
          </Link>
        </div>

        {enquiries.length === 0 ? (
          <p className="text-xs text-stone-500 py-6 text-center">
            No proposals sent yet. Explore the creator directory to send your first campaign brief.
          </p>
        ) : (
          <div className="divide-y divide-stone-100">
            {enquiries.slice(0, 5).map((enq) => (
              <div key={enq.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-stone-900">{enq.campaign_title}</p>
                  <p className="text-[11px] text-stone-500 font-mono-numbers">
                    Fee: {formatINR(enq.offered_payment)} · Sent {formatDate(enq.created_at)}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    enq.status === 'accepted'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : enq.status === 'rejected'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
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
