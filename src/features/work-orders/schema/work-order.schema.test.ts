import { describe, it, expect } from 'vitest';
import { 
  advanceStatusSchema, 
  blockWorkOrderSchema, 
  resumeWorkOrderSchema,
  isLegalTransition 
} from '@/features/work-orders/schema/work-order.schema';

describe('Work Order Status Transitions', () => {
  describe('isLegalTransition', () => {
    it('allows scheduled -> en_route', () => {
      expect(isLegalTransition('scheduled', 'en_route')).toBe(true);
    });

    it('allows en_route -> on_site', () => {
      expect(isLegalTransition('en_route', 'on_site')).toBe(true);
    });

    it('allows en_route -> blocked', () => {
      expect(isLegalTransition('en_route', 'blocked')).toBe(true);
    });

    it('allows on_site -> done', () => {
      expect(isLegalTransition('on_site', 'done')).toBe(true);
    });

    it('allows on_site -> blocked', () => {
      expect(isLegalTransition('on_site', 'blocked')).toBe(true);
    });

    it('blocks scheduled -> done (skipping steps)', () => {
      expect(isLegalTransition('scheduled', 'done')).toBe(false);
    });

    it('blocks en_route -> done (skipping on_site)', () => {
      expect(isLegalTransition('en_route', 'done')).toBe(false);
    });

    it('blocks scheduled -> on_site (skipping en_route)', () => {
      expect(isLegalTransition('scheduled', 'on_site')).toBe(false);
    });

    it('blocks any transition from blocked', () => {
      expect(isLegalTransition('blocked', 'en_route')).toBe(false);
      expect(isLegalTransition('blocked', 'on_site')).toBe(false);
      expect(isLegalTransition('blocked', 'done')).toBe(false);
    });

    it('blocks transitions from done', () => {
      expect(isLegalTransition('done', 'scheduled')).toBe(false);
      expect(isLegalTransition('done', 'en_route')).toBe(false);
    });

    it('blocks invalid from status', () => {
      expect(isLegalTransition('invalid' as any, 'en_route')).toBe(false);
    });
  });

  describe('advanceStatusSchema', () => {
    it('validates workOrderId', () => {
      const result = advanceStatusSchema.safeParse({ workOrderId: 'wo-1' });
      expect(result.success).toBe(true);
    });

    it('rejects empty workOrderId', () => {
      const result = advanceStatusSchema.safeParse({ workOrderId: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('blockWorkOrderSchema', () => {
    it('validates workOrderId and reason', () => {
      const result = blockWorkOrderSchema.safeParse({ workOrderId: 'wo-1', reason: 'Customer not home' });
      expect(result.success).toBe(true);
    });

    it('rejects empty workOrderId', () => {
      const result = blockWorkOrderSchema.safeParse({ workOrderId: '', reason: 'Test' });
      expect(result.success).toBe(false);
    });

    it('rejects too short reason', () => {
      const result = blockWorkOrderSchema.safeParse({ workOrderId: 'wo-1', reason: 'Test' });
      expect(result.success).toBe(false);
    });

    it('accepts valid reason (5+ chars)', () => {
      const result = blockWorkOrderSchema.safeParse({ workOrderId: 'wo-1', reason: 'Valid reason' });
      expect(result.success).toBe(true);
    });
  });

  describe('resumeWorkOrderSchema', () => {
    it('validates workOrderId', () => {
      const result = resumeWorkOrderSchema.safeParse({ workOrderId: 'wo-1' });
      expect(result.success).toBe(true);
    });

    it('rejects empty workOrderId', () => {
      const result = resumeWorkOrderSchema.safeParse({ workOrderId: '' });
      expect(result.success).toBe(false);
    });
  });
});