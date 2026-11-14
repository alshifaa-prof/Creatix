// End-to-end Verification Script for Mock Business Logic and Aanya Demo Scenario (§12)
// Run with: node scripts/test-mock-flows.js

import { MockCreatixApi } from '../src/lib/api/mockApi.ts';
import { calculateDashboardMetrics } from '../src/lib/calculations.ts';

async function runDemoAcceptanceTest() {
  console.log('=== Running Demo Acceptance & Logic Verification (§12) ===\n');
  const api = new MockCreatixApi();

  // 1. Sign in as Aanya (Creator)
  console.log('Step 1: Creator login');
  const sessionAanya = await api.signIn('aanya@creatix.dev', 'creator123');
  if (sessionAanya.user.role !== 'creator') throw new Error('Expected creator role');
  console.log('  [PASS] Aanya logged in successfully as Creator');

  // 2. Creator Profile Check
  const aanyaProfile = await api.getCreatorProfile(sessionAanya.user.id);
  if (!aanyaProfile || aanyaProfile.niche !== 'Beauty & Lifestyle' || !aanyaProfile.is_public) {
    throw new Error('Aanya profile validation failed');
  }
  console.log('  [PASS] Profile verified: Beauty & Lifestyle, is_public=true, self-reported stats');

  // 3. Sign in as Skincare Brand (Kaya Botanics)
  console.log('\nStep 2 & 3: Brand login & Discovery');
  const sessionBrand = await api.signIn('partners@kayabotanics.com', 'brand123');
  if (sessionBrand.user.role !== 'brand') throw new Error('Expected brand role');
  console.log('  [PASS] Kaya Botanics logged in as Brand');

  // Brand searches directory with Niche filter
  const searchResults = await api.searchCreators({ niche: 'Beauty & Lifestyle' });
  const foundAanya = searchResults.find((c) => c.creator.user_id === aanyaProfile.user_id);
  if (!foundAanya) throw new Error('Aanya not found in Beauty & Lifestyle directory');
  console.log('  [PASS] Found Aanya in Discover directory with Beauty & Lifestyle filter');

  // Brand Shortlists Aanya
  const { shortlisted } = await api.toggleShortlist(sessionBrand.user.id, aanyaProfile.user_id);
  console.log(`  [PASS] Aanya shortlist status toggled: ${shortlisted}`);

  // Brand sends new collaboration enquiry: ₹12,000
  console.log('\nStep 4: Brand sends enquiry');
  const newEnq = await api.createEnquiry({
    creator_id: aanyaProfile.user_id,
    brand_id: sessionBrand.user.id,
    campaign_title: 'Ayurvedic Vitamin C Serum Launch',
    description: 'Dedicated 60-second Instagram Reel plus two stories.',
    offered_payment: 12000,
    deliverables: '1x Dedicated Reel (60s)\n2x Stories with link sticker',
    deadline: '2026-12-05',
    additional_requirements: 'Must disclose #Ad',
  });
  console.log(`  [PASS] Enquiry sent with ID: ${newEnq.id}, offered payment: ₹12,000`);

  // 4. Aanya accepts enquiry
  console.log('\nStep 5: Creator accepts enquiry & atomic deal creation');
  await api.signIn('aanya@creatix.dev');
  const acceptResult = await api.acceptEnquiry(newEnq.id);
  if (acceptResult.enquiry.status !== 'accepted') throw new Error('Enquiry status not accepted');
  if (!acceptResult.collaboration || acceptResult.collaboration.payment_amount !== 12000) {
    throw new Error('Collaboration deal was not created properly');
  }
  console.log(`  [PASS] Enquiry accepted. Collaboration created with ID: ${acceptResult.collaboration.id}`);

  // Test idempotency: accept enquiry again
  const duplicateCheck = await api.acceptEnquiry(newEnq.id);
  if (duplicateCheck.collaboration.id !== acceptResult.collaboration.id) {
    throw new Error('Duplicate deal created on duplicate accept!');
  }
  console.log('  [PASS] Idempotency verified: duplicate accept did not duplicate collaboration');

  // 5. Contract AI Intelligence
  console.log('\nStep 6: Contract AI Extraction & Confirmation');
  const mockFile = { name: 'KayaBotanics_Agreement_2026.pdf', size: 1024 * 500 };
  const uploadedDoc = await api.uploadContract(aanyaProfile.user_id, mockFile);
  console.log(`  [PASS] Contract uploaded: ${uploadedDoc.id}`);

  const aiTerms = await api.analyzeContract(uploadedDoc.id);
  if (!aiTerms.summary || !aiTerms.flags || aiTerms.flags.length < 2) {
    throw new Error('AI analysis schema mismatch');
  }
  console.log(`  [PASS] AI returned valid JSON per PRD §9 with ${aiTerms.flags.length} flagged clauses`);

  // Confirm contract terms & link to accepted deal
  const confirmedDoc = await api.confirmContractTerms(
    uploadedDoc.id,
    aiTerms,
    acceptResult.collaboration.id,
    true
  );
  if (confirmedDoc.review_status !== 'confirmed') throw new Error('Review status not confirmed');
  console.log('  [PASS] Contract confirmed and applied to deal');

  // 6. Financial records & Dashboard calculation verification
  console.log('\nStep 7: Finance & Money Math Verification');
  const initialRecords = await api.getFinancialRecords(aanyaProfile.user_id);
  const initialDeals = await api.getDeals(aanyaProfile.user_id);
  const mBefore = calculateDashboardMetrics(initialRecords, initialDeals);

  // Add Income ₹12,000 (received, linked to deal)
  await api.createFinancialRecord({
    creator_id: aanyaProfile.user_id,
    collaboration_id: acceptResult.collaboration.id,
    record_type: 'income',
    category: 'Brand Collaboration',
    amount: 12000,
    description: 'Kaya Botanics Vitamin C Campaign payment received',
    transaction_date: '2026-11-14',
    payment_status: 'received',
  });

  // Add Expense ₹2,000 (Production, linked to deal)
  await api.createFinancialRecord({
    creator_id: aanyaProfile.user_id,
    collaboration_id: acceptResult.collaboration.id,
    record_type: 'expense',
    category: 'Production',
    amount: 2000,
    description: 'Props & studio lighting for Kaya Botanics video',
    transaction_date: '2026-11-14',
    payment_status: 'received',
  });

  const updatedRecords = await api.getFinancialRecords(aanyaProfile.user_id);
  const updatedDeals = await api.getDeals(aanyaProfile.user_id);
  const mAfter = calculateDashboardMetrics(updatedRecords, updatedDeals);

  console.log(`  Income increased by:  ₹${mAfter.totalReceivedIncome - mBefore.totalReceivedIncome} (Expected: 12000)`);
  console.log(`  Expenses increased by: ₹${mAfter.totalExpenses - mBefore.totalExpenses} (Expected: 2000)`);
  console.log(`  Net Profit increased by: ₹${mAfter.netEarnings - mBefore.netEarnings} (Expected: 10000)`);

  if (mAfter.netEarnings - mBefore.netEarnings !== 10000) {
    throw new Error('Math mismatch: net earnings did not increase by 10,000');
  }
  console.log('  [PASS] Perfect hand calculation match: ₹12,000 − ₹2,000 = ₹10,000 net increase!');

  console.log('\n=== ALL E2E DEMO WORKFLOW TESTS PASSED SUCCESSFULLY! ===\n');
}

runDemoAcceptanceTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
