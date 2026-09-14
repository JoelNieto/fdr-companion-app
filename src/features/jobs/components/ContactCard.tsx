'use client';

import { useContact } from '@/features/contacts/hooks/use-contacts.hook';
import Link from 'next/link';

interface ContactCardProps {
  contactId: string;
}

export function ContactCard({ contactId }: ContactCardProps) {
  const { data: contact, isLoading } = useContact(contactId);
  
  if (isLoading || !contact) {
    return (
      <div data-testid="job-detail-contact-card" className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      </div>
    );
  }
  
  return (
    <div data-testid="job-detail-contact-card" className="space-y-2">
      <Link href={`/contacts/${contact.id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
        <p className="font-medium text-gray-900 dark:text-gray-100">{contact.name}</p>
      </Link>
      <p className="text-sm text-gray-500 dark:text-gray-400">{contact.phone || 'No phone'}</p>
    </div>
  );
}