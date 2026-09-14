# RoofPilot Senior Technical Assessment

## Field Companion App: Next.js + Capacitor

| | |
| --- | --- |
| **Role** | Senior Fullstack Developer (mobile-capable) |
| **Effort budget** | **12 focused hours** (self-managed, honor system + time log) |
| **Delivery window** | 3 calendar days from receiving this document (the invitation email may adjust this) |
| **Language** | English: all code, comments, docs, commits |
| **You receive** | This document and the FRD (`frd-field-companion.md`). Nothing else. |
| **You need** | Your own machine with Xcode + Android Studio, your own free-tier accounts for anything you choose to use, and your AI tooling of choice. |

---

## 1. Ground rules (read first)

1. **This is a from-scratch build.** You get no repo, no designs, no backend, no API keys, and no accounts from us. The FRD defines *what* the app does; this document defines *how* it must be built and what you deliver. If a capability needs an external service, use a free tier under your own account, or simulate it and document the trade-off. The app does not integrate with any real RoofPilot system.
2. **AI-assisted development is expected, not tolerated.** We are an AI-native team. We want to see how you *drive* AI tools: your prompts are a first-class deliverable (see §6.5) and we will read them with the same attention we read your code.
3. **The timebox is part of the test.** 12 hours is not enough to do everything well. Deliberate scope management (cutting the right things, and saying so in writing) scores higher than a little bit of everything half-working. Requirements are tagged **MUST** or **PLUS**. Ship every MUST; treat PLUS items as ammunition, not obligations.
4. **Honesty is a hard requirement.** Claiming something works that doesn't is the single fastest way to fail this assessment. A documented limitation is a senior signal; a hidden one is a red flag.
5. **Everything in English.** Code comments, commit messages, docs. No exceptions.
6. **Allowed vs. not allowed.** Component libraries (shadcn/ui, Radix), CLIs, codegen, and AI tools: allowed and encouraged. Starting from an existing app boilerplate, a previous project of yours, or anyone else's Capacitor starter: not allowed. The repo starts empty, and your git history will show it.

---

## 2. The product

Roofing contractors run field crews. The office sells the job; the crew executes it on a roof, on a phone, often with bad or no connectivity. You are building the **Field Companion**: one Next.js codebase that serves office users on desktop web and crew members on iOS/Android through a Capacitor shell.

### 2.1 Domain model (minimum)

Three entities. Keep them lean; this is a field tool, not an ERP.

| Entity | Fields (minimum) | Notes |
| --- | --- | --- |
| **Contact** | id, name, phone, email, address | The customer. Phone is central: crews call customers. |
| **Job** | id, contactId, address, status, value | A sold roofing project at an address. Status pipeline: `lead → scheduled → in_progress → completed`. |
| **Work Order** | id, jobId, title, assignee, scheduledDate, status, notes[], photos[] | A unit of field work on a job. Status flow: `scheduled → en_route → on_site → done`, with `blocked` reachable from `en_route` and `on_site`. |

Seed the system with realistic demo data (≥ 15 contacts, ≥ 10 jobs, ≥ 12 work orders in mixed states). The seed MUST satisfy **every Required Fixture declared in the FRD**; fixtures are how reviewers reproduce scenarios, and an unreachable fixture counts as a failed scenario.

### 2.2 Actors

- **Office user**: desktop web (≥ 768px). Browses contacts and jobs, creates work orders, assigns crew.
- **Crew member**: phone (< 768px and the native apps). Works their assigned work orders, calls customers, captures photo evidence, works offline. The app runs as a single hardcoded signed-in crew member (Casey Rivera); no auth flows.

One codebase, one data layer, responsive presentation split. No user-agent sniffing, no separate mobile app tree.

---

## 3. Part A: The FRD is your spec

`frd-field-companion.md` contains five slices:

| # | Slice | Core capability |
| --- | --- | --- |
| 1 | `contacts/contact-directory` | Directory, contact detail, tap-to-call, call-outcome notes |
| 2 | `jobs/job-list` | Job browsing, job detail, work-order creation |
| 3 | `work-orders/execute-work-order` | Crew home view, status state machine, camera evidence |
| 4 | `platform/offline-outbox` | Offline reads, outbox writes, replay, conflict policy |
| 5 | `platform/assignment-push` | Assignment notification, deep link, permission paths |

How to work against it:

