'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useJobsByStatus } from '@/features/jobs/hooks/use-jobs.hook';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';

export function JobList() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'lead' | 'scheduled' | 'in_progress' | 'completed'>('all');
  const { data: jobs, isLoading, error } = useJobsByStatus(statusFilter);
  
  const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    lead: 'default',
    scheduled: 'info',
    in_progress: 'warning',
    completed: 'success',
  };
  
  if (isLoading) {
    return (
      <div data-testid="job-list-view">
        <div className="p-4" data-testid="job-status-filter">
          <select className="w-full md:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All</option>
            <option value="lead">Lead</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div data-testid="job-list-view" className="p-4 text-center text-red-600 dark:text-red-400">
        Failed to load jobs
      </div>
    );
  }
  
  return (
    <div data-testid="job-list-view" className="space-y-4 p-4 pb-20 md:pb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Jobs</h1>
        <select
          id="job-status-filter"
          data-testid="job-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="lead">Lead</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      
      {jobs && jobs.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400" data-testid="job-list-empty-state">
          {statusFilter !== 'all' ? `No ${statusFilter.replace('_', ' ')} jobs found` : 'No jobs available'}
        </div>
      )}
      
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <Thead>
            <Tr>
              <Th>Title / Address</Th>
              <Th>Status</Th>
              <Th>Value</Th>
              <Th>Contact</Th>
            </Tr>
          </Thead>
          <Tbody>
            {jobs?.map(job => (
              <Tr key={job.id}>
                <Td data-testid={`job-item-${job.id}`}>
                  <Link href={`/jobs/${job.id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{job.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{job.address}</p>
                  </Link>
                </Td>
                <Td>
                  <Badge variant={statusColors[job.status] || 'default'}>
                    {job.status.replace('_', ' ')}
                  </Badge>
                </Td>
                <Td className="font-medium text-gray-900 dark:text-gray-100">
                  ${job.value.toLocaleString()}
                </Td>
                <Td className="text-gray-700 dark:text-gray-300">
                  {/* Contact name would be fetched from contact data */}
                  Contact
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
      
      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {jobs?.map(job => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div data-testid={`job-item-${job.id}`} className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{job.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{job.address}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={statusColors[job.status] || 'default'}>
                  {job.status.replace('_', ' ')}
                </Badge>
                <span className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  ${job.value.toLocaleString()}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}