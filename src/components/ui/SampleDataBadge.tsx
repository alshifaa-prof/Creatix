import React from 'react';
import { isMockMode } from '../../lib/api';
import { Database } from 'lucide-react';

export const SampleDataBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  if (!isMockMode()) return null;

  return (
    <span
      title="Running in local mock mode with realistic sample records"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200/80 shadow-xs ${className}`}
    >
      <Database className="w-3 h-3 text-amber-700" />
      <span>Sample data</span>
    </span>
  );
};