- **Scenarios are the acceptance contract.** Each one is written so it can be verified without asking anyone anything. Reviewers will sample them live on your build.
- **Test Identifiers are contractual.** Every `data-testid` in the FRD tables must exist in your implementation, exactly as written.
- **Required Fixtures bind to your seed data.** A reviewer must reach any fixture in under a minute using your README.
- **Read the FRD before you architect.** The slice boundaries are also a strong hint for your folder structure (§6.2).
- **If the timebox bites, cut whole scenarios; never ship them broken.** Every cut or deviation goes in `docs/frd-deviations.md` with a one-paragraph justification (what, why, what you'd do with more time). An FRD scenario that fails silently is a defect; the same scenario declared as cut is a scope decision. This file is read as carefully as your code.
- **Where the FRD is silent, decide and record.** Small ambiguities are intentional; resolve them with judgment and a line in the deviations file, not with questions to us.

---

## 4. Required stack

| Layer | Requirement |
| --- | --- |
| Framework | **Next.js 16** (App Router) + React 19, **TypeScript strict mode** |
| Data layer | **TanStack Query v5**: SSR/hydration on web where it earns its place, queries + mutations everywhere |
| Mobile shell | **Capacitor 8** (iOS + Android projects committed in the repo) |
| Validation | **Zod** at every trust boundary (server action / route handler inputs) |
| Styling | Tailwind CSS, mobile-first |
| Unit tests | **Vitest** + React Testing Library |
| Package manager | pnpm |
| Backend | Next.js route handlers + server actions with an in-memory or file/SQLite store is fully acceptable. A separate **.NET 9+ API** implementing the same contract is a **PLUS**; only attempt it if your MUSTs are already safe. |

Auth is **not required** (single hardcoded crew member, per the FRD's global conventions). Secure token storage via a Capacitor secure-storage plugin behind a store abstraction is a **PLUS**.

---

## 5. Part B: Implementation requirements

The FRD owns behavior. This section owns the engineering underneath it, slice by slice.

### 5.1 Slice 1: contacts + telephony

- **MUST**: Implement the slice as specified. On native, tap-to-call and the call-ended detection run through your **custom plugin** (§5.6); on web, `tel:` plus the documented fallback.
- **PLUS** (outside the FRD): A call-log timeline on contact detail, distinct from notes.

### 5.2 Slice 2: jobs

- **MUST**: Implement the slice as specified. Work-order creation is the canonical mutation of the codebase: Zod at the boundary, result envelope, per-field errors, double-submit guard, feedback on both outcomes; reviewers open this one first.
- **PLUS** (outside the FRD): Desktop-only kanban board of jobs by status.

### 5.3 Slice 3: work orders + camera

- **MUST**: Implement the slice as specified. The status state machine is enforced **server-side**; the FRD contains a crafted-request scenario that will be exercised. Photo capture uses the official **Camera plugin**, including the permission-denied path.
- **PLUS** (outside the FRD): Gallery as an alternative photo source; full-screen photo viewer.

### 5.4 Slice 4: offline outbox

- **MUST**: Implement the slice as specified. Connectivity via the Network plugin + browser events, cached reads (TanStack Query persistence or an equivalent you justify in the ADR), a persisted FIFO outbox for status changes and call-outcome notes, automatic replay, per-item failure + retry. The FRD fixes the conflict policy (last write wins); your ADR (§6.7) explains how you implemented it.
- **PLUS** (outside the FRD): Queued offline photo uploads.

### 5.5 Slice 5: assignment push

- **MUST**: Implement the slice as specified on **at least one platform** (emulator/simulator is fine). The notification **transport is your decision**, defended in an ADR: real FCM with your own free Firebase project, simulator-injected APNs payloads (`xcrun simctl push`), or local notifications driven by a polling/SSE fallback are all acceptable with an honest trade-off analysis. We evaluate the deep-link routing and the reasoning more than the transport.
- **PLUS**: The second platform; the FRD's cold-start scenario (tagged PLUS there).

### 5.6 Custom native code (the differentiator)

Official plugins are configuration; we want to see you write **native code**.

- **MUST**: A **local Capacitor plugin** (lives in your repo, not published), e.g. `call-monitor`, powering slice 1's call flow:
  - Native implementation on **at least one platform of your choice**, Swift (using `CXCallObserver`) or Kotlin (using `TelephonyManager`/`TelephonyCallback`), that starts a phone call and emits call-state events (`started`, `ended`) to the web layer.
  - A **typed TypeScript API** and a **web fallback** implementation (opens `tel:`, emits a simulated `ended` event when the tab regains focus, or an equivalent you document).
  - Proper plugin registration, permission declarations (`Info.plist` / `AndroidManifest.xml`), and an error path (no phone capability / permission denied) that surfaces cleanly in the UI.
- **PLUS**: The second platform's native implementation.
- If you have a strong reason to build a *different* plugin of equivalent depth (native event emission + permissions + typed API + web fallback), you may; justify it in an ADR and record the FRD impact in the deviations file. Do not substitute a trivial one (a "get device name" plugin does not qualify).

### 5.7 Responsive web

- **MUST**: Phone-first styling; desktop is layered on at the `md` (768px) breakpoint. Where phone and desktop need genuinely different UIs (the FRD's job list table/cards split), fork the JSX with breakpoint classes while sharing the same hooks and cache; never duplicate the data layer, never branch layout on `Capacitor.isNativePlatform()` or user-agent.
- **MUST**: Mobile viewport hygiene: safe-area insets respected, bottom sheets/scrolling usable with the keyboard open.

### 5.8 Mobile shell & run commands

- **MUST**: `ios/` and `android/` Capacitor projects committed. The app runs on the iOS Simulator and Android Emulator.
- **MUST**: `package.json` scripts, documented in the README:
  - `dev`: web dev server
  - `cap:sync`: sync web assets + config to native projects
  - `cap:ios`: build/launch on the iOS Simulator (single command)
  - `cap:android`: build/launch on the Android Emulator (single command)
  - `test`: Vitest suite
  - `seed`: (re)create demo data, if your storage needs it
- Pointing the shell's WebView at the dev server for emulator work is acceptable **if** your README documents the setup precisely (including the Android `adb reverse` / LAN-IP nuance) and an ADR (§6.7) explains what a store-shippable bundle would require instead and why you didn't do it in 12 hours. A working bundled static build is a **PLUS**.

---

## 6. Architecture & engineering criteria

We will inspect the codebase against these. They are not suggestions.

### 6.1 Boundaries

- Server-only code (data access, secrets, server action internals) never reaches the client bundle. Use `import 'server-only'` markers; never delete one to silence a build error.
- The client reaches the server **only** through server actions and route handlers. Mutations return a `{ success, message?, data? }` envelope; inputs are Zod-validated at the boundary.
- Every `useQuery` / `useMutation` invocation lives in a named custom hook in a `*.hook.ts` file. **Components never call TanStack directly** and never import from `@tanstack/react-query`. Components consume plain values.
- Loading semantics: skeletons key off first-load state (`isLoading`), never off `isFetching`; background refetches must not flash skeletons over rendered data (the FRD asserts this on the status-advance flow).

### 6.2 Structure

- Feature slices are **verbs** (create-work-order, execute-work-order, log-call-outcome), and the folder structure makes the slices visible; the FRD's slice map is your starting point.
- State lives in hooks; components are thin shells. Derived state is computed (`useMemo`), never synced with `useEffect` + `setState`.
- **Max 250 lines per file.** Split by separation of concerns when you hit it.
- **No `index.ts` barrel files.** Import every symbol from the file that declares it.
- Every mutation surfaces user feedback (success and error) through one shared mechanism; a silent mutation is a bug. One error-translation path; no per-feature error dictionaries.

### 6.3 Design principles & patterns

SOLID and separation of concerns are assumed. Beyond that, the rule is: **every pattern must solve a concrete problem present in this codebase; decorative architecture counts against you.** We expect to recognize, where they earn their place: hook + presentational component separation, composition over prop-drilling, controlled/uncontrolled input discipline, error boundaries around risky surfaces, and a repository/adapter seam in front of your storage so the .NET-PLUS swap would be a config change, not a rewrite. We do not expect: class hierarchies, DI containers, use-case classes, or DDD tactical ceremony in the frontend.

### 6.4 Testing (Vitest, MUST)

Deterministic tests (fake timers, mocked transport: no real network, no sleeps) covering at least:

1. The **outbox**: enqueue → replay-on-reconnect → failure → retry (pure logic level).
2. Work order **status transition rules** (legal/illegal) at the validation boundary.
3. One **query hook** and one **mutation hook** via `renderHook`, including the error-envelope path.
4. The custom plugin's **web fallback**.

Coverage percentage is not a target; catching a real regression is. Playwright E2E automating 2-3 FRD scenarios verbatim is a **PLUS**.

### 6.5 PROMPTS.md: automated prompt capture (MUST, indispensable)

Every prompt you send to an AI tool during this assessment must be captured into a markdown log **by automation you build**: a hook (e.g. a Claude Code `UserPromptSubmit` hook), an editor rule, a wrapper skill, or a subagent. Requirements:

- The capture mechanism itself is **committed to the repo** (script + config), and your README explains it in two sentences.
- The log records: timestamp, tool + model, and the verbatim prompt. Group by work phase if you like.
- The log must grow **in the same commits** as the work the prompts produced; a single "add prompts" commit at the end tells us it was reconstructed by hand, which fails this item.
- Manual copy-paste transcription fails this item. We are evaluating whether you can bend your own tooling, not whether you can keep a diary.

### 6.6 LIBRARIES.md (MUST)

Every dependency you add beyond the required stack gets three lines: **what** it does for you, **why** this library over the obvious alternatives, and **why this version** (what pinning strategy you chose and what would break if you floated it). If you cannot justify a dependency in three lines, you did not need it.

### 6.7 Decision records (MUST)

Short ADRs (10-20 lines each: Context → Decision → Consequences) in `docs/decisions/`, minimum four:

1. Push notification transport (§5.5)
2. Custom plugin scope + platform choice (§5.6)
3. Offline storage + outbox implementation of the FRD's last-write-wins policy (§5.4)
4. Shell strategy: dev-server WebView vs. bundled build (§5.8)

Plus one for the backend if you attempted the .NET PLUS.

---

## 7. Deliverables checklist

Submit a **private GitHub repo** (invite the reviewers we name in the invitation email) or a zip including the `.git` directory. It must contain:

| # | Deliverable | Requirement |
| --- | --- | --- |
| 1 | **FRD implemented**: every non-cut scenario passes; `docs/frd-deviations.md` lists every cut/deviation with justification | MUST |
| 2 | **Working app**: responsive web + iOS Simulator + Android Emulator via the §5.8 commands | MUST |
| 3 | **Vitest suite**: green via `pnpm test`, scope of §6.4 | MUST |
| 4 | **PROMPTS.md**: auto-captured, mechanism committed (§6.5) | MUST |
| 5 | **LIBRARIES.md**: dependency rationale incl. versions (§6.6) | MUST |
| 6 | **README.md**: prerequisites table (exact versions of Node, pnpm, Xcode, Android Studio/SDK), setup steps, every run command, seed data + how to reach each FRD fixture, and anything a reviewer needs to go from `git clone` to both emulators in ≤ 15 minutes | MUST |
| 7 | **docs/decisions/**: the ADRs of §6.7 | MUST |
| 8 | **LIMITATIONS.md**: what you cut, what's broken, and your next-8-hours plan (may reference the deviations file rather than repeat it) | MUST |
| 9 | **Demo video ≤ 5 min**: screen recording: one emulator run-through, the offline outbox cycle (kill network → mutate → restore → replay), the call-outcome flow, and the push deep link. Unlisted link or file in the repo | MUST |
| 10 | **TIMELOG.md**: rough hours per phase, honor system | MUST |
| 11 | Git history: conventional commits, small coherent steps | MUST |
| 12 | CI (GitHub Actions: lint + typecheck + test) | PLUS |
| 13 | .NET backend variant | PLUS |

---

## 8. What we evaluate

In rough order of weight:

1. **FRD compliance**: scenarios pass as written, test identifiers exposed, fixtures reachable from seed data; deviations declared, justified, and sensible.
2. **Capacitor depth**: purposeful plugin use, the quality of your native code, permission and error paths, platform quirks handled knowingly.
3. **Offline correctness**: the outbox survives the ugly cases (app killed mid-queue, replay failure, double-tap).
4. **Architecture under inspection**: the §6 criteria hold when we open random files, not just in the README.
5. **AI orchestration**: PROMPTS.md shows strategy: decomposition, context-feeding (did you feed the FRD well?), verification loops. "Make me an app" three times is a red flag; so is beautiful code with prompts that couldn't have produced it.
6. **Scope management + honesty**: what you cut, that you said so, and that what you claim works, works.
7. **Tests that would catch regressions**, not tests that decorate the repo.

## 9. After you submit

A 60-minute technical walkthrough: you defend your deviations and your ADRs, we open your code together against the FRD, and we will ask you to change something live. Everything in your submission is fair game, especially your prompts.

Good luck. Build it like the crew is on the roof waiting for it.
