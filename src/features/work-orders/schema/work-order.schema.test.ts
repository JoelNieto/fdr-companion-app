import { describe, it, expect } from 'vitest';
import { isLegalTransition, legalTransitions } from '@/features/work-orders/schema/work-order.schema';

describe('work-order status transitions', () => {
  it('defines legal transitions correctly', () => {
    expect(legalTransitions.scheduled).toEqual(['en_route']);
    expect(legalTransitions.en_route).toEqual(['on_site', 'blocked']);
    expect(legalTransitions.on_site).toEqual(['done', 'blocked']);
    expect(legalTransitions.blocked).toEqual([]);
    expect(legalTransitions.done).toEqual([]);
  });

  it('allows valid transitions', () => {
    expect(isLegalTransition('scheduled', 'en_route')).toBe(true);
    expect(isLegalTransition('en_route', 'on_site')).toBe(true);
    expect(isLegalTransition('en_route', 'blocked')).toBe(true);
    expect(isLegalTransition('on_site', 'done')).toBe(true);
    expect(isLegalTransition('on_site', 'blocked')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(isLegalTransition('scheduled', 'on_site')).toBe(false);
    expect(isLegalTransition('scheduled', 'done')).toBe(false);
    expect(isLegalTransition('scheduled', 'blocked')).toBe(false);
    expect(isLegalTransition('done', 'scheduled')).toBe(false);
    expect(isLegalTransition('done', 'en_route')).toBe(false);
    expect(isLegalTransition('blocked', 'en_route')).toBe(false);
    expect(isLegalTransition('en_route', 'scheduled')).toBe(false);
    expect(isLegalTransition('on_site', 'en_route')).toBe(false);
  });

  it('rejects self-transitions', () => {
    expect(isLegalTransition('scheduled', 'scheduled')).toBe(false);
    expect(isLegalTransition('en_route', 'en_route')).toBe(false);
    expect(isLegalTransition('on_site', 'on_site')).toBe(false);
    expect(isLegalTransition('blocked', 'blocked')).toBe(false);
    expect(isLegalTransition('done', 'done')).toBe(false);
  });
});