'use client';

import { TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes, forwardRef } from 'react';

type TableProps = TableHTMLAttributes<HTMLTableElement>;

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className = '', children, ...props }, ref) => (
    <div className="overflow-x-auto">
      <table
        ref={ref}
        className={`w-full text-sm text-left ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  )
);

Table.displayName = 'Table';

type TheadProps = React.HTMLAttributes<HTMLTableSectionElement>;

export const Thead = forwardRef<HTMLTableSectionElement, TheadProps>(
  ({ className = '', children, ...props }, ref) => (
    <thead ref={ref} className={`bg-gray-50 dark:bg-gray-800 ${className}`} {...props}>
      {children}
    </thead>
  )
);

Thead.displayName = 'Thead';

type TbodyProps = React.HTMLAttributes<HTMLTableSectionElement>;

export const Tbody = forwardRef<HTMLTableSectionElement, TbodyProps>(
  ({ className = '', children, ...props }, ref) => (
    <tbody ref={ref} className={`divide-y divide-gray-200 dark:divide-gray-700 ${className}`} {...props}>
      {children}
    </tbody>
  )
);

Tbody.displayName = 'Tbody';

type TrProps = React.HTMLAttributes<HTMLTableRowElement>;

export const Tr = forwardRef<HTMLTableRowElement, TrProps>(
  ({ className = '', ...props }, ref) => (
    <tr ref={ref} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${className}`} {...props} />
  )
);

Tr.displayName = 'Tr';

type ThProps = ThHTMLAttributes<HTMLTableCellElement>;

export const Th = forwardRef<HTMLTableCellElement, ThProps>(
  ({ className = '', ...props }, ref) => (
    <th
      ref={ref}
      className={`px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 ${className}`}
      {...props}
    />
  )
);

Th.displayName = 'Th';

type TdProps = TdHTMLAttributes<HTMLTableCellElement>;

export const Td = forwardRef<HTMLTableCellElement, TdProps>(
  ({ className = '', ...props }, ref) => (
    <td
      ref={ref}
      className={`px-4 py-3 text-gray-700 dark:text-gray-300 ${className}`}
      {...props}
    />
  )
);

Td.displayName = 'Td';