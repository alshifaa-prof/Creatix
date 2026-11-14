import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import type {
  ContractDocument,
  Collaboration,
  ExtractedTerms,
} from '../../types';
import { formatINR } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  ShieldAlert,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export const ContractReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [contract, setContract] = useState<ContractDocument | null>(null);
  const [deals, setDeals] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);

  // Editable Form fields (§5.6 FR-CON-6)
  const [summary, setSummary] = useState('');
  const [brandName, setBrandName] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [paymentConditions, setPaymentConditions] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [submissionDeadline, setSubmissionDeadline] = useState('');
  const [publishingDeadline, setPublishingDeadline] = useState('');
  const [exclusivity, setExclusivity] = useState('');
  const [usageLicensing, setUsageLicensing] = useState('');
  const [flags, setFlags] = useState<Array<{ clause: string; reason: string }>>([]);

  // Deal Link Selection (§5.6 FR-CON-8)
  const [selectedDealId, setSelectedDealId] = useState<string>('');

  useEffect(() => {
    if (!id || !user) return;
    loadData();
  }, [id, user]);

  const loadData = async () => {
    if (!id || !user) return;
    try {
      setLoading(true);
      const [doc, allDeals] = await Promise.all([
        api.getContractById(id),
        api.getDeals(user.id),
      ]);

      if (!doc) {
        toast.error('Contract not found.');
        navigate('/creator/contracts');
        return;
      }

      setContract(doc);
      setDeals(allDeals);
      setSelectedDealId(doc.collaboration_id || '');

      // Populate form fields if terms already exist
      if (doc.extracted_terms && Object.keys(doc.extracted_terms).length > 0) {
        populateFields(doc.extracted_terms as ExtractedTerms, doc.ai_flags);
      } else {
        // Trigger AI analysis if unanalyzed
        runAiAnalysis(doc.id);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load contract.');
    } finally {
      setLoading(false);
    }
  };

  const populateFields = (
    terms: Partial<ExtractedTerms>,
    flagList: Array<{ clause: string; reason: string }> = []
  ) => {
    setSummary(terms.summary || '');
    setBrandName(terms.brand_name || '');
    setPaymentAmount(terms.payment_amount !== null && terms.payment_amount !== undefined ? String(terms.payment_amount) : '');
    setCurrency(terms.currency || 'INR');
    setPaymentConditions(terms.payment_conditions || '');
    setDeliverables(terms.deliverables ? terms.deliverables.join('\n') : '');
    setSubmissionDeadline(terms.submission_deadline || '');
    setPublishingDeadline(terms.publishing_deadline || '');
    setExclusivity(terms.exclusivity || '');
    setUsageLicensing(terms.usage_licensing || '');
    setFlags(flagList.length > 0 ? flagList : terms.flags || []);
  };

  const runAiAnalysis = async (docId: string) => {
    try {
      setAnalyzing(true);
      setAnalysisError(null);
      const terms = await api.analyzeContract(docId);
      populateFields(terms, terms.flags);
      toast.success('Contract intelligence terms extracted!');
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || 'AI term extraction failed or timed out.');
      toast.error('AI extraction could not complete. You can enter terms manually.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;

    try {
      setSaving(true);
      let targetDealId = selectedDealId;

      // Handle "Create new deal from these terms" option per PRD §5.6 FR-CON-8
      if (selectedDealId === 'NEW_DEAL') {
        const newCollab = await api.createDeal({
          creator_id: user.id,
          brand_id: null,
          enquiry_id: null,
          brand_name: brandName.trim() || 'Brand Partner',
          campaign_title: `${brandName.trim() || 'Brand'} Campaign`,
          description: summary || '',
          payment_amount: parseFloat(paymentAmount) || 0,
          deliverables: deliverables || '',
          submission_deadline: submissionDeadline || null,
          publishing_deadline: publishingDeadline || null,
          deal_status: 'accepted',
          payment_status: 'pending',
          notes: exclusivity ? `Exclusivity: ${exclusivity}` : '',
          show_on_profile: false,
        });
        targetDealId = newCollab.id;
        setSelectedDealId(newCollab.id);
        toast.success('New collaboration deal created from contract terms!');
      }

      const updatedTerms: ExtractedTerms = {
        summary: summary.trim(),
        brand_name: brandName.trim() || null,
        payment_amount: paymentAmount ? parseFloat(paymentAmount) : null,
        currency,
        payment_conditions: paymentConditions.trim() || null,
        deliverables: deliverables
          .split('\n')
          .map((d) => d.trim())
          .filter(Boolean),
        submission_deadline: submissionDeadline || null,
        publishing_deadline: publishingDeadline || null,
        exclusivity: exclusivity.trim() || null,
        usage_licensing: usageLicensing.trim() || null,
        flags,
      };

      const updatedDoc = await api.confirmContractTerms(
        id,
        updatedTerms,
        targetDealId || null,
        false
      );

      setContract(updatedDoc);
      toast.success('Contract terms confirmed and saved!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to confirm contract.');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyToDeal = async () => {
    if (!id || !selectedDealId || selectedDealId === 'NEW_DEAL') {
      toast.error('Please select an active deal to apply terms to.');
      return;
    }

    try {
      setApplying(true);
      const updatedTerms: Partial<ExtractedTerms> = {
        payment_amount: paymentAmount ? parseFloat(paymentAmount) : undefined,
        submission_deadline: submissionDeadline || undefined,
        publishing_deadline: publishingDeadline || undefined,
      };

      await api.confirmContractTerms(id, updatedTerms, selectedDealId, true);
      toast.success('Payment amount and deadlines applied to collaboration deal!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to apply terms to deal.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!contract) return null;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <Link
            to="/creator/contracts"
            className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif font-bold text-stone-900">
                Contract Review & Term Confirmation
              </h1>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  contract.review_status === 'confirmed'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {contract.review_status}
              </span>
            </div>
            <p className="text-xs text-stone-500 font-mono mt-0.5">
              {contract.original_filename}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {analyzing ? (
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-lg">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-creator-900" />
              AI Analyzing PDF...
            </span>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => runAiAnalysis(contract.id)}
              className="gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-analyze AI
            </Button>
          )}
        </div>
      </div>

      {/* Mandatory Disclaimer (§5.6 FR-CON-10) */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Notice:</strong> AI-generated summary for information only. It is not legal advice. The original contract is the source of truth.
        </p>
      </div>

      {/* Analysis Error / Manual Fallback Prompt (§5.6 FR-CON-5, FR-CON-11) */}
      {analysisError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div>
            <p className="font-bold">AI analysis timed out or could not extract text.</p>
            <p className="mt-0.5">You can still enter and confirm all contract details manually below.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setAnalysisError(null)}>
            Enter Manually
          </Button>
        </div>
      )}

      {/* Plain Language Summary Card (§5.6 FR-CON-6) */}
      <div className="p-6 bg-white border border-stone-200 rounded-xl space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-creator-900" />
            Plain-Language Contract Summary (Max 150 Words)
          </h2>
        </div>

        <Textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Summary of brand obligations, campaign scope, and deliverables..."
          rows={3}
        />
      </div>

      {/* Points to Review / Flagged Clauses (§5.6 FR-CON-6) */}
      {flags.length > 0 && (
        <div className="p-6 bg-white border border-stone-200 rounded-xl space-y-3 shadow-xs">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Points to Review (Flagged Clauses)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {flags.map((f, i) => (
              <div
                key={i}
                className="p-3.5 rounded-lg bg-rose-50/60 border border-rose-200/80 space-y-1"
              >
                <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                  {f.clause}
                </div>
                <p className="text-[11px] text-stone-700 leading-relaxed">{f.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form: Structured & Editable Deal Terms (§5.6 FR-CON-6, FR-CON-7) */}
      <form onSubmit={handleConfirmAndSave} className="space-y-6">
        <div className="p-6 bg-white border border-stone-200 rounded-xl space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            Extracted Structured Terms (Editable)
          </h2>
          <p className="text-xs text-stone-500">
            Fields AI could not find show as empty. Edit any term to match your agreement before confirming.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Brand Name"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Not found in contract"
            />

            <Input
              label="Payment Amount (₹)"
              type="number"
              min="0"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Not found in contract"
            />

            <Input
              label="Payment Conditions"
              value={paymentConditions}
              onChange={(e) => setPaymentConditions(e.target.value)}
              placeholder="e.g. Net 30 days upon delivery"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Submission Deadline"
              type="date"
              value={submissionDeadline}
              onChange={(e) => setSubmissionDeadline(e.target.value)}
            />

            <Input
              label="Publishing Deadline"
              type="date"
              value={publishingDeadline}
              onChange={(e) => setPublishingDeadline(e.target.value)}
            />
          </div>

          <Textarea
            label="Deliverables (one per line)"
            value={deliverables}
            onChange={(e) => setDeliverables(e.target.value)}
            placeholder="Not found in contract"
            rows={3}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Textarea
              label="Exclusivity Terms"
              value={exclusivity}
              onChange={(e) => setExclusivity(e.target.value)}
              placeholder="e.g. 30 days for competing Ayurvedic skincare brands"
              rows={2}
            />

            <Textarea
              label="Usage & Licensing Rights"
              value={usageLicensing}
              onChange={(e) => setUsageLicensing(e.target.value)}
              placeholder="e.g. Whitelist digital ads on Meta for 60 days"
              rows={2}
            />
          </div>
        </div>

        {/* Link to Collaboration Deal (§5.6 FR-CON-8, FR-CON-9) */}
        <div className="p-6 bg-white border border-stone-200 rounded-xl space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            Link to Collaboration Deal
          </h2>
          <p className="text-xs text-stone-500">
            Connect these confirmed terms to an existing collaboration or generate a new deal.
          </p>

          <Select
            label="Select Collaboration Deal"
            value={selectedDealId}
            onChange={(e) => setSelectedDealId(e.target.value)}
            options={[
              { label: 'Do not link to a deal yet', value: '' },
              { label: '+ Create new deal from these terms', value: 'NEW_DEAL' },
              ...deals.map((d) => ({
                label: `${d.brand_name} · ${d.campaign_title} (${formatINR(d.payment_amount)})`,
                value: d.id,
              })),
            ]}
          />

          {/* Explicit Apply Payment & Deadlines Button (§5.6 FR-CON-9) */}
          {selectedDealId && selectedDealId !== 'NEW_DEAL' && (
            <div className="pt-2 flex items-center justify-between p-3.5 rounded-lg bg-surface-50 border border-stone-200">
              <span className="text-xs text-stone-700">
                Update deal <strong>{formatINR(parseFloat(paymentAmount) || 0)}</strong> and deadline values?
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleApplyToDeal}
                loading={applying}
              >
                Apply to Deal Record
              </Button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/creator/contracts')}
          >
            Cancel
          </Button>

          <Button type="submit" loading={saving} size="md" className="gap-2 w-full sm:w-auto">
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Save Contract Terms</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
