import React from 'react';
import { Info } from 'lucide-react';

export const SelfReportedBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <span
      title="Creator self-reported metric. Not platform verified."
      className={`inline-flex items-center gap-1 text-[11px] font-medium text-stone-500 bg-stone-100/90 border border-stone-200 px-1.5 py-0.5 rounded tracking-wide ${className}`}
    >
      <Info className="w-2.5 h-2.5 text-stone-400" />
      Self-reported
    </span>
  );
};
