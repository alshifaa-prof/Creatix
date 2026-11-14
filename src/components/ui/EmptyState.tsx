import React from 'react';
import { Button } from './Button';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-[#D4C2AE] rounded-2xl bg-[#FAF7F2]/80 ${className}`}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-[#F3EAE0] flex items-center justify-center text-[#B49A70] mb-3.5 border border-[#D4C2AE]/80 shadow-xs">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h4 className="text-base font-serif font-bold text-[#171514] mb-1">{title}</h4>
      <p className="text-xs text-[#7B726C] max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-[#EAE1D6]/70 rounded-lg ${className}`} />
  );
};
