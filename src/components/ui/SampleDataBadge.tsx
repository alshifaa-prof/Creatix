import React from 'react';
import { isMockMode } from '../../lib/api';
import { Database } from 'lucide-react';

export const SampleDataBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  if (!isMockMode()) return null;

  return (
    <span
      title="Running in local mock mode with realistic sample records"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F3EAE0] text-[#7A6440] border border-[#D4C2AE] shadow-xs tracking-wide ${className}`}
    >
      <Database className="w-3 h-3 text-[#B49A70]" />
      <span>Sample data</span>
    </span>
  );
};
