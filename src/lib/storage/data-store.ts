import { seedData, getSeedData } from '@/lib/storage/seed-data';
import type { Contact, Job, WorkOrder, Note, Photo, CreateWorkOrderInput, CallOutcomeInput, AdvanceStatusInput, BlockWorkOrderInput, ResumeWorkOrderInput, ApiEnvelope } from '@/lib/types';
import { createEnvelope, createErrorEnvelope, validateInput } from '@/lib/validation';
import { createWorkOrderSchema } from '@/features/jobs/schema/job.schema';
import { callOutcomeSchema as contactCallOutcomeSchema } from '@/features/contacts/schema/contact.schema';
import { advanceStatusSchema, blockWorkOrderSchema, resumeWorkOrderSchema, isLegalTransition } from '@/features/work-orders/schema/work-order.schema';

let contacts = [...seedData.contacts];
let jobs = [...seedData.jobs];
let workOrders = [...seedData.workOrders];

function resetToSeed() {
  const data = getSeedData();
  contacts = [...data.contacts];
  jobs = [...data.jobs];
  workOrders = [...data.workOrders];
}

export const dataStore = {
  // Contacts
  getContacts: (): Contact[] => [...contacts].sort((a, b) => a.name.localeCompare(b.name)),
  getContact: (id: string): Contact | undefined => contacts.find(c => c.id === id),
  
  // Jobs
  getJobs: (): Job[] => [...jobs],
  getJob: (id: string): Job | undefined => jobs.find(j => j.id === id),
  getJobsByContact: (contactId: string): Job[] => jobs.filter(j => j.contactId === contactId),
  getJobsByStatus: (status: Job['status']): Job[] => jobs.filter(j => j.status === status),
  
  // Work Orders
  getWorkOrders: (): WorkOrder[] => [...workOrders],
  getWorkOrder: (id: string): WorkOrder | undefined => workOrders.find(wo => wo.id === id),
  getWorkOrdersByJob: (jobId: string): WorkOrder[] => workOrders.filter(wo => wo.jobId === jobId),
  getWorkOrdersByAssignee: (assignee: string): WorkOrder[] => workOrders.filter(wo => wo.assignee === assignee),
  getWorkOrdersByAssigneeAndStatus: (assignee: string, excludeStatus?: WorkOrder['status']): WorkOrder[] => 
    workOrders.filter(wo => wo.assignee === assignee && wo.status !== excludeStatus),
  
  // Mutations
  createWorkOrder: (input: CreateWorkOrderInput): ApiEnvelope<WorkOrder> => {
    const validation = validateInput(createWorkOrderSchema, input);
    if (!validation.success) {
      return createErrorEnvelope<WorkOrder>('Validation failed');
    }
    
    const newWO: WorkOrder = {
      id: `wo-${Date.now()}`,
      jobId: 'job-1', // Default, would come from context in real app
      title: validation.data.title,
      assignee: validation.data.assignee,
      scheduledDate: validation.data.scheduledDate,
      status: 'scheduled',
      notes: [],
      photos: [],
    };
    
    workOrders.push(newWO);
    return createEnvelope(newWO, 'Work order created successfully');
  },
  
  createWorkOrderWithJob: (jobId: string, input: CreateWorkOrderInput): WorkOrder => {
    const newWO: WorkOrder = {
      id: `wo-${Date.now()}`,
      jobId,
      title: input.title,
      assignee: input.assignee,
      scheduledDate: input.scheduledDate,
      status: 'scheduled',
      notes: [],
      photos: [],
    };
    
    workOrders.push(newWO);
    return newWO;
  },
  
  addCallOutcomeNote: (input: CallOutcomeInput): ApiEnvelope<Note> => {
    const validation = validateInput(contactCallOutcomeSchema, input);
    if (!validation.success) {
      return createErrorEnvelope<Note>('Validation failed');
    }
    
    const contact = contacts.find(c => c.id === validation.data.contactId);
    if (!contact) {
      return createErrorEnvelope<Note>('Contact not found');
    }
    
    const newNote: Note = {
      id: `note-${Date.now()}`,
      text: validation.data.note,
      timestamp: new Date().toISOString(),
    };
    
    // In a real app, notes would be stored per contact
    // For now we return the note
    return createEnvelope(newNote, 'Call outcome saved');
  },
  
  advanceWorkOrderStatus: (input: AdvanceStatusInput): ApiEnvelope<WorkOrder> => {
    const validation = validateInput(advanceStatusSchema, input);
    if (!validation.success) {
      return createErrorEnvelope<WorkOrder>('Validation failed');
    }
    
    const woIndex = workOrders.findIndex(wo => wo.id === validation.data.workOrderId);
    if (woIndex === -1) {
      return createErrorEnvelope<WorkOrder>('Work order not found');
    }
    
    const wo = workOrders[woIndex];
    const currentStatus = wo.status;
    const transitions: Record<WorkOrder['status'], WorkOrder['status']> = {
      scheduled: 'en_route',
      en_route: 'on_site',
      on_site: 'done',
      blocked: 'blocked', // Can't advance from blocked
      done: 'done',
    };
    
    const nextStatus = transitions[currentStatus];
    if (!nextStatus || nextStatus === currentStatus) {
      return createErrorEnvelope<WorkOrder>('Cannot advance from current status');
    }
    
    wo.status = nextStatus;
    return createEnvelope({ ...wo }, `Status advanced to ${nextStatus.replace('_', ' ')}`);
  },
  
  blockWorkOrder: (input: BlockWorkOrderInput): ApiEnvelope<WorkOrder> => {
    const validation = validateInput(blockWorkOrderSchema, input);
    if (!validation.success) {
      return createErrorEnvelope<WorkOrder>('Validation failed');
    }
    
    const woIndex = workOrders.findIndex(wo => wo.id === validation.data.workOrderId);
    if (woIndex === -1) {
      return createErrorEnvelope<WorkOrder>('Work order not found');
    }
    
    const wo = workOrders[woIndex];
    if (wo.status !== 'en_route' && wo.status !== 'on_site') {
      return createErrorEnvelope<WorkOrder>('Can only block from en_route or on_site');
    }
    
    wo.blockedFromStatus = wo.status;
    wo.blockedReason = validation.data.reason;
    wo.status = 'blocked';
    
    return createEnvelope({ ...wo }, 'Work order blocked');
  },
  
  resumeWorkOrder: (input: ResumeWorkOrderInput): ApiEnvelope<WorkOrder> => {
    const validation = validateInput(resumeWorkOrderSchema, input);
    if (!validation.success) {
      return createErrorEnvelope<WorkOrder>('Validation failed');
    }
    
    const woIndex = workOrders.findIndex(wo => wo.id === validation.data.workOrderId);
    if (woIndex === -1) {
      return createErrorEnvelope<WorkOrder>('Work order not found');
    }
    
    const wo = workOrders[woIndex];
    if (wo.status !== 'blocked' || !wo.blockedFromStatus) {
      return createErrorEnvelope<WorkOrder>('Work order is not blocked');
    }
    
    const previousStatus = wo.blockedFromStatus;
    wo.status = previousStatus;
    wo.blockedFromStatus = undefined;
    wo.blockedReason = undefined;
    
    return createEnvelope({ ...wo }, `Resumed to ${previousStatus.replace('_', ' ')}`);
  },
  
  addPhoto: (workOrderId: string, uri: string): ApiEnvelope<Photo> => {
    const woIndex = workOrders.findIndex(wo => wo.id === workOrderId);
    if (woIndex === -1) {
      return createErrorEnvelope<Photo>('Work order not found');
    }
    
    const wo = workOrders[woIndex];
    if (wo.status !== 'on_site' && wo.status !== 'done') {
      return createErrorEnvelope<Photo>('Photos only allowed in on_site or done');
    }
    
    const newPhoto: Photo = {
      id: `photo-${Date.now()}`,
      uri,
      timestamp: new Date().toISOString(),
    };
    
    wo.photos.push(newPhoto);
    return createEnvelope(newPhoto, 'Photo added');
  },
  
  resetToSeed,
};