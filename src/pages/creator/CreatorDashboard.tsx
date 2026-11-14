import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import type {
  Collaboration,
  FinancialRecord,
  Enquiry,
  ContractDocument,
} from '../../types';
import {
  calculateDashboardMetrics,
  calculateMonthlyTrends,
} from '../../lib/calculations';
import { formatINR, formatDate } from '../../lib/format';
import { MonthlyTrendChart } from '../../components/charts/MonthlyTrendChart';
import { Skeleton } from '../../components/ui/EmptyState';
import {
  Sparkles,
  ArrowUpRight,
  Plus,
} from 'lucide-react';

interface UpcomingDeadlineItem {
  id: string;
  dealId: string;
  brandName: string;
  campaignTitle: string;
  deadlineType: 'Submission' | 'Publishing';
  dateStr: string;
  daysRemaining: number;
}

interface ActivityEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'deal' | 'enquiry' | 'finance' | 'contract';
}

export const CreatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState<Collaboration[]>([]);
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [contracts, setContracts] = useState<ContractDocument[]>([]);

  useEffect(() => {
    if (!user) return;
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [fetchedDeals, fetchedRecords, fetchedEnquiries, fetchedContracts] =
        await Promise.all([
          api.getDeals(user.id),
          api.getFinancialRecords(user.id),
          api.getReceivedEnquiries(user.id),
          api.getContracts(user.id),
        ]);
      setDeals(fetchedDeals);
      setRecords(fetchedRecords);
      setEnquiries(fetchedEnquiries);
      setContracts(fetchedContracts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const metrics = calculateDashboardMetrics(records, deals);
  const monthlyTrends = calculateMonthlyTrends(records);

  // Compute upcoming deadlines per PRD §5.8 FR-DASH-2
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTime = new Date(todayStr).getTime();

  const deadlinesList: UpcomingDeadlineItem[] = [];
  for (const deal of deals) {
    if (['completed', 'cancelled'].includes(deal.deal_status)) continue;

    if (deal.submission_deadline) {
      const dTime = new Date(deal.submission_deadline).getTime();
      const diffDays = Math.ceil((dTime - todayTime) / (1000 * 60 * 60 * 24));
      deadlinesList.push({
        id: `${deal.id}-sub`,
        dealId: deal.id,
        brandName: deal.brand_name,
        campaignTitle: deal.campaign_title,
        deadlineType: 'Submission',
        dateStr: deal.submission_deadline,
        daysRemaining: diffDays,
      });
    }

    if (deal.publishing_deadline) {
      const dTime = new Date(deal.publishing_deadline).getTime();
      const diffDays = Math.ceil((dTime - todayTime) / (1000 * 60 * 60 * 24));
      deadlinesList.push({
        id: `${deal.id}-pub`,
        dealId: deal.id,
        brandName: deal.brand_name,
        campaignTitle: deal.campaign_title,
        deadlineType: 'Publishing',
        dateStr: deal.publishing_deadline,
        daysRemaining: diffDays,
      });
    }
  }

  // Sort by nearest deadline date and pick top 5
  deadlinesList.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  const topDeadlines = deadlinesList.slice(0, 5);

  // Compute recent activity: last 8 events per PRD §5.8 FR-DASH-3
  const activityEvents: ActivityEvent[] = [];

  for (const deal of deals) {
    activityEvents.push({
      id: `act-deal-${deal.id}`,
      title: `Collaboration ${deal.deal_status.replace('_', ' ')}`,
      description: `${deal.brand_name} · ${deal.campaign_title} (${formatINR(deal.payment_amount)})`,
      timestamp: deal.updated_at || deal.created_at,
      type: 'deal',
    });
  }

  for (const enq of enquiries) {
    activityEvents.push({
      id: `act-enq-${enq.id}`,
      title: `Enquiry ${enq.status}`,
      description: `${enq.campaign_title} (${formatINR(enq.offered_payment)})`,
      timestamp: enq.created_at,
      type: 'enquiry',
    });
  }

  for (const rec of records) {
    activityEvents.push({
      id: `act-rec-${rec.id}`,
      title: `${rec.record_type === 'income' ? 'Income Received' : 'Expense Recorded'}`,
      description: `${rec.category}: ${formatINR(rec.amount)} · ${rec.description || ''}`,
      timestamp: rec.created_at,
      type: 'finance',
    });
  }

  for (const doc of contracts) {
    if (doc.review_status === 'confirmed') {
      activityEvents.push({
        id: `act-doc-${doc.id}`,
        title: 'Contract Terms Confirmed',
        description: doc.original_filename || 'Agreement document',
        timestamp: doc.uploaded_at,
        type: 'contract',
      });
    }
  }

  activityEvents.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const recentActivities = activityEvents.slice(0, 8);

  if (loading) {
    return (
      <div className="space-y-6 w-full">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#D4C2AE]/60">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] mb-1">
            <Sparkles className="w-3 h-3 text-[#B49A70]" />
            01 / Executive Overview
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#171514] tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Creator'}
          </h1>
          <p className="text-xs text-[#5A534F] mt-1">
            Real-time pipeline analytics, pending receivables, and financial profitability intelligence.
          </p>
        </div>

        {/* Quick Links (§5.8 FR-DASH-5) */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/creator/deals/new"
            className="px-4 py-2 rounded-xl bg-[#171514] text-[#FAF7F2] font-semibold text-xs hover:bg-[#282422] shadow-luxury transition-all border border-[#282422] flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[#B49A70]" />
            <span>New Deal</span>
          </Link>
          <Link
            to="/creator/finance"
            className="px-4 py-2 rounded-xl border border-[#D4C2AE] bg-[#F3EAE0] text-[#171514] font-semibold text-xs hover:bg-[#EAE1D6] transition-all"
          >
            Log Payout
          </Link>
          <Link
            to="/creator/contracts"
            className="px-4 py-2 rounded-xl border border-[#D4C2AE] bg-white text-[#171514] font-semibold text-xs hover:bg-[#FAF7F2] transition-all"
          >
            AI Review
          </Link>
        </div>
      </div>

      {/* Primary Financial Metric Cards (§5.8 FR-DASH-1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* HERO CARD: Net Earnings */}
        <div className="p-6 bg-[#171514] text-[#FAF7F2] rounded-2xl shadow-luxury-lg border border-[#282422] flex flex-col justify-between sm:col-span-2 lg:col-span-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#B49A70]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#B49A70]/20 transition-all" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[#B49A70] uppercase tracking-[0.18em] block">
                Net Earnings
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#B49A70]/20 text-[#D4C2AE] border border-[#B49A70]/30 uppercase">
                Hero
              </span>
            </div>
            <span
              className={`text-2xl sm:text-3xl font-serif font-bold font-mono-numbers block tracking-tight ${
                metrics.netEarnings < 0 ? 'text-[#C47C6A]' : 'text-[#FAF7F2]'
              }`}
            >
              {formatINR(metrics.netEarnings)}
            </span>
          </div>
          <div className="pt-3 border-t border-[#282422] mt-3">
            <span className="text-[10px] text-[#A9927A] block font-mono">Income − Expenses</span>
          </div>
        </div>

        {/* Total Received Income */}
        <div className="p-6 bg-white border border-[#D4C2AE] rounded-2xl shadow-luxury flex flex-col justify-between hover:border-[#B49A70] transition-colors">
          <div>
            <span className="text-[10px] font-bold text-[#7B726C] uppercase tracking-[0.18em] block">
              Received Income
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-bold font-mono-numbers text-[#171514] block mt-1 tracking-tight">
              {formatINR(metrics.totalReceivedIncome)}
            </span>
          </div>
          <div className="pt-3 border-t border-[#D4C2AE]/50 mt-3">
            <span className="text-[10px] text-[#7B726C] block">From all paid records</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-6 bg-white border border-[#D4C2AE] rounded-2xl shadow-luxury flex flex-col justify-between hover:border-[#B49A70] transition-colors">
          <div>
            <span className="text-[10px] font-bold text-[#7B726C] uppercase tracking-[0.18em] block">
              Total Expenses
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-bold font-mono-numbers text-[#A85F48] block mt-1 tracking-tight">
              {formatINR(metrics.totalExpenses)}
            </span>
          </div>
          <div className="pt-3 border-t border-[#D4C2AE]/50 mt-3">
            <span className="text-[10px] text-[#7B726C] block">Production & gear costs</span>
          </div>
        </div>

        {/* Pending Payments (§0 #5) */}
        <div className="p-6 bg-[#F3EAE0] border border-[#D4C2AE] rounded-2xl shadow-luxury flex flex-col justify-between hover:border-[#B49A70] transition-colors">
          <div>
            <span className="text-[10px] font-bold text-[#7A6440] uppercase tracking-[0.18em] block">
              Pending Payments
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-bold font-mono-numbers text-[#171514] block mt-1 tracking-tight">
              {formatINR(metrics.pendingPayments)}
            </span>
          </div>
          <div className="pt-3 border-t border-[#D4C2AE]/60 mt-3">
            <span className="text-[10px] text-[#7B726C] block">Unpaid on active deals</span>
          </div>
        </div>

        {/* Active Collaborations */}
        <div className="p-6 bg-white border border-[#D4C2AE] rounded-2xl shadow-luxury flex flex-col justify-between hover:border-[#B49A70] transition-colors">
          <div>
            <span className="text-[10px] font-bold text-[#7B726C] uppercase tracking-[0.18em] block">
              Active Deals
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-bold font-mono-numbers text-[#171514] block mt-1 tracking-tight">
              {metrics.activeCollaborations}
            </span>
          </div>
          <div className="pt-3 border-t border-[#D4C2AE]/50 mt-3">
            <span className="text-[10px] text-[#7B726C] block">Accepted & In Progress</span>
          </div>
        </div>
      </div>

      {/* Chart & Upcoming Deadlines Grid: Asymmetric Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Financial Trend Chart (§5.8 FR-DASH-4) */}
        <div className="lg:col-span-8 p-6 bg-white border border-[#D4C2AE] rounded-2xl shadow-luxury">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#D4C2AE]/50">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] block">
                Financial Trend
              </span>
              <h2 className="text-xl font-serif font-bold text-[#171514]">
                Monthly Net Profit Trajectory
              </h2>
            </div>
            <Link
              to="/creator/finance"
              className="text-xs font-semibold text-[#171514] hover:text-[#B49A70] flex items-center gap-1 transition-colors"
            >
              Full Finance P&L <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <MonthlyTrendChart data={monthlyTrends} />
        </div>

        {/* Upcoming Deadlines Widget (§5.8 FR-DASH-2) */}
        <div className="lg:col-span-4 p-6 bg-white border border-[#D4C2AE] rounded-2xl shadow-luxury flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#D4C2AE]/50 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] block">
                  Calendar Watch
                </span>
                <h2 className="text-xl font-serif font-bold text-[#171514] flex items-center gap-1.5">
                  Next Deadlines
                </h2>
              </div>
              <Link
                to="/creator/deals"
                className="text-xs font-semibold text-[#171514] hover:text-[#B49A70] transition-colors"
              >
                All Deals →
              </Link>
            </div>

            {topDeadlines.length === 0 ? (
              <p className="text-xs text-[#7B726C] py-8 text-center italic">
                No upcoming submission or publishing deadlines on active deals.
              </p>
            ) : (
              <div className="space-y-3">
                {topDeadlines.map((item) => {
                  const isOverdue = item.daysRemaining < 0;
                  const isDueSoon = item.daysRemaining >= 0 && item.daysRemaining <= 3;

                  let badgeColor = 'bg-[#FAF7F2] text-[#5A534F] border-[#D4C2AE]';
                  let statusText = `${item.daysRemaining} days left`;

                  if (isOverdue) {
                    badgeColor = 'bg-[#FAF3F1] text-[#A85F48] border-[#E7C2B9] font-bold';
                    statusText = `Overdue by ${Math.abs(item.daysRemaining)}d`;
                  } else if (isDueSoon) {
                    badgeColor = 'bg-[#F3EAE0] text-[#7A6440] border-[#D4C2AE] font-bold';
                    statusText = item.daysRemaining === 0 ? 'Due Today' : `Due in ${item.daysRemaining}d`;
                  }

                  return (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/creator/deals/${item.dealId}`)}
                      className="p-3.5 rounded-xl border border-[#D4C2AE]/70 hover:border-[#B49A70] hover:bg-[#FAF7F2] cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="truncate">
                          <p className="text-xs font-bold text-[#171514] truncate font-serif">
                            {item.campaignTitle}
                          </p>
                          <p className="text-[11px] text-[#7B726C] truncate mt-0.5">
                            {item.brandName} · {item.deadlineType}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded text-[10px] border ${badgeColor}`}
                        >
                          {statusText}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#7B726C] mt-1.5 font-mono">
                        {formatDate(item.dateStr)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3.5 border-t border-[#D4C2AE]/50 mt-4 text-[10px] text-[#7B726C] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#A85F48] inline-block" /> Overdue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#B49A70] inline-block" /> Within 3 days
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed (§5.8 FR-DASH-3) */}
      <div className="bg-white border border-[#D4C2AE] rounded-2xl p-6 sm:p-7 shadow-luxury">
        <div className="flex items-center justify-between pb-3 border-b border-[#D4C2AE]/50 mb-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] block">
              Audit Trail
            </span>
            <h2 className="text-xl font-serif font-bold text-[#171514]">
              Recent Activity & Platform Events
            </h2>
          </div>
          <span className="text-xs text-[#7B726C]">Last 8 events</span>
        </div>

        {recentActivities.length === 0 ? (
          <p className="text-xs text-[#7B726C] py-6 text-center italic">No recent activity recorded yet.</p>
        ) : (
          <div className="divide-y divide-[#D4C2AE]/40">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between text-xs hover:bg-[#FAF7F2]/60 px-2 rounded-lg transition-colors">
                <div className="truncate pr-4 flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B49A70] shrink-0" />
                  <span className="font-semibold text-[#171514]">{act.title}</span>
                  <span className="text-[#7B726C] truncate">{act.description}</span>
                </div>
                <span className="text-[11px] text-[#7B726C] font-mono shrink-0">
                  {formatDate(act.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
