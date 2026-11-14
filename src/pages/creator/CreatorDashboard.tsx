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
  Calendar,
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
  // Next 5 submission/publishing deadlines from today onward for non-completed, non-cancelled deals.
  // Highlight overdue (red) and within 3 days (amber).
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
      <div className="space-y-6 max-w-6xl">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Welcome back, {user?.name?.split(' ')[0] || 'Creator'}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Overview of your active brand partnerships, pipeline receivables, and monthly profits.
          </p>
        </div>

        {/* Quick Links (§5.8 FR-DASH-5) */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/creator/deals/new"
            className="px-3 py-1.5 rounded-lg bg-creator-900 text-white font-semibold text-xs hover:bg-stone-900 shadow-xs transition-colors"
          >
            + New Deal
          </Link>
          <Link
            to="/creator/finance"
            className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 font-semibold text-xs hover:bg-stone-50 transition-colors"
          >
            Log Payout
          </Link>
          <Link
            to="/creator/contracts"
            className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-700 font-semibold text-xs hover:bg-stone-50 transition-colors"
          >
            AI Contract Review
          </Link>
        </div>
      </div>

      {/* Primary Financial Metric Cards (§5.8 FR-DASH-1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* HERO CARD: Net Earnings */}
        <div className="p-5 bg-stone-900 text-white rounded-xl shadow-xs border border-stone-800 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
              Net Earnings (Hero)
            </span>
            <span
              className={`text-2xl sm:text-3xl font-extrabold font-mono-numbers block mt-1 tracking-tight ${
                metrics.netEarnings < 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {formatINR(metrics.netEarnings)}
            </span>
          </div>
          <span className="text-[10px] text-stone-400 mt-2 block">Income − Expenses</span>
        </div>

        {/* Total Received Income */}
        <div className="p-5 bg-white border border-stone-200 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Received Income
            </span>
            <span className="text-2xl font-bold font-mono-numbers text-stone-900 block mt-1">
              {formatINR(metrics.totalReceivedIncome)}
            </span>
          </div>
          <span className="text-[10px] text-stone-500 mt-2 block">From all paid records</span>
        </div>

        {/* Total Expenses */}
        <div className="p-5 bg-white border border-stone-200 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Total Expenses
            </span>
            <span className="text-2xl font-bold font-mono-numbers text-stone-900 block mt-1">
              {formatINR(metrics.totalExpenses)}
            </span>
          </div>
          <span className="text-[10px] text-stone-500 mt-2 block">Production & gear costs</span>
        </div>

        {/* Pending Payments (§0 #5) */}
        <div className="p-5 bg-white border border-stone-200 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Pending Payments
            </span>
            <span className="text-2xl font-bold font-mono-numbers text-amber-900 block mt-1">
              {formatINR(metrics.pendingPayments)}
            </span>
          </div>
          <span className="text-[10px] text-stone-500 mt-2 block">Unpaid on active deals</span>
        </div>

        {/* Active Collaborations */}
        <div className="p-5 bg-white border border-stone-200 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Active Deals
            </span>
            <span className="text-2xl font-bold font-mono-numbers text-stone-900 block mt-1">
              {metrics.activeCollaborations}
            </span>
          </div>
          <span className="text-[10px] text-stone-500 mt-2 block">Accepted & In Progress</span>
        </div>
      </div>

      {/* Chart & Upcoming Deadlines Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Financial Trend Chart (§5.8 FR-DASH-4) */}
        <div className="lg:col-span-2 p-5 bg-white border border-stone-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Monthly Net Profit Trend
              </h2>
              <p className="text-xs text-stone-500">
                Tracking monthly received payouts vs operational expenses.
              </p>
            </div>
            <Link
              to="/creator/finance"
              className="text-xs font-semibold text-creator-900 hover:underline flex items-center gap-1"
            >
              Full Finance →
            </Link>
          </div>
          <MonthlyTrendChart data={monthlyTrends} />
        </div>

        {/* Upcoming Deadlines Widget (§5.8 FR-DASH-2) */}
        <div className="p-5 bg-white border border-stone-200 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-creator-900" />
                Next Deadlines
              </h2>
              <Link
                to="/creator/deals"
                className="text-xs font-semibold text-creator-900 hover:underline"
              >
                All Deals
              </Link>
            </div>

            {topDeadlines.length === 0 ? (
              <p className="text-xs text-stone-500 py-6 text-center">
                No upcoming submission or publishing deadlines on active deals.
              </p>
            ) : (
              <div className="space-y-3">
                {topDeadlines.map((item) => {
                  const isOverdue = item.daysRemaining < 0;
                  const isDueSoon = item.daysRemaining >= 0 && item.daysRemaining <= 3;

                  let badgeColor = 'bg-surface-100 text-stone-700 border-stone-200';
                  let statusText = `${item.daysRemaining} days left`;

                  if (isOverdue) {
                    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
                    statusText = `Overdue by ${Math.abs(item.daysRemaining)}d`;
                  } else if (isDueSoon) {
                    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
                    statusText = item.daysRemaining === 0 ? 'Due Today' : `Due in ${item.daysRemaining}d`;
                  }

                  return (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/creator/deals/${item.dealId}`)}
                      className="p-2.5 rounded-lg border border-stone-100 hover:border-stone-300 hover:bg-surface-50 cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="truncate">
                          <p className="text-xs font-bold text-stone-900 truncate">
                            {item.campaignTitle}
                          </p>
                          <p className="text-[10px] text-stone-500 truncate">
                            {item.brandName} · {item.deadlineType}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded text-[10px] border ${badgeColor}`}
                        >
                          {statusText}
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-400 mt-1 font-mono-numbers">
                        {formatDate(item.dateStr)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-stone-100 mt-4 text-[10px] text-stone-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Overdue
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Within 3 days
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed (§5.8 FR-DASH-3) */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
        <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4 pb-2 border-b border-stone-100">
          Recent Activity & Events
        </h2>

        {recentActivities.length === 0 ? (
          <p className="text-xs text-stone-500 py-4 text-center">No recent activity recorded yet.</p>
        ) : (
          <div className="divide-y divide-stone-100">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="truncate pr-4">
                  <span className="font-bold text-stone-900">{act.title}</span>
                  <span className="text-stone-500 ml-2 truncate">{act.description}</span>
                </div>
                <span className="text-[10px] text-stone-400 font-mono-numbers shrink-0">
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
