import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import type { ContractDocument } from '../../types';
import { formatDate } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { EmptyState, Skeleton } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { extractTextFromPdf } from '../../lib/pdfExtractor';
import {
  FileText,
  UploadCloud,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const ContractsListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<ContractDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    loadContracts();
  }, [user]);

  const loadContracts = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await api.getContracts(user.id);
      setContracts(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load contract documents.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // PRD §5.6 FR-CON-1: PDF only, max 10MB
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a PDF document (.pdf only).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Contract file exceeds 10 MB limit.');
      return;
    }

    try {
      setUploading(true);
      let extractedText = '';
      try {
        const pdfResult = await extractTextFromPdf(file);
        extractedText = pdfResult.text;
        if (pdfResult.isLikelyScanned) {
          toast('Contract appears scanned (low text count). You can also edit terms manually.', { icon: 'ℹ️' });
        }
      } catch (pdfErr) {
        console.warn('PDF text extraction fallback:', pdfErr);
      }

      const newDoc = await api.uploadContract(user.id, file, extractedText);
      toast.success('Contract uploaded! Opening AI review screen...');
      navigate(`/creator/contracts/${newDoc.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Contract upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-12 w-64 rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 w-full">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#D4C2AE]/60">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.2em] text-[#B49A70] mb-1">
            <Sparkles className="w-3 h-3 text-[#B49A70]" />
            05 / Legal & AI Audit
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#171514] tracking-tight">
            AI Contract Intelligence
          </h1>
          <p className="text-xs text-[#5A534F] mt-1">
            Upload PDF brand agreements for instant plain-language term extraction, risk clause flagging, and deal synchronization.
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,application/pdf"
            className="hidden"
          />
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
            className="gap-2"
          >
            <UploadCloud className="w-4 h-4 text-[#B49A70]" />
            <span>Upload Contract PDF</span>
          </Button>
        </div>
      </div>

      {/* AI Intelligence Explainer Banner */}
      <div className="p-5 rounded-2xl bg-[#171514] text-[#FAF7F2] border border-[#282422] shadow-luxury flex items-start gap-4">
        <div className="w-8 h-8 rounded-lg bg-[#B49A70]/20 flex items-center justify-center text-[#B49A70] shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="text-xs text-[#A9927A] leading-relaxed">
          <strong className="text-white font-serif text-sm block mb-0.5">How Contract Review Works</strong>
          We extract key milestones from your PDF agreement, flag restrictive covenants (extended exclusivity, broad perpetual advertising rights), and format payment schedules so you can link them directly to collaboration deals.
        </div>
      </div>

      {/* Contracts List */}
      {contracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No contracts uploaded"
          description="Upload brand collaboration agreements in PDF format to extract deliverables and review potential risk clauses."
          actionLabel="Upload First Contract"
          onAction={() => fileInputRef.current?.click()}
        />
      ) : (
        <div className="bg-white border border-[#D4C2AE] rounded-2xl shadow-luxury divide-y divide-[#D4C2AE]/40 overflow-hidden">
          {contracts.map((doc) => {
            const isConfirmed = doc.review_status === 'confirmed';

            return (
              <div
                key={doc.id}
                onClick={() => navigate(`/creator/contracts/${doc.id}`)}
                className="p-5 sm:p-6 flex items-center justify-between hover:bg-[#FAF7F2] cursor-pointer transition-colors gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#F3EAE0] border border-[#D4C2AE] flex items-center justify-center text-[#171514] shrink-0">
                    <FileText className="w-5 h-5 text-[#B49A70]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-serif font-bold text-[#171514] truncate">
                      {doc.original_filename || 'Collaboration Agreement.pdf'}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#7B726C] font-mono">
                      <span>Uploaded {formatDate(doc.uploaded_at)}</span>
                      {doc.ai_flags && doc.ai_flags.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#A85F48] bg-[#FAF3F1] px-2 py-0.5 rounded-full border border-[#E7C2B9]">
                          <ShieldAlert className="w-3 h-3" />
                          {doc.ai_flags.length} Flagged Clauses
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isConfirmed
                        ? 'bg-[#E2F1E9] text-[#1E4936] border-[#B7DAC7]'
                        : 'bg-[#F4ECE1] text-[#7A6440] border-[#DEC6A5]'
                    }`}
                  >
                    {isConfirmed ? 'Confirmed' : 'Needs Review'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#A9927A]" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
