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
  FileText,
  ChevronDown,
  ChevronUp,
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
  const [sourceText, setSourceText] = useState('');
  const [showSourceText, setShowSourceText] = useState(false);

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

      if (doc.extracted_text) {
        setSourceText(doc.extracted_text);
      }

      // Populate form fields if terms already exist
      if (doc.extracted_terms && Object.keys(doc.extracted_terms).length > 0) {
        populateFields(doc.extracted_terms as ExtractedTerms, doc.ai_flags);
      } else {
        runAiAnalysis(doc.id, doc.extracted_text || undefined);
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

  const runAiAnalysis = async (docId: string, manualText?: string) => {
    try {
      setAnalyzing(true);
      setAnalysisError(null);
      const terms = await api.analyzeContract(docId, manualText || sourceText || undefined);
      populateFields(terms, terms.flags);
      toast.success('Contract intelligence terms extracted!');
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || 'AI term extraction failed or timed out.');
      toast.error(err.message || 'AI extraction could not complete. You can enter terms manually.');
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
        <Skeleton className="h-12 w-64 rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (!contract) return null;

  return (
    <div className="max-w-4xl space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#D4C2AE]/60">
        <div className="flex items-center gap-4">
          <Link
            to="/creator/contracts"
            className="p-2 rounded-xl border border-[#D4C2AE] bg-white hover:bg-[#FAF7F2] text-[#171514] transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] mb-0.5">
              <Sparkles className="w-3 h-3 text-[#B49A70]" />
              05 / AI Contract Audit
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171514] tracking-tight">
                Review & Term Confirmation
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  contract.review_status === 'confirmed'
                    ? 'bg-[#E2F1E9] text-[#1E4936] border-[#B7DAC7]'
                    : 'bg-[#F4ECE1] text-[#7A6440] border-[#DEC6A5]'
                }`}
              >
                {contract.review_status}
              </span>
              {import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY !== 'your_gemini_api_key_here' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  Gemini AI Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                  Mock Mode
                </span>
              )}
            </div>
            <p className="text-xs text-[#7B726C] font-mono mt-1">
              {contract.original_filename}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {analyzing ? (
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#5A534F] bg-[#F3EAE0] px-3.5 py-2 rounded-xl border border-[#D4C2AE]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#171514]" />
              AI Analyzing PDF...
            </span>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => runAiAnalysis(contract.id)}
              className="gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#B49A70]" />
              Re-analyze AI
            </Button>
          )}
        </div>
      </div>

      {/* Mandatory Disclaimer (§5.6 FR-CON-10) */}
      <div className="p-4 rounded-2xl bg-[#F3EAE0] border border-[#D4C2AE] text-xs text-[#7A6440] flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-4 h-4 text-[#B49A70] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Notice:</strong> AI-generated summary for information only. It is not legal advice. The original contract document is the legal source of truth.
        </p>
      </div>

      {/* Analysis Error / Manual Fallback Prompt (§5.6 FR-CON-5, FR-CON-11) */}
      {analysisError && (
        <div className="p-5 rounded-2xl bg-[#FAF3F1] border border-[#E7C2B9] text-xs text-[#A85F48] flex items-center justify-between">
          <div>
            <p className="font-bold">AI analysis timed out or could not extract text.</p>
            <p className="mt-0.5 text-stone-600">You can still enter and confirm all contract details manually below.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setAnalysisError(null)}>
            Enter Manually
          </Button>
        </div>
      )}

      {/* Source Text Drawer & Manual Paste Option */}
      <div className="border border-[#D4C2AE] rounded-2xl bg-white overflow-hidden text-xs shadow-luxury">
        <button
          type="button"
          onClick={() => setShowSourceText(!showSourceText)}
          className="w-full px-5 py-3.5 bg-[#FAF7F2] hover:bg-[#F3EAE0] transition-colors flex items-center justify-between text-left font-semibold text-[#171514]"
        >
          <span className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-[#B49A70]" />
            <span>
              View / Edit Contract Source Text{' '}
              <span className="text-[#7B726C] font-normal">
                {sourceText.trim() ? `(${sourceText.length} characters extracted)` : '(No text extracted - paste below)'}
              </span>
            </span>
          </span>
          {showSourceText ? (
            <ChevronUp className="w-4 h-4 text-[#7B726C]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#7B726C]" />
          )}
        </button>

        {showSourceText && (
          <div className="p-5 space-y-3.5 border-t border-[#D4C2AE]/50 bg-[#FAF7F2]/60">
            <p className="text-[#5A534F]">
              This is the text extracted from the PDF by <code>pdfjs-dist</code>. You can edit this text or paste terms from any brand agreement, then click &quot;Analyze with Gemini&quot; below.
            </p>
            <Textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Paste contract terms or clause text here..."
              rows={6}
              className="font-mono text-xs bg-white"
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                onClick={() => runAiAnalysis(contract.id, sourceText)}
                loading={analyzing}
                disabled={!sourceText.trim()}
                className="gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Analyze This Text with Gemini
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Plain Language Summary Card (§5.6 FR-CON-6) */}
      <div className="p-6 sm:p-7 bg-white border border-[#D4C2AE] rounded-2xl space-y-3 shadow-luxury">
        <div className="flex items-center justify-between pb-3 border-b border-[#D4C2AE]/50">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] block">
              Plain English Breakdown
            </span>
            <h2 className="text-xl font-serif font-bold text-[#171514] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#B49A70]" />
              Contract Executive Summary (Max 150 Words)
            </h2>
          </div>
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
        <div className="p-6 sm:p-7 bg-white border border-[#D4C2AE] rounded-2xl space-y-4 shadow-luxury">
          <div className="pb-3 border-b border-[#D4C2AE]/50">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#A85F48] block">
              Attention Required
            </span>
            <h2 className="text-xl font-serif font-bold text-[#171514] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#A85F48]" />
              Points to Review (Flagged Risk Clauses)
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {flags.map((f, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-[#FAF3F1] border border-[#E7C2B9] space-y-1.5"
              >
                <div className="text-xs font-serif font-bold text-[#A85F48] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A85F48]" />
                  {f.clause}
                </div>
                <p className="text-[11px] text-[#5A534F] leading-relaxed">{f.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form: Structured & Editable Deal Terms (§5.6 FR-CON-6, FR-CON-7) */}
      <form onSubmit={handleConfirmAndSave} className="space-y-6">
        <div className="p-6 sm:p-7 bg-white border border-[#D4C2AE] rounded-2xl space-y-4 shadow-luxury">
          <div className="pb-3 border-b border-[#D4C2AE]/50">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] block">
              Parameter Extraction
            </span>
            <h2 className="text-xl font-serif font-bold text-[#171514]">
              Extracted Structured Terms (Editable)
            </h2>
            <p className="text-xs text-[#7B726C] mt-0.5">
              Fields AI could not find show as empty. Edit any term to match your agreement before confirming.
            </p>
          </div>

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
        <div className="p-6 sm:p-7 bg-white border border-[#D4C2AE] rounded-2xl space-y-4 shadow-luxury">
          <div className="pb-3 border-b border-[#D4C2AE]/50">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] block">
              Deal Synchronization
            </span>
            <h2 className="text-xl font-serif font-bold text-[#171514]">
              Link to Collaboration Deal
            </h2>
            <p className="text-xs text-[#7B726C] mt-0.5">
              Connect these confirmed terms to an existing collaboration or generate a new deal record.
            </p>
          </div>

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
            <div className="pt-2 flex items-center justify-between p-4 rounded-xl bg-[#FAF7F2] border border-[#D4C2AE]">
              <span className="text-xs text-[#5A534F]">
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
            <CheckCircle2 className="w-4 h-4 text-[#B49A70]" />
            <span>Confirm & Save Contract Terms</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
