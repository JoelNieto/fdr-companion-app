'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Sheet({ isOpen, onClose, title, children, className = '' }: SheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      contentRef.current?.focus();
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 md:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'sheet-title' : undefined}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className={`
          w-full max-h-[90vh] md:max-h-[80vh] overflow-y-auto
          bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-xl
          shadow-xl transform transition-transform
          animate-slide-up md:animate-fade-in
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {(title !== undefined) && (
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
            {title && (
              <h2 id="sheet-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h2>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}