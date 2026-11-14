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
          <label htmlFor={inputId} className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full px-3 py-2 text-sm bg-white border rounded-lg text-stone-900 placeholder:text-stone-400 transition-colors focus:outline-none focus:ring-1 ${
            error
              ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-600'
              : 'border-stone-300 focus:border-stone-800 focus:ring-stone-800'
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-rose-600">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-stone-500">{hint}</p>
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
          <label htmlFor={inputId} className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          className={`w-full px-3 py-2 text-sm bg-white border rounded-lg text-stone-900 placeholder:text-stone-400 transition-colors focus:outline-none focus:ring-1 ${
            error
              ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-600'
              : 'border-stone-300 focus:border-stone-800 focus:ring-stone-800'
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-rose-600">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-stone-500">{hint}</p>
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
          <label htmlFor={inputId} className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <select
          id={inputId}
          ref={ref}
          className={`w-full px-3 py-2 text-sm bg-white border rounded-lg text-stone-900 transition-colors focus:outline-none focus:ring-1 ${
            error
              ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-600'
              : 'border-stone-300 focus:border-stone-800 focus:ring-stone-800'
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
          <p className="mt-1 text-xs text-rose-600">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-stone-500">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
