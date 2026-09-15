export type JobStatus = 'lead' | 'scheduled' | 'in_progress' | 'completed';
export type WorkOrderStatus = 'scheduled' | 'en_route' | 'on_site' | 'done' | 'blocked';

export interface Note {
  id: string;
  text: string;
  timestamp: string;
}

export interface Photo {
  id: string;
  uri: string;
  timestamp: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: Note[];
}

export interface Job {
  id: string;
  contactId: string;
  address: string;
  status: JobStatus;
  value: number;
  title: string;
}

export interface WorkOrder {
  id: string;
  jobId: string;
  title: string;
  assignee: string;
  scheduledDate: string;
  status: WorkOrderStatus;
  notes: Note[];
  photos: Photo[];
  blockedFromStatus?: WorkOrderStatus;
  blockedReason?: string;
}

export interface CreateWorkOrderInput {
  title: string;
  assignee: string;
  scheduledDate: string;
}

export interface CallOutcomeInput {
  contactId: string;
  note: string;
}

export interface AdvanceStatusInput {
  workOrderId: string;
}

export interface BlockWorkOrderInput {
  workOrderId: string;
  reason: string;
}

export interface ResumeWorkOrderInput {
  workOrderId: string;
}

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export type OutboxItemType = 'status_change' | 'call_outcome';

export interface OutboxItem {
  id: string;
  type: OutboxItemType;
  payload: Record<string, unknown>;
  description: string;
  state: 'pending' | 'syncing' | 'synced' | 'failed';
  error?: string;
  createdAt: string;
  retriedAt?: string;
}