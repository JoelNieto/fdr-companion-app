# FRD: Field Companion App

This document is the functional contract for the Field Companion technical assessment. It contains **five slices**. Read it together with the assessment document (`technical-assessment-capacitor-field-companion.md`), which owns the engineering constraints, the MUST/PLUS split, and the deliverables.

## How to read this FRD

- **Test Identifiers are contractual.** Every `data-testid` listed in a slice MUST be exposed by your implementation, exactly as written. Scenarios reference elements only through these identifiers.
- **Required Fixtures are named data states.** Every fixture MUST be reachable using your seed data (plus, where noted, a device state such as "offline" or "permission denied"). A scenario that says `Given fixture: X` must be reproducible by a reviewer in under a minute.
- **Scenarios are grouped** under: 1. Functional Flow · 2. Alternate Paths · 3. Business Rules · 4. UI Behavior & Accessibility · 5. Platform & Performance. A slice omits a category when it has nothing to say.
- **Deviations are allowed, silence is not.** If you deviate from any line of this document, record it in `docs/frd-deviations.md` with a one-paragraph justification. Undeclared deviations are treated as defects.

## Global conventions

- **Current user**: the app runs with a single hardcoded signed-in user, crew member **Casey Rivera** (`crew-1`). No auth flows.
- **Job status pipeline**: `lead → scheduled → in_progress → completed`.
- **Work order status flow**: `scheduled → en_route → on_site → done`. `blocked` is reachable from `en_route` and `on_site` only; resuming returns the work order to the status it was blocked from. These are the only legal transitions.
- **Mutations** return the `{ success, message?, data? }` envelope and surface user feedback on success and error, everywhere, with no exceptions.
- **Disabled controls** expose `aria-disabled="true"` (scenarios assert this attribute, not visual dimming).
- Timestamps display in the device's local timezone.

---

# Slice 1: contacts/contact-directory

```yaml
slice: contacts/contact-directory
version: 1.0.0
status: accepted
reviewers:
  product: RoofPilot Hiring Team
```

## Context

Crews call customers constantly: before driving, on arrival, when nobody opens the door. This slice covers the contact directory, contact detail, starting a phone call from the app, and logging the outcome of that call as a note on the contact. The call itself is delegated to the platform (native dialer via your call plugin; `tel:` on web); this slice owns everything around it.

## Acceptance Contract

- The contact list shows every seeded contact with name and phone, ordered alphabetically by name.
- Search filters the list as the user types: case-insensitive substring match against name **or** phone. Clearing the search restores the full list.
- Contact detail shows name, phone, email, address, the contact's jobs (title/address + status), and a notes list (newest first, each with text + timestamp).
- The call button is present on contact detail. On native platforms it starts a real phone call to the contact's phone number through the call plugin; on web it opens `tel:<phone>`.
- On native platforms, when the call ends, the app presents a call-outcome sheet: a note input and Save / Dismiss actions. Saving appends a note to the contact. Dismissing records nothing.
- Note text: 1-500 characters. Whitespace-only does not count as content.
- A contact with no phone number cannot be called: the call button is disabled with `aria-disabled="true"`.

## Out of Scope

- Creating, editing, or deleting contacts; the directory is read-only in this assessment; contacts come from seed data.
- A dedicated call-log timeline distinct from the notes list (PLUS in the assessment document).
- SMS, email composition, or any Twilio-style in-app calling; calls go through the platform dialer.
- Detecting who ended the call or the call's duration.

## Test Identifiers

| Element | data-testid |
| --- | --- |
| Contact list container | `contact-list` |
| Search input | `contact-search-input` |
| Contact row (parametrized) | `contact-row-{contactId}` |
| Empty search state | `contact-list-empty-state` |
| Contact detail container | `contact-detail` |
| Contact name on detail | `contact-detail-name` |
| Jobs list on detail | `contact-detail-jobs-list` |
| Notes list on detail | `contact-notes-list` |
| Note item (parametrized) | `contact-note-item-{noteId}` |
| Call button | `contact-call-button` |
| Call-outcome sheet | `call-outcome-sheet` |
| Outcome note input | `call-outcome-note-input` |
| Outcome save button | `call-outcome-save-button` |
| Outcome dismiss button | `call-outcome-dismiss-button` |

