'use client';

import { HTMLAttributes, forwardRef } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`
        bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
        shadow-sm ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
);

Card.displayName = 'Card';

type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

type CardContentProps = HTMLAttributes<HTMLDivElement>;

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', children, ...props }, ref) => (
    <div ref={ref} className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

type CardFooterProps = HTMLAttributes<HTMLDivElement>;

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';