'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useContacts } from '@/features/contacts/hooks/use-contacts.hook';

export function ContactList() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: contacts, isLoading, error } = useContacts();
  
  const filteredContacts = contacts?.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];
  
  if (isLoading) {
    return (
      <div className="p-4 space-y-3" data-testid="contact-list">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded-lg" />
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center text-red-600 dark:text-red-400" data-testid="contact-list">
        Failed to load contacts
      </div>
    );
  }
  
  return (
    <div data-testid="contact-list">
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <label htmlFor="contact-search-input" className="sr-only">Search contacts</label>
        <input
          id="contact-search-input"
          data-testid="contact-search-input"
          type="search"
          placeholder="Search by name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredContacts.length === 0 ? (
          <div 
            className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
            data-testid="contact-list-empty-state"
          >
            {searchQuery ? 'No contacts found' : 'No contacts available'}
          </div>
        ) : (
          filteredContacts.map(contact => (
            <Link
              key={contact.id}
              href={`/contacts/${contact.id}`}
              className="block px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div data-testid={`contact-row-${contact.id}`} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{contact.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{contact.phone || 'No phone'}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}