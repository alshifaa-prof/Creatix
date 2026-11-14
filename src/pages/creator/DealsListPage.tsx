import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import type { Collaboration, DealStatus } from '../../types';
import { formatINR, formatDate } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { EmptyState, Skeleton } from '../../components/ui/EmptyState';
import {
  Briefcase,
  Plus,
  Calendar,
  ChevronRight,
  Filter,
} from 'lucide-react';

const STATUS_FILTERS: Array<{ label: string; value: string }> = [
  { label: 'All Deals', value: 'all' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Cancelled', value: 'cancelled' },
];

export const DealsListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!user) return;
    loadDeals();
  }, [user]);

  const loadDeals = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await api.getDeals(user.id);
      setDeals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Sort by nearest publishing or submission deadline per PRD §5.3 FR-DEAL-6
  const filteredDeals = deals
    .filter((d) => (statusFilter === 'all' ? true : d.deal_status === statusFilter))
    .sort((a, b) => {
      const dateA = a.publishing_deadline || a.submission_deadline || '9999-12-31';
      const dateB = b.publishing_deadline || b.submission_deadline || '9999-12-31';
      return dateA.localeCompare(dateB);
    });

  const getStatusBadge = (status: DealStatus) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'accepted':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'cancelled':
        return 'bg-stone-100 text-stone-600 border-stone-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-emerald-700 bg-emerald-50/80 border-emerald-200';
      case 'partially_paid':
        return 'text-amber-800 bg-amber-50/80 border-amber-200';
      default:
        return 'text-stone-600 bg-stone-100 border-stone-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Brand Collaborations</h1>
          <p className="text-xs text-stone-500 mt-1">
            Track active deals, content deliverables, deadlines, and payment receivables.
          </p>
        </div>
        <Button size="sm" onClick={() => navigate('/creator/deals/new')} className="gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>New Collaboration</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-100 scrollbar-none">
        <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-1 mr-1" />
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === f.value
                ? 'bg-creator-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : filteredDeals.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No collaborations found"
          description={
            statusFilter === 'all'
              ? 'Start by creating your first brand collaboration or accept an incoming enquiry.'
              : `No deals currently in '${statusFilter}' status.`
          }
          actionLabel="Add Collaboration"
          onAction={() => navigate('/creator/deals/new')}
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Tabular View */}
          <div className="hidden md:block overflow-hidden bg-white border border-stone-200 rounded-xl shadow-xs">
            <table className="min-w-full divide-y divide-stone-200 text-left text-xs">
              <thead className="bg-surface-50 text-stone-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Brand & Campaign</th>
                  <th className="py-3.5 px-4">Deal Amount</th>
                  <th className="py-3.5 px-4">Deal Status</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Next Deadline</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredDeals.map((deal) => (
                  <tr
                    key={deal.id}
                    onClick={() => navigate(`/creator/deals/${deal.id}`)}
                    className="hover:bg-surface-50/70 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-900">{deal.campaign_title}</div>
                      <div className="text-[11px] text-stone-500 font-medium">{deal.brand_name}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono-numbers font-bold text-stone-900">
                      {formatINR(deal.payment_amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                          deal.deal_status
                        )}`}
                      >
                        {deal.deal_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${getPaymentBadge(
                          deal.payment_status
                        )}`}
                      >
                        {deal.payment_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 font-mono-numbers">
                      {formatDate(deal.publishing_deadline || deal.submission_deadline)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <ChevronRight className="w-4 h-4 text-stone-400 inline-block" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List (375px responsive design per UX rules) */}
          <div className="md:hidden space-y-3">
            {filteredDeals.map((deal) => (
              <div
                key={deal.id}
                onClick={() => navigate(`/creator/deals/${deal.id}`)}
                className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs active:bg-surface-100 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-sm text-stone-900 leading-snug">
                      {deal.campaign_title}
                    </h3>
                    <p className="text-xs text-stone-500 font-medium">{deal.brand_name}</p>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                      deal.deal_status
                    )}`}
                  >
                    {deal.deal_status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-2 text-xs">
                  <div className="font-mono-numbers font-bold text-stone-900">
                    {formatINR(deal.payment_amount)}
                  </div>
                  <div className="text-[11px] text-stone-500 flex items-center gap-1 font-mono-numbers">
                    <Calendar className="w-3 h-3 text-stone-400" />
                    {formatDate(deal.publishing_deadline || deal.submission_deadline)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
