import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import type { ContractDocument } from '../../types';
import { formatDate } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { EmptyState, Skeleton } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
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
      const newDoc = await api.uploadContract(user.id, file);
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
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Contract Intelligence</h1>
          <p className="text-xs text-stone-500 mt-1">
            Upload PDF agreements for instant plain-language summaries and clause flagging.
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
            <UploadCloud className="w-4 h-4" />
            <span>Upload Contract PDF</span>
          </Button>
        </div>
      </div>

      {/* AI Intelligence Explainer Banner */}
      <div className="p-4 rounded-xl bg-creator-50 border border-creator-100 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-creator-900 shrink-0 mt-0.5" />
        <div className="text-xs text-stone-700 leading-relaxed">
          <strong>How it works:</strong> We extract terms from your PDF, flag restrictive clauses (long exclusivity, broad ad usage rights), and format payment milestones so you can link them directly to collaboration deals.
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
        <div className="bg-white border border-stone-200 rounded-xl shadow-xs divide-y divide-stone-100 overflow-hidden">
          {contracts.map((doc) => {
            const isConfirmed = doc.review_status === 'confirmed';

            return (
              <div
                key={doc.id}
                onClick={() => navigate(`/creator/contracts/${doc.id}`)}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-surface-50 cursor-pointer transition-colors gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-surface-100 border border-stone-200/80 flex items-center justify-center text-creator-900 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-stone-900 truncate">
                      {doc.original_filename || 'Collaboration Agreement.pdf'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500 font-mono-numbers">
                      <span>Uploaded {formatDate(doc.uploaded_at)}</span>
                      {doc.ai_flags && doc.ai_flags.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                          <ShieldAlert className="w-2.5 h-2.5" />
                          {doc.ai_flags.length} Flagged Clauses
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      isConfirmed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {isConfirmed ? 'Confirmed' : 'Needs Review'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
