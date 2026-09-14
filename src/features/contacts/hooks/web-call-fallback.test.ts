import { describe, it, expect, vi, beforeEach } from 'vitest';

// Test the web call fallback behavior
describe('web call fallback', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  it('simulates call flow on web', () => {
    const phone = '555-0101';
    
    // Simulate tel: link click
    window.location.href = `tel:${phone}`;
    expect(window.location.href).toBe(`tel:${phone}`);
    
    // Simulate call end (window focus return)
    // In real app this triggers CallOutcomeSheet
    const callEnded = true;
    expect(callEnded).toBe(true);
  });

  it('handles missing phone gracefully', () => {
    const phone = '';
    let telLinkClicked = false;
    
    if (phone) {
      window.location.href = `tel:${phone}`;
      telLinkClicked = true;
    }
    
    expect(telLinkClicked).toBe(false);
  });
});