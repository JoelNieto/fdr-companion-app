#!/usr/bin/env node
/**
 * Resets demo seed data for Field Companion.
 *
 * Persistence is browser localStorage (`field-companion-data`), so this script
 * prints the one-liner reviewers use. In the running app you can also call
 * `resetDemoData()` from `@/lib/client-actions`.
 */

console.log(`
Field Companion — reset demo seed
=================================

1. Open the app (web or Capacitor WebView).
2. In DevTools console run:

   localStorage.removeItem('field-companion-data');
   location.reload();

That restores contacts/jobs/work orders from src/lib/storage/seed-data.ts.
`);
