import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-[11px] font-semibold text-[#5A534F] uppercase tracking-[0.08em] mb-1.5">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-[#171514] placeholder:text-[#A9927A]/70 transition-all duration-150 focus:outline-none focus:ring-1 ${
            error
              ? 'border-[#A85F48] focus:border-[#A85F48] focus:ring-[#A85F48]/30'
              : 'border-[#D4C2AE] focus:border-[#B49A70] focus:ring-[#B49A70]/40'
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-[#A85F48]">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-[#7B726C]">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', id, rows = 3, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-[11px] font-semibold text-[#5A534F] uppercase tracking-[0.08em] mb-1.5">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-[#171514] placeholder:text-[#A9927A]/70 transition-all duration-150 focus:outline-none focus:ring-1 ${
            error
              ? 'border-[#A85F48] focus:border-[#A85F48] focus:ring-[#A85F48]/30'
              : 'border-[#D4C2AE] focus:border-[#B49A70] focus:ring-[#B49A70]/40'
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-[#A85F48]">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-[#7B726C]">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: Array<{ label: string; value: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-[11px] font-semibold text-[#5A534F] uppercase tracking-[0.08em] mb-1.5">
            {label}
          </label>
        )}
        <select
          id={inputId}
          ref={ref}
          className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-[#171514] transition-all duration-150 focus:outline-none focus:ring-1 ${
            error
              ? 'border-[#A85F48] focus:border-[#A85F48] focus:ring-[#A85F48]/30'
              : 'border-[#D4C2AE] focus:border-[#B49A70] focus:ring-[#B49A70]/40'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <p className="mt-1 text-xs text-[#A85F48]">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-[#7B726C]">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
