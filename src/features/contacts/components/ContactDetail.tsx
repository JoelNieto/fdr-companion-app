'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useContact } from '@/features/contacts/hooks/use-contacts.hook';
import { useJobsByContact } from '@/features/jobs/hooks/use-jobs.hook';
import { useCallOutcome } from '@/features/contacts/hooks/use-contacts.hook';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CallOutcomeSheet } from './CallOutcomeSheet';

interface ContactDetailProps {
  contactId: string;
}

export function ContactDetail({ contactId }: ContactDetailProps) {
  const { data: contact, isLoading, error } = useContact(contactId);
  const { data: jobs } = useJobsByContact(contactId);
  const [showCallOutcome, setShowCallOutcome] = useState(false);
  const callOutcome = useCallOutcome();
  
  const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    lead: 'default',
    scheduled: 'info',
    in_progress: 'warning',
    completed: 'success',
  };
  
  if (isLoading) {
    return (
      <div className="p-4 space-y-4 animate-pulse" data-testid="contact-detail">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    );
  }
  
  if (error || !contact) {
    return (
      <div className="p-4 text-center text-red-600 dark:text-red-400" data-testid="contact-detail">
        Contact not found
      </div>
    );
  }
  
  const handleCall = () => {
    if (contact.phone) {
      callOutcome.startCall(contact.phone, contact.id, '');
      setShowCallOutcome(true);
    }
  };
  
  return (
    <div data-testid="contact-detail" className="p-4 space-y-6">
      <div>
        <Link href="/contacts" className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Contacts
        </Link>
        <h1 id="contact-detail-name" data-testid="contact-detail-name" className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {contact.name}
        </h1>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{contact.phone || 'Not provided'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{contact.email || 'Not provided'}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <svg className="w-6 h-6 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{contact.address || 'Not provided'}</p>
          </div>
        </div>
      </div>
      
      {contact.phone && (
        <Button 
          onClick={handleCall}
          data-testid="contact-call-button"
          className="w-full"
          size="lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Call {contact.name}
        </Button>
      )}
      
      {jobs && jobs.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Jobs</h2>
          <ul id="contact-detail-jobs-list" data-testid="contact-detail-jobs-list" className="space-y-2">
            {jobs.map(job => (
              <li key={job.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{job.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{job.address}</p>
                  </div>
                  <Badge variant={statusColors[job.status] || 'default'}>
                    {job.status.replace('_', ' ')}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
      
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notes</h2>
        </div>
        <ul id="contact-notes-list" data-testid="contact-notes-list" className="space-y-2">
          {(contact.notes?.length ?? 0) === 0 ? (
            <li className="text-center text-gray-500 dark:text-gray-400 py-4">
              No notes yet. Call outcomes will appear here.
            </li>
          ) : (
            contact.notes.map((note) => (
              <li
                key={note.id}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                data-testid={`contact-note-${note.id}`}
              >
                <p className="text-gray-900 dark:text-gray-100">{note.text}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(note.timestamp).toLocaleString()}
                </p>
              </li>
            ))
          )}
        </ul>
      </section>
      
      <CallOutcomeSheet
        isOpen={showCallOutcome}
        onClose={() => setShowCallOutcome(false)}
        contactId={contact.id}
        contactName={contact.name}
        contactPhone={contact.phone || ''}
        onSave={() => setShowCallOutcome(false)}
      />
    </div>
  );
}