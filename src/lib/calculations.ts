// Pure calculation rules per PRD §7
// All money values rounded to 2 decimal places

import type { FinancialRecord, Collaboration } from '../types';

export interface DashboardMetrics {
  totalReceivedIncome: number;
  totalExpenses: number;
  netEarnings: number;
  expectedIncome: number;
  pendingPayments: number;
  activeCollaborations: number;
}

export interface MonthlyFinancialSummary {
  month: string; // YYYY-MM
  income: number;
  expenses: number;
  net: number;
}

export interface CollaborationProfitability {
  collaborationId: string;
  campaignTitle: string;
  brandName: string;
  income: number;
  expenses: number;
  net: number;
}

function round2(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates dashboard cards & summary metrics per PRD §7
 */
export function calculateDashboardMetrics(
  records: FinancialRecord[],
  deals: Collaboration[]
): DashboardMetrics {
  // 1. Total Received Income
  const totalReceivedIncome = round2(
    records
      .filter((r) => r.record_type === 'income' && r.payment_status === 'received')
      .reduce((sum, r) => sum + Number(r.amount || 0), 0)
  );

  // 2. Total Expenses
  const totalExpenses = round2(
    records
      .filter((r) => r.record_type === 'expense')
      .reduce((sum, r) => sum + Number(r.amount || 0), 0)
  );

  // 3. Net Earnings = TotalReceivedIncome - TotalExpenses (pending income NEVER enters net)
  const netEarnings = round2(totalReceivedIncome - totalExpenses);

  // 4. Expected Income (pending income records)
  const expectedIncome = round2(
    records
      .filter((r) => r.record_type === 'income' && r.payment_status === 'pending')
      .reduce((sum, r) => sum + Number(r.amount || 0), 0)
  );

  // 5. Pending Payments per PRD §0 #5 & §7:
  // For each deal D where deal_status != 'cancelled' AND payment_status != 'paid':
  // ReceivedForD = SUM(amount) of income records linked to D with status 'received'
  // PendingForD = MAX(0, D.payment_amount - ReceivedForD)
  // PendingPayments = SUM(PendingForD)
  let pendingPayments = 0;
  for (const deal of deals) {
    if (deal.deal_status === 'cancelled' || deal.payment_status === 'paid') {
      continue;
    }

    const receivedForDeal = records
      .filter(
        (r) =>
          r.collaboration_id === deal.id &&
          r.record_type === 'income' &&
          r.payment_status === 'received'
      )
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);

    const pendingForDeal = Math.max(0, Number(deal.payment_amount || 0) - receivedForDeal);
    pendingPayments += pendingForDeal;
  }
  pendingPayments = round2(pendingPayments);

  // 6. Active Collaborations = COUNT(deal_status IN ('accepted', 'in_progress'))
  const activeCollaborations = deals.filter((d) =>
    ['accepted', 'in_progress'].includes(d.deal_status)
  ).length;

  return {
    totalReceivedIncome,
    totalExpenses,
    netEarnings,
    expectedIncome,
    pendingPayments,
    activeCollaborations,
  };
}

/**
 * Group financial records by transaction_date month (YYYY-MM),
 * zero-filling missing months between min and max month per PRD §7.
 */
export function calculateMonthlyTrends(records: FinancialRecord[]): MonthlyFinancialSummary[] {
  if (records.length === 0) return [];

  // Map to hold aggregated data by month
  const monthlyData: Record<string, { income: number; expenses: number }> = {};
  let minDateStr: string | null = null;
  let maxDateStr: string | null = null;

  for (const record of records) {
    const dateStr = record.transaction_date;
    if (!dateStr) continue;

    const monthKey = dateStr.slice(0, 7); // YYYY-MM
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expenses: 0 };
    }

    if (record.record_type === 'income' && record.payment_status === 'received') {
      monthlyData[monthKey].income += Number(record.amount || 0);
    } else if (record.record_type === 'expense') {
      monthlyData[monthKey].expenses += Number(record.amount || 0);
    }

    if (!minDateStr || monthKey < minDateStr) minDateStr = monthKey;
    if (!maxDateStr || monthKey > maxDateStr) maxDateStr = monthKey;
  }

  if (!minDateStr || !maxDateStr) return [];

  // Zero-fill between min and max month
  const result: MonthlyFinancialSummary[] = [];
  const [minY, minM] = minDateStr.split('-').map(Number);
  const [maxY, maxM] = maxDateStr.split('-').map(Number);

  let curY = minY;
  let curM = minM;

  while (curY < maxY || (curY === maxY && curM <= maxM)) {
    const key = `${curY}-${String(curM).padStart(2, '0')}`;
    const data = monthlyData[key] || { income: 0, expenses: 0 };
    const inc = round2(data.income);
    const exp = round2(data.expenses);
    result.push({
      month: key,
      income: inc,
      expenses: exp,
      net: round2(inc - exp),
    });

    curM++;
    if (curM > 12) {
      curM = 1;
      curY++;
    }
  }

  return result;
}

/**
 * Calculates per-collaboration profitability for deals that have linked records
 */
export function calculateDealProfitability(
  records: FinancialRecord[],
  deals: Collaboration[]
): CollaborationProfitability[] {
  const result: CollaborationProfitability[] = [];

  for (const deal of deals) {
    const linked = records.filter((r) => r.collaboration_id === deal.id);
    if (linked.length === 0) continue;

    const income = round2(
      linked
        .filter((r) => r.record_type === 'income' && r.payment_status === 'received')
        .reduce((sum, r) => sum + Number(r.amount || 0), 0)
    );

    const expenses = round2(
      linked
        .filter((r) => r.record_type === 'expense')
        .reduce((sum, r) => sum + Number(r.amount || 0), 0)
    );

    result.push({
      collaborationId: deal.id,
      campaignTitle: deal.campaign_title,
      brandName: deal.brand_name,
      income,
      expenses,
      net: round2(income - expenses),
    });
  }

  return result;
}