## Required Fixtures

- `contacts-seeded`: baseline seed data loaded, contact list open
- `contact-with-jobs`: a contact having ≥ 2 jobs and ≥ 1 existing note, detail open
- `contact-without-phone`: a seeded contact whose phone is empty, detail open
- `call-just-ended`: (native or simulated native) a call started from `contact-call-button` has just ended

## Scenarios

### 1. Functional Flow

Scenario: Contact list renders seeded contacts alphabetically

Given fixture: `contacts-seeded`
Then `contact-list` is present
And a `contact-row-{contactId}` is present for every seeded contact
And rows are ordered alphabetically by contact name

Scenario: Search narrows the list by name or phone

Given fixture: `contacts-seeded`
When the user types a substring of one contact's name in `contact-search-input`
Then only matching `contact-row-{contactId}` elements remain
When the user clears `contact-search-input`
Then every seeded contact's row is present again

Scenario: Open contact detail

Given fixture: `contacts-seeded`
When the user clicks a `contact-row-{contactId}`
Then `contact-detail` is present
And `contact-detail-name` text content equals that contact's name
And `contact-detail-jobs-list` lists each of the contact's jobs with its status

Scenario: Start a call from contact detail

Given fixture: `contact-with-jobs`
When the user clicks `contact-call-button`
Then the platform call layer is invoked with the contact's phone number
# native: call plugin starts the dialer call; web: navigation to tel:<phone>

Scenario: Call ends and the outcome sheet appears (native)

Given fixture: `call-just-ended`
Then `call-outcome-sheet` is present
And `call-outcome-note-input` is focused

Scenario: Saving an outcome appends a note to the contact

Given fixture: `call-just-ended`
When the user types "Left voicemail, retry after 3pm" in `call-outcome-note-input`
And clicks `call-outcome-save-button`
Then `call-outcome-sheet` is not present
And `contact-notes-list` shows the new note first with its timestamp
And success feedback is surfaced

### 2. Alternate Paths

Scenario: Dismissing the outcome sheet records nothing

Given fixture: `call-just-ended`
When the user clicks `call-outcome-dismiss-button`
Then `call-outcome-sheet` is not present
And no note is added to `contact-notes-list`

Scenario: Search with no matches shows an empty state

Given fixture: `contacts-seeded`
When the user types "zzzzzz" in `contact-search-input`
Then no `contact-row-{contactId}` is present
And `contact-list-empty-state` is present

### 3. Business Rules

Scenario: A contact without a phone number cannot be called

Given fixture: `contact-without-phone`
Then `contact-call-button` has `aria-disabled="true"`
And clicking `contact-call-button` invokes nothing

Scenario: Empty or whitespace-only outcome cannot be saved

Given fixture: `call-just-ended`
And `call-outcome-note-input` contains only spaces
Then `call-outcome-save-button` has `aria-disabled="true"`
And no note is created

---

# Slice 2: jobs/job-list

```yaml
slice: jobs/job-list
version: 1.0.0
status: accepted
reviewers:
  product: RoofPilot Hiring Team
```

## Context

The office sells jobs; the crew executes work orders on them. This slice covers browsing jobs, the job detail with its contact and work orders, and creating a work order from a job: the mutation that later feeds the push slice (a work order assigned to Casey triggers a notification, per slice 5).

## Acceptance Contract

- The job list shows every seeded job with title/address, status, value, and contact name.
- A status filter narrows the list to one job status; an "All" option restores it.
- On desktop (`≥ 768px`) the list renders as a table; below 768px it renders as cards. Both representations share the same data layer (one query, one cache).
- Job detail shows the job's fields, a contact card (name + phone, links to contact detail), and the job's work orders with their statuses.
- "New work order" opens a creation sheet with: title (required, 3-80 characters), assignee (required, select including Casey Rivera and at least 2 other seeded crew names), scheduled date (required, today or future).
- Creation goes through a server-boundary mutation with Zod validation and the result envelope; success closes the sheet, shows the new work order in the job's list, and surfaces success feedback. Validation failures surface per-field errors and the envelope message; nothing is persisted.
- While a creation is in flight the submit button is disabled; a double click never creates two work orders.

## Out of Scope

