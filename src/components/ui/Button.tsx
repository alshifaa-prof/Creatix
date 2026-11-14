import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[32px] tracking-wide',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2 min-h-[40px]',
    lg: 'text-sm sm:text-base px-6 py-2.5 gap-2.5 min-h-[46px]',
  };

  const variantStyles = {
    primary:
      'bg-[#171514] text-[#FAF7F2] border border-[#282422] hover:bg-[#282422] hover:border-[#B49A70]/60 active:bg-[#0F0E0D] shadow-luxury focus-visible:outline-[#B49A70]',
    secondary:
      'bg-[#F3EAE0] text-[#171514] border border-[#D4C2AE] hover:bg-[#EAE1D6] hover:border-[#B49A70] active:bg-[#D4C2AE] focus-visible:outline-[#171514]',
    outline:
      'border border-[#D4C2AE] bg-white text-[#171514] hover:bg-[#FAF7F2] hover:border-[#B49A70] active:bg-[#F3EAE0] focus-visible:outline-[#B49A70]',
    danger:
      'bg-[#A85F48] text-white border border-[#8F4E3A] hover:bg-[#8F4E3A] active:bg-[#723C2C] shadow-xs focus-visible:outline-[#A85F48]',
    ghost:
      'text-[#5A534F] hover:text-[#171514] hover:bg-[#F3EAE0]/70 active:bg-[#F3EAE0] focus-visible:outline-[#B49A70]',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
      {children}
    </button>
  );
};
