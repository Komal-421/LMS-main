import { forwardRef, memo, useId } from 'react';

const Select = memo(
  forwardRef(function Select(
    {
      label,
      error,
      helperText,
      options = [],
      placeholder = 'Select an option',
      id,
      required = false,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-slate-700"
          >
            {label}
            {required && <span className="ml-0.5 text-rose-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={`block w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-300 bg-white focus:border-indigo-500 focus:ring-indigo-500/20'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const value = typeof opt === 'string' ? opt : opt.value;
            const optLabel = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={value} value={value}>
                {optLabel}
              </option>
            );
          })}
        </select>
        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  })
);

export default Select;
