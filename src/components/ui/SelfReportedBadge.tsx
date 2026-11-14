import React from 'react';
import { Info } from 'lucide-react';

export const SelfReportedBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <span
      title="Creator self-reported metric. Not platform verified."
      className={`inline-flex items-center gap-1 text-[11px] font-medium text-[#7B726C] bg-[#F3EAE0] border border-[#D4C2AE]/70 px-2 py-0.5 rounded-full tracking-wide ${className}`}
    >
      <Info className="w-2.5 h-2.5 text-[#B49A70]" />
      Self-reported
    </span>
  );
};
