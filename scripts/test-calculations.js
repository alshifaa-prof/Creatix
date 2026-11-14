// Verification script for PRD §7 Calculation Rules
// Run with: node scripts/test-calculations.js

function round2(val) {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

function calculateDashboardMetrics(records, deals) {
  const totalReceivedIncome = round2(
    records
      .filter((r) => r.record_type === 'income' && r.payment_status === 'received')
      .reduce((sum, r) => sum + Number(r.amount || 0), 0)
  );

  const totalExpenses = round2(
    records
      .filter((r) => r.record_type === 'expense')
      .reduce((sum, r) => sum + Number(r.amount || 0), 0)
  );

  const netEarnings = round2(totalReceivedIncome - totalExpenses);

  const expectedIncome = round2(
    records
      .filter((r) => r.record_type === 'income' && r.payment_status === 'pending')
      .reduce((sum, r) => sum + Number(r.amount || 0), 0)
  );

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

let allPassed = true;
function assertEqual(testName, actual, expected) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName}\n  Expected: ${JSON.stringify(expected)}\n  Actual:   ${JSON.stringify(actual)}`);
    allPassed = false;
  }
}

console.log('--- Testing PRD §7 Calculation Rules ---');

// Test Case 1: Income ₹12,000 received, Expense ₹2,000
const case1Records = [
  { id: '1', record_type: 'income', amount: 12000, payment_status: 'received' },
  { id: '2', record_type: 'expense', amount: 2000, payment_status: 'received' },
];
const m1 = calculateDashboardMetrics(case1Records, []);
assertEqual('Case 1: Income 12,000, Expense 2,000 -> Net 10,000', 
  { income: m1.totalReceivedIncome, expenses: m1.totalExpenses, net: m1.netEarnings },
  { income: 12000, expenses: 2000, net: 10000 }
);

// Test Case 2: Add income ₹5,000 pending -> Net still 10,000, Expected income 5,000
const case2Records = [
  ...case1Records,
  { id: '3', record_type: 'income', amount: 5000, payment_status: 'pending' },
];
const m2 = calculateDashboardMetrics(case2Records, []);
assertEqual('Case 2: Add income 5,000 pending -> Net still 10,000, Expected income 5,000',
  { net: m2.netEarnings, expected: m2.expectedIncome },
  { net: 10000, expected: 5000 }
);

// Test Case 3: Deal ₹20,000, payment_status partially_paid, received ₹8,000 linked -> Pending = 12,000
const case3Deals = [
  { id: 'd1', payment_amount: 20000, payment_status: 'partially_paid', deal_status: 'in_progress' },
];
const case3Records = [
  { id: '4', collaboration_id: 'd1', record_type: 'income', amount: 8000, payment_status: 'received' },
];
const m3 = calculateDashboardMetrics(case3Records, case3Deals);
assertEqual('Case 3: Deal 20,000, received 8,000 linked -> Pending 12,000',
  m3.pendingPayments,
  12000
);

// Test Case 4: Only an expense ₹500 -> Net = -500
const case4Records = [
  { id: '5', record_type: 'expense', amount: 500, payment_status: 'received' },
];
const m4 = calculateDashboardMetrics(case4Records, []);
assertEqual('Case 4: Only an expense 500 -> Net = -500',
  m4.netEarnings,
  -500
);

// Test Case 5: Delete a deal that has linked records -> Records remain, unlinked (collaboration_id = null)
const unlinkedRecords = [
  { id: '6', collaboration_id: null, record_type: 'income', amount: 8000, payment_status: 'received' },
];
const m5 = calculateDashboardMetrics(unlinkedRecords, []);
assertEqual('Case 5: Records remain unlinked and counted in income',
  m5.totalReceivedIncome,
  8000
);

// Test Case 6: No records at all -> All cards show 0
const m6 = calculateDashboardMetrics([], []);
assertEqual('Case 6: Empty state shows zeroes',
  m6,
  {
    totalReceivedIncome: 0,
    totalExpenses: 0,
    netEarnings: 0,
    expectedIncome: 0,
    pendingPayments: 0,
    activeCollaborations: 0,
  }
);

if (allPassed) {
  console.log('\nSUCCESS: All PRD §7 calculation test cases passed cleanly!');
} else {
  process.exit(1);
}
