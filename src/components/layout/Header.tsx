'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/contacts', label: 'Contacts' },
    { href: '/jobs', label: 'Jobs' },
    { href: '/work-orders', label: 'Work Orders' },
  ];
  
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 hidden md:flex">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Field Companion
          </Link>
          <nav className="flex items-center gap-6" role="navigation" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    text-sm font-medium transition-colors
                    ${isActive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}