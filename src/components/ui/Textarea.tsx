'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const errorId = error ? `${textareaId}-error` : undefined;
    const helperId = helperText ? `${textareaId}-helper` : undefined;
    
    const baseClassName = `
      w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800
      text-gray-900 dark:text-gray-100 placeholder-gray-400
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
      disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-700
      resize-none
      ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
      ${className}
    `;
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={baseClassName}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';