- Creating or editing jobs; job status changes (jobs come from seed data).
- A kanban/status-board view (PLUS in the assessment document).
- Editing or deleting work orders after creation.
- Pagination (seed volume renders in one page).

## Test Identifiers

| Element | data-testid |
| --- | --- |
| Job list view container | `job-list-view` |
| Desktop table | `job-table` |
| Mobile card list | `job-card-list` |
| Status filter | `job-status-filter` |
| Job item (parametrized, either world) | `job-item-{jobId}` |
| Empty filter state | `job-list-empty-state` |
| Job detail container | `job-detail` |
| Contact card on detail | `job-detail-contact-card` |
| Work orders list on detail | `job-detail-wo-list` |
| Work order item (parametrized) | `job-wo-item-{workOrderId}` |
| New work order button | `wo-create-button` |
| Creation sheet | `wo-create-sheet` |
| Title input | `wo-create-title-input` |
| Assignee select | `wo-create-assignee-select` |
| Scheduled date input | `wo-create-date-input` |
| Submit button | `wo-create-submit-button` |
| Cancel button | `wo-create-cancel-button` |
| Title field error | `wo-create-error-title` |
| Date field error | `wo-create-error-date` |
| Assignee field error | `wo-create-error-assignee` |

## Required Fixtures

- `jobs-mixed-statuses`: baseline seed, jobs across `lead`, `scheduled`, and `in_progress`; **no seeded job is `completed`**; list open
- `job-with-work-orders`: a job with ≥ 2 work orders, detail open
- `wo-create-sheet-open`: creation sheet open on `job-with-work-orders`, all fields empty
- `wo-create-in-flight`: creation submitted, server response pending

## Scenarios

### 1. Functional Flow

Scenario: Job list renders with status and contact

Given fixture: `jobs-mixed-statuses`
Then `job-list-view` is present
And a `job-item-{jobId}` is present for every seeded job
And each item shows the job's status and its contact's name

Scenario: Filter by status

Given fixture: `jobs-mixed-statuses`
When the user selects "in_progress" in `job-status-filter`
Then only `job-item-{jobId}` elements for in-progress jobs remain
When the user selects "All"
Then every seeded job's item is present again

Scenario: Open job detail

Given fixture: `jobs-mixed-statuses`
When the user clicks a `job-item-{jobId}`
Then `job-detail` is present
And `job-detail-contact-card` shows the job's contact name and phone
And `job-detail-wo-list` shows a `job-wo-item-{workOrderId}` per work order with its status

Scenario: Create a work order successfully

Given fixture: `wo-create-sheet-open`
When the user types "Tear-off rear section" in `wo-create-title-input`
And selects "Casey Rivera" in `wo-create-assignee-select`
And picks tomorrow's date in `wo-create-date-input`
And clicks `wo-create-submit-button`
Then `wo-create-sheet` is not present
And `job-detail-wo-list` contains a new `job-wo-item-{workOrderId}` titled "Tear-off rear section" with status "scheduled"
And success feedback is surfaced

### 2. Alternate Paths

Scenario: Cancel creation saves nothing

Given fixture: `wo-create-sheet-open`
And the user has typed a title
When the user clicks `wo-create-cancel-button`
Then `wo-create-sheet` is not present
And no new `job-wo-item-{workOrderId}` appears

Scenario: Filter with no matches shows an empty state

Given fixture: `jobs-mixed-statuses` # no seeded job is completed
When the user selects "completed" in `job-status-filter`
Then no `job-item-{jobId}` is present
And `job-list-empty-state` is present

### 3. Business Rules

Scenario: Validation failures surface per field and persist nothing

Given fixture: `wo-create-sheet-open`
When the user types "ab" in `wo-create-title-input` # below 3-char minimum
And picks yesterday's date in `wo-create-date-input`
And leaves `wo-create-assignee-select` empty
And clicks `wo-create-submit-button`
Then `wo-create-error-title` is present
And `wo-create-error-date` is present
And `wo-create-error-assignee` is present
And `wo-create-sheet` is still present
And no work order is created
# validation is enforced at the server boundary; the client mirror is a convenience

Scenario: A second click while in flight does not create a duplicate

Given fixture: `wo-create-in-flight`
When the user clicks `wo-create-submit-button` again
Then `wo-create-submit-button` has `aria-disabled="true"`
And exactly one work order results from the submission

### 4. UI Behavior & Accessibility

Scenario: Desktop renders the table, phone renders the cards

Given fixture: `jobs-mixed-statuses`
When the viewport is 1280px wide
Then `job-table` is present and `job-card-list` is not visible
When the viewport is 390px wide
Then `job-card-list` is present and `job-table` is not visible
And both worlds are fed by the same query cache # no duplicated data hooks

---

# Slice 3: work-orders/execute-work-order

```yaml
slice: work-orders/execute-work-order
version: 1.0.0
status: accepted
reviewers:
  product: RoofPilot Hiring Team
```

## Context

This is the crew member's home surface. Casey opens the app in the truck, sees today's work orders, advances them through the status flow as the day unfolds, and captures photo evidence on the roof. Status transitions are a state machine enforced at the server boundary; the UI offering only legal moves is a convenience, not the enforcement.

## Acceptance Contract

- "My work orders" lists work orders assigned to the current user, grouped **Today** / **Upcoming**, ordered by scheduled date within each group. Work orders in `done` are excluded from both groups.
- Work order detail shows: title, job (with address), contact (with a call affordance reusing slice 1's call flow), status, notes, and the photo grid.
- The advance button moves the work order one legal step forward (`scheduled → en_route → on_site → done`) and its text content equals the label of the **next** status. In `done`, no advance button renders.
- Blocking: from `en_route` or `on_site`, the block action requires a reason (5-200 characters). A blocked work order shows the reason and offers resume, which returns it to the status it was blocked from.
- All status changes are mutations with the envelope + feedback contract. Illegal transitions (e.g. a crafted `scheduled → done` request) are rejected at the server boundary with a failure envelope; the stored status does not change.
- Photo evidence can be captured only in `on_site` or `done`, via the Camera plugin. A captured photo appears as a thumbnail in the grid without a manual refresh.
- Camera permission denied is a first-class path: an explainer renders, the app does not crash, and the user remains on the detail.

## Out of Scope

- Choosing photos from the gallery, full-screen photo viewer, photo deletion (PLUS in the assessment document).
- Reassigning work orders; editing title/date after creation.
- Free-text notes on work orders (notes here arrive via slice 1's call-outcome flow and, offline, via slice 4).
- Route/map integration for `en_route`.

## Test Identifiers

| Element | data-testid |
| --- | --- |
| My work orders view | `my-wo-list` |
| Today group | `my-wo-today-group` |
| Upcoming group | `my-wo-upcoming-group` |
| Work order item (parametrized) | `wo-item-{workOrderId}` |
| Work order detail | `wo-detail` |
| Status badge on detail | `wo-detail-status-badge` |
| Advance status button | `wo-status-advance-button` |
| Block button | `wo-block-button` |
| Block reason input | `wo-block-reason-input` |
| Block confirm button | `wo-block-confirm-button` |
| Block reason display | `wo-block-reason-display` |
| Resume button | `wo-resume-button` |
| Add photo button | `wo-add-photo-button` |
| Photo grid | `wo-photo-grid` |
| Photo thumbnail (parametrized) | `wo-photo-thumb-{photoId}` |
| Camera permission explainer | `camera-permission-explainer` |

## Required Fixtures

- `my-wo-today-and-upcoming`: Casey has ≥ 2 work orders today and ≥ 2 upcoming, none done, list open
- `wo-scheduled`: a work order of Casey's in `scheduled`, detail open
- `wo-en-route`: same, in `en_route`
- `wo-on-site`: same, in `on_site`, its job's contact has a phone number
- `wo-blocked-from-on-site`: same, `blocked`, previously `on_site`, with a stored reason
- `camera-permission-denied`: `wo-on-site` with the OS camera permission denied

## Scenarios

### 1. Functional Flow

Scenario: My work orders grouped by today and upcoming

Given fixture: `my-wo-today-and-upcoming`
Then `my-wo-today-group` contains a `wo-item-{workOrderId}` for each of today's work orders
And `my-wo-upcoming-group` contains the rest ordered by scheduled date
And no listed work order has status "done"

Scenario: Advance through the full legal flow

Given fixture: `wo-scheduled`
Then `wo-status-advance-button` text content equals "En route"
When the user clicks `wo-status-advance-button`
Then `wo-detail-status-badge` text content equals "En route"
And `wo-status-advance-button` text content equals "On site"
When the user clicks `wo-status-advance-button` twice more
Then `wo-detail-status-badge` text content equals "Done"
And `wo-status-advance-button` is not present
And each transition surfaced success feedback

Scenario: Capture photo evidence on site

Given fixture: `wo-on-site`
When the user clicks `wo-add-photo-button`
And completes a capture through the Camera plugin
Then a new `wo-photo-thumb-{photoId}` is present in `wo-photo-grid` without a manual refresh
And success feedback is surfaced

### 2. Alternate Paths

Scenario: Block a work order with a reason

Given fixture: `wo-on-site`
When the user clicks `wo-block-button`
And types "No roof access, gate locked, owner unreachable" in `wo-block-reason-input`
And clicks `wo-block-confirm-button`
Then `wo-detail-status-badge` text content equals "Blocked"
And `wo-block-reason-display` shows the reason
And `wo-status-advance-button` is not present

Scenario: Resume returns to the status it was blocked from

Given fixture: `wo-blocked-from-on-site`
When the user clicks `wo-resume-button`
Then `wo-detail-status-badge` text content equals "On site"
And `wo-status-advance-button` text content equals "Done"

Scenario: Camera permission denied degrades gracefully

Given fixture: `camera-permission-denied`
When the user clicks `wo-add-photo-button`
Then `camera-permission-explainer` is present
And the app remains on `wo-detail` without crashing
And no photo is added to `wo-photo-grid`

### 3. Business Rules

Scenario: Illegal transition is rejected at the server boundary

Given fixture: `wo-scheduled`
When a status change request "scheduled → done" reaches the server boundary directly # crafted, bypassing the UI
Then the mutation returns a failure envelope
And the stored status remains "scheduled"
And re-opening `wo-detail` shows `wo-detail-status-badge` text content equals "Scheduled"

Scenario: Blocking requires a reason

Given fixture: `wo-en-route`
When the user clicks `wo-block-button`
And leaves `wo-block-reason-input` with fewer than 5 characters
Then `wo-block-confirm-button` has `aria-disabled="true"`
And the work order stays in "En route"

Scenario: Photo capture is unavailable outside on_site and done

Given fixture: `wo-scheduled`
Then `wo-add-photo-button` is not present
# equally absent in en_route and blocked

### 4. UI Behavior & Accessibility

Scenario: Advance button shows a pending state during the mutation

Given fixture: `wo-en-route`
When the user clicks `wo-status-advance-button` and the mutation is in flight
Then `wo-status-advance-button` has `aria-disabled="true"`
And a pending indicator is visible within the button
And already-rendered detail content does not unmount into a skeleton

---

# Slice 4: platform/offline-outbox

```yaml
slice: platform/offline-outbox
version: 1.0.0
status: accepted
reviewers:
  product: RoofPilot Hiring Team
```

## Context

Roofs have no Wi-Fi and job sites have dead zones. Offline is a working state, not an error state: the crew keeps browsing what they already loaded and keeps advancing work orders; the app queues their writes in an outbox and replays them when connectivity returns. This slice covers connectivity awareness, offline reads, and the outbox lifecycle for the two offline-capable mutations: **work order status changes** and **call-outcome notes**.

## Acceptance Contract

- The app detects connectivity changes (Network plugin on native, browser events on web) and shows a persistent, non-blocking offline indicator while offline.
- Previously loaded contacts, jobs, and work orders remain fully browsable offline from the query cache.
- While offline, a work order status change or a call-outcome note save applies optimistically to the UI and enqueues an outbox item. No network request is dispatched.
- The outbox indicator shows the pending count and opens the outbox panel; the panel lists items newest last with a human-readable description and a per-item state: `pending → syncing → synced | failed`.
- On reconnect, the outbox replays automatically, in FIFO order, one item at a time.
- A replay rejected by the server marks that item `failed` with the server's envelope message and a manual retry control; failed items do not block later items.
- The outbox is persisted: killing and relaunching the app with pending items preserves them, and replay works on the next reconnect.
- **Conflict policy: last write wins by server receipt order.** Replayed mutations are applied in arrival order without version checks; the transition-legality rule of slice 3 still applies to each replayed mutation individually.

## Out of Scope

- Offline photo-upload queueing (PLUS in the assessment document); photo capture requires connectivity in the MUST scope.
- Offline work-order creation (slice 2's create is online-only).
- Cross-device sync, server push of changes made elsewhere, or any merge/versioning scheme beyond last-write-wins.
- Background sync while the app is not running.

## Test Identifiers

| Element | data-testid |
| --- | --- |
| Offline indicator | `offline-indicator` |
| Outbox indicator (with count) | `outbox-indicator` |
| Outbox panel | `outbox-panel` |
| Outbox item (parametrized by queue position) | `outbox-item-{index}` |
| Outbox item state within an item | `outbox-item-state` |
| Retry control on a failed item | `outbox-retry-button-{index}` |

## Required Fixtures

- `device-offline`: baseline seed loaded and browsed while online, then connectivity disabled
- `outbox-two-pending`: `device-offline`, then two status changes performed on two different work orders
- `outbox-item-server-reject`: a queued item the server will reject on replay (e.g. its transition became illegal server-side)
- `app-restarted-with-pending-outbox`: app killed and relaunched while `outbox-two-pending` items were still pending, still offline

## Scenarios

### 1. Functional Flow

Scenario: Going offline surfaces the indicator without blocking the UI

Given fixture: `device-offline`
Then `offline-indicator` is present
And the current view remains interactive # no modal, no blocking overlay

Scenario: Previously loaded data is browsable offline

Given fixture: `device-offline`
When the user navigates between the contact list, a contact detail, the job list, and a work order detail already visited
Then each view renders its cached data
And no view replaces cached data with an error or empty state

Scenario: Offline status change is optimistic and queued

Given fixture: `device-offline`
And a work order of Casey's in "on_site" is open
When the user clicks `wo-status-advance-button`
Then `wo-detail-status-badge` text content equals "Done"
And `outbox-indicator` shows pending count 1
And no network request is dispatched

Scenario: Reconnect replays the outbox automatically

Given fixture: `outbox-two-pending`
When connectivity is restored
Then each item passes through "syncing" to "synced"
And `outbox-indicator` shows pending count 0
And the server state reflects both status changes

### 2. Alternate Paths

Scenario: Multiple queued items replay in FIFO order

Given fixture: `outbox-two-pending`
When connectivity is restored
Then the item queued first is dispatched first # observable via request order against the server boundary
And both mutations succeed

Scenario: A rejected replay marks the item failed and does not block the queue

Given fixture: `outbox-item-server-reject`
And a second valid item is queued behind it
When connectivity is restored
Then `outbox-item-{index}` for the rejected item shows `outbox-item-state` "failed" with the server's envelope message
And `outbox-retry-button-{index}` is present on the failed item
And the second item still reaches "synced"
And error feedback is surfaced for the failure

Scenario: The outbox survives an app restart

Given fixture: `app-restarted-with-pending-outbox`
Then `outbox-indicator` shows pending count 2
And `outbox-panel` lists both items as "pending"
When connectivity is restored
Then both items reach "synced"

### 3. Business Rules

Scenario: Last write wins on replay

Given fixture: `outbox-two-pending`
And the same work order was modified server-side while the device was offline
When connectivity is restored and the queued item for that work order replays
Then the replayed mutation is applied by server receipt order # last write wins, no version check
And re-fetching the work order shows the replayed value

Scenario: Offline call-outcome notes also queue

Given fixture: `device-offline`
And fixture: `call-just-ended` # per slice 1, native call flow
When the user saves an outcome note
Then the note appears in `contact-notes-list`
And `outbox-indicator` pending count increases by 1
And the note reaches the server after reconnect

### 4. UI Behavior & Accessibility

Scenario: The outbox panel narrates each item in human terms

Given fixture: `outbox-two-pending`
When the user opens `outbox-panel` via `outbox-indicator`
Then each `outbox-item-{index}` describes its mutation in plain language # e.g. "Mark 'Tear-off rear section' as Done"
And shows its `outbox-item-state`

---

# Slice 5: platform/assignment-push

```yaml
slice: platform/assignment-push
version: 1.0.0
status: accepted
reviewers:
  product: RoofPilot Hiring Team
```

## Context

When the office creates a work order and assigns it to Casey, Casey's phone must know; that is the whole point of a field companion. This slice covers the assignment notification and the deep link into the work order detail. The notification **transport** (FCM, simulator-injected APNs, polling-driven local notifications, …) is the candidate's decision, defended in an ADR per the assessment document; this slice specs the behavior that must hold whatever the transport.

## Acceptance Contract

- When a work order is created with assignee Casey Rivera (slice 2 flow) and the app is in the **background**, the device shows a system notification naming the work order.
- Tapping that notification opens the app directly on that work order's detail.
- When the app is in the **foreground**, no disruptive system flow is required: an in-app banner appears with the work order title; tapping it navigates to the detail; it auto-dismisses if ignored.
- A work order assigned to anyone other than the current user produces no notification on this device.
- A deep link referencing an unknown work order id lands on a friendly not-found screen with a way back to "My work orders"; never a crash, never a blank screen.
- If notification permission is denied, the rest of the app works untouched: a single non-nagging hint in the UI points to system settings; the app never re-prompts on every launch.
- Cold start: tapping the notification while the app is fully terminated also lands on the work order detail. # marked PLUS in the assessment document (see its §5)

## Out of Scope

- The push transport itself and its infrastructure (candidate's ADR decision).
- Notification history/inbox inside the app; badges and unread counts.
- Notifications for any event other than work-order assignment (status changes, notes, blocks are silent).
- Quiet hours, per-user notification preferences.

## Test Identifiers

| Element | data-testid |
| --- | --- |
| In-app assignment banner (foreground) | `push-inapp-banner` |
| Not-found screen for unknown work order | `wo-not-found-screen` |
| Back to my work orders from not-found | `wo-not-found-back-button` |
| Notification permission hint | `notif-permission-hint` |

The system notification itself is not DOM; background scenarios are verified on the emulator (and in the demo video), not by DOM assertion.

## Required Fixtures

- `push-ready`: notification permission granted, app running, Casey signed in
- `push-permission-denied`: OS notification permission denied for the app
- `app-backgrounded`: `push-ready` with the app in the background
- `unknown-wo-deep-link`: a deep link to a work order id that does not exist

## Scenarios

### 1. Functional Flow

Scenario: Background assignment shows a system notification

Given fixture: `app-backgrounded`
When a work order titled "Ridge cap repair" is created with assignee Casey Rivera
Then the device shows a notification that includes "Ridge cap repair"

Scenario: Tapping the notification deep-links to the work order detail

Given fixture: `app-backgrounded`
And an assignment notification is visible
When the user taps the notification
Then the app comes to the foreground on `wo-detail` for that work order
And `wo-detail-status-badge` text content equals "Scheduled"

Scenario: Foreground assignment shows the in-app banner

Given fixture: `push-ready`
And the app is in the foreground on the job list
When a work order titled "Skylight flashing" is created with assignee Casey Rivera
Then `push-inapp-banner` is present and includes "Skylight flashing"
When the user taps `push-inapp-banner`
Then `wo-detail` for that work order is present

### 2. Alternate Paths

Scenario: A deep link to an unknown work order fails softly

Given fixture: `unknown-wo-deep-link`
When the deep link is opened
Then `wo-not-found-screen` is present
And clicking `wo-not-found-back-button` shows `my-wo-list`

Scenario: Permission denied leaves the app fully functional

Given fixture: `push-permission-denied`
When the user uses contacts, jobs, and work orders normally
Then no OS permission prompt re-appears
And `notif-permission-hint` is present in at most one place
And no feature outside notifications is degraded

### 3. Business Rules

Scenario: Assignments to other crew members stay silent on this device

Given fixture: `push-ready`
When a work order is created with an assignee other than Casey Rivera
Then no notification is shown on this device
And no `push-inapp-banner` appears

### 5. Platform & Performance

Scenario: Cold-start deep link # PLUS (see assessment document §5)

Given fixture: `push-ready`
And the app is fully terminated
And an assignment notification is visible
When the user taps the notification
Then the app launches directly into `wo-detail` for that work order
