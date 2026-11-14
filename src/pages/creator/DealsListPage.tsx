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
  Sparkles,
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
        return 'bg-[#E4E9F1] text-[#223851] border-[#C2D1E5]';
      case 'completed':
        return 'bg-[#E2F1E9] text-[#1E4936] border-[#B7DAC7]';
      case 'accepted':
        return 'bg-[#F4ECE1] text-[#7A6440] border-[#DEC6A5]';
      case 'cancelled':
        return 'bg-[#F1ECE4] text-[#695644] border-[#D4C2AE]';
      default:
        return 'bg-[#FAF7F2] text-[#5A534F] border-[#D4C2AE]';
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-[#1E4936] bg-[#E2F1E9] border-[#B7DAC7]';
      case 'partially_paid':
        return 'text-[#7A6440] bg-[#F4ECE1] border-[#DEC6A5]';
      default:
        return 'text-[#5A534F] bg-[#FAF7F2] border-[#D4C2AE]';
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#D4C2AE]/60">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] mb-1">
            <Sparkles className="w-3 h-3 text-[#B49A70]" />
            03 / Partnerships Pipeline
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#171514] tracking-tight">
            Brand Collaborations
          </h1>
          <p className="text-xs text-[#5A534F] mt-1">
            Active brand campaigns, content deliverables, milestone schedules, and payment receivables.
          </p>
        </div>
        <Button size="sm" onClick={() => navigate('/creator/deals/new')} className="gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4 text-[#B49A70]" />
          <span>New Collaboration</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#D4C2AE]/50 scrollbar-none">
        <Filter className="w-3.5 h-3.5 text-[#B49A70] shrink-0 ml-1 mr-1" />
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
              statusFilter === f.value
                ? 'bg-[#171514] text-[#FAF7F2] border border-[#282422] shadow-luxury'
                : 'text-[#5A534F] hover:text-[#171514] hover:bg-[#F3EAE0]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
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
          <div className="hidden md:block overflow-hidden bg-white border border-[#D4C2AE] rounded-2xl shadow-luxury">
            <table className="min-w-full divide-y divide-[#D4C2AE]/50 text-left text-xs">
              <thead className="bg-[#F3EAE0]/70 text-[#5A534F] font-semibold uppercase tracking-[0.08em] text-[10px]">
                <tr>
                  <th className="py-4 px-5">Brand & Campaign</th>
                  <th className="py-4 px-5">Deal Amount</th>
                  <th className="py-4 px-5">Deal Status</th>
                  <th className="py-4 px-5">Payment</th>
                  <th className="py-4 px-5">Next Deadline</th>
                  <th className="py-4 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4C2AE]/30">
                {filteredDeals.map((deal) => (
                  <tr
                    key={deal.id}
                    onClick={() => navigate(`/creator/deals/${deal.id}`)}
                    className="hover:bg-[#FAF7F2] cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-5">
                      <div className="font-serif font-bold text-sm text-[#171514]">{deal.campaign_title}</div>
                      <div className="text-[11px] text-[#7B726C] font-medium mt-0.5">{deal.brand_name}</div>
                    </td>
                    <td className="py-4 px-5 font-mono-numbers font-bold text-sm text-[#171514]">
                      {formatINR(deal.payment_amount)}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                          deal.deal_status
                        )}`}
                      >
                        {deal.deal_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getPaymentBadge(
                          deal.payment_status
                        )}`}
                      >
                        {deal.payment_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-[#7B726C] font-mono-numbers">
                      {formatDate(deal.publishing_deadline || deal.submission_deadline)}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <ChevronRight className="w-4 h-4 text-[#A9927A] inline-block" />
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
                className="p-5 bg-white border border-[#D4C2AE] rounded-2xl shadow-luxury active:bg-[#FAF7F2] transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#171514] leading-snug">
                      {deal.campaign_title}
                    </h3>
                    <p className="text-xs text-[#7B726C] font-medium">{deal.brand_name}</p>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                      deal.deal_status
                    )}`}
                  >
                    {deal.deal_status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#D4C2AE]/40 mt-3 text-xs">
                  <div className="font-mono-numbers font-bold text-sm text-[#171514]">
                    {formatINR(deal.payment_amount)}
                  </div>
                  <div className="text-[11px] text-[#7B726C] flex items-center gap-1.5 font-mono-numbers">
                    <Calendar className="w-3.5 h-3.5 text-[#B49A70]" />
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
