# Field Companion - Web & Mobile App

RoofPilot Field Companion - field management app with web, iOS, and Android support. Implementation of the FRD for a roofing field management app.

## Tech Stack

### Web
- **Next.js 16** (App Router) + React 19
- **TanStack Query v5** (named hooks only)
- **Tailwind CSS v4** (mobile-first, md: 768px)
- **Zod** validation at server boundaries
- **TypeScript strict** mode
- **pnpm** package manager

### Mobile (Capacitor 8)
- **iOS** (Swift) - primary native platform
- **Android** - platform added, minimal configuration
- **Capacitor 8** - native bridge
- **Custom Plugin**: `call-monitor` (iOS Swift, `CXCallObserver`)
- **Official Plugins**: Network, Camera, Local Notifications, Preferences

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20+ | JavaScript runtime |
| pnpm | 8+ | Package manager |
| Xcode | 15+ | iOS development (macOS only) |
| Android Studio | Hedgehog+ | Android development (optional) |

---

## Getting Started (Web)

### Install Dependencies
```bash
pnpm install
```

### Development
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000)

### Production Build & Run (for offline testing)
```bash
pnpm build && pnpm start
```
Open [http://localhost:3000](http://localhost:3000) - works offline

### Testing (Web)
```bash
# TypeScript type check
pnpm tsc --noEmit

# Lint
pnpm lint

# Vitest
pnpm vitest run
```

---

## Getting Started (iOS)

### Prerequisites
- macOS with Xcode 15+
- iOS Simulator or physical device
- CocoaPods (installed via `npx cap sync`)

### Setup
```bash
# 1. Install dependencies (includes Capacitor plugins)
pnpm install

# 2. Build web assets for mobile
pnpm build

# 3. Sync Capacitor (copies web assets to iOS, updates plugins)
npx cap sync ios

# 4. Open in Xcode
npx cap open ios
```

### Run on Simulator
```bash
# Via CLI
npx cap run ios

# Or open ios/App/App.xcworkspace in Xcode and press Play (▶)
```

### Run on Physical Device
1. Open `ios/App/App.xcworkspace` in Xcode
2. Select your device from the device dropdown
3. Configure Signing & Capabilities (Team, Bundle ID)
4. Press Play (▶)

---

## Getting Started (Android)

### Prerequisites
- Android Studio Hedgehog+
- Android SDK 34+

### Setup
```bash
# 1. Install dependencies
pnpm install

# 2. Build web assets
pnpm build

# 3. Sync Capacitor
npx cap sync android

# 4. Open in Android Studio
npx cap open android
```

### Run
Open `android/` in Android Studio, select device/emulator, press Play (▶)

---

## Capacitor Scripts

| Command | Description |
|---------|-------------|
| `pnpm cap:sync` | `npx cap sync` - sync plugins & web assets |
| `pnpm cap:ios` | `npx cap run ios` - build & run iOS |
| `pnpm cap:android` | `npx cap run android` - build & run Android |
| `pnpm cap:build` | `npx cap build ios` - build iOS for release |
| `pnpm build:mobile` | `next build && npx cap sync` - full mobile build |

---

## Features (5 FRD Slices)

### Slice 1: Contacts/Contact Directory
- `/contacts` - Searchable list, alphabetical, sticky search
- `/contacts/:id` - Detail with phone/email/address, jobs, notes
- Call button (`tel:`) → simulated call end → Call Outcome sheet
- Call outcome notes (1-500 chars, validation)

### Slice 2: Jobs/Job List
- `/jobs` - Responsive: table (desktop) / cards (mobile)
- Status filter with empty states
- `/jobs/:id` - Details, contact card, work orders list
- Create Work Order sheet (title 3-80, assignee, date ≥today)

### Slice 3: Work Orders/Execute Work Order
- `/work-orders` - My WOs grouped: Today / Upcoming
- `/work-orders/:id` - Status badge, advance/block/resume actions
- State machine: scheduled → en_route → on_site → done (blocked from en_route/on_site)
- Photo evidence (Camera plugin on native, file input on web)
- Block sheet with reason validation (5-200 chars)

### Slice 4: Platform/Offline Outbox
- Yellow banner when offline
- Floating outbox indicator (mail icon) with pending count
- Outbox panel: pending/syncing/synced/failed items with retry
- IndexedDB persistence, FIFO replay on reconnect

### Slice 5: Platform/Assignment Push
- In-app banner on foreground (blue, top)
- Deep link to `/work-orders/:id` (`fieldcompanion://work-orders/{id}`)
- Not-found screen for invalid deep links
- Notification permission hint (non-nagging)
- **iOS**: Local Notifications via Capacitor plugin
- **Web**: localStorage polling fallback

---

## Mobile-Specific Features

### Native Plugins
| Plugin | Purpose | Native Implementation |
|--------|---------|----------------------|
| `@capacitor/network` | Connectivity detection | Native Network API |
| `@capacitor/camera` | Photo capture | Camera API (iOS/Android) |
| `@capacitor/local-notifications` | Push notifications | UNUserNotificationCenter / NotificationManager |
| `@capacitor/preferences` | Secure storage | Keychain / EncryptedSharedPreferences |
| `call-monitor` (custom) | Call state monitoring | `CXCallObserver` (iOS only) |

### Deep Linking
- **Scheme**: `fieldcompanion://`
- **Route**: `fieldcompanion://work-orders/{id}`
- **iOS**: `CFBundleURLTypes` in Info.plist
- **Android**: Intent filter in AndroidManifest.xml

### Camera
- **Web**: `<input type="file" capture="environment">`
- **iOS/Android**: `Camera.getPhoto({ quality: 90, resultType: DataUrl, source: Camera })`
- **Permission**: `NSCameraUsageDescription` (iOS), `CAMERA` (Android)

### Call Monitor (iOS Only)
- **Plugin**: `call-monitor` (local, Swift)
- **API**: `CallMonitor.startCall({ phoneNumber })`, `CallMonitor.addListener('callState', ...)`
- **Events**: `started`, `ended`, `failed`
- **Web Fallback**: `tel:` link + `window.focus` simulation

---

## Testing (Web)

### Offline Testing
1. Run `pnpm build && pnpm start`
2. Click "Simulate Offline" button (top-right in dev)
3. Create work order / advance status / block / call outcome
4. Outbox indicator shows pending count
5. Click "Go Online" → items sync automatically

### Push Testing
In browser console:
```js
localStorage.setItem('field-companion-push', JSON.stringify({
  id: 'wo-test', title: 'Test WO', status: 'scheduled'
}))
```
Then refresh or wait 5s for polling.

### Unit Tests
```bash
pnpm vitest run
# 60 tests passing: outbox, status transitions, hooks, call fallback, notifications
```

---

## Testing (iOS)

### Simulator
1. `npx cap run ios` (auto-boots simulator, installs, launches)
2. Test offline: Toggle Airplane Mode → create work order → disable Airplane → watch sync
3. Test push: Create work order → notification appears → tap → deep links to WO
4. Test call: Tap call button → CallMonitor tracks state → outcome sheet appears

### Physical Device
1. Connect iPhone via USB
2. Select device in Xcode
3. Run → trust developer on device if prompted
4. Test Camera: Tap "Add Photo" → Camera opens → capture → appears in WO
5. Test Call: Tap call button → Phone app opens → end call → outcome sheet appears

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── contacts/          # Contact list & detail
│   ├── jobs/              # Job list & detail
│   ├── work-orders/       # Work order list & detail
│   ├── providers.tsx      # TanStack Query + Feedback providers
│   └── layout-client.tsx  # Layout with bottom nav
├── features/
│   ├── contacts/          # Contact feature (hooks, components, schema, server)
│   ├── jobs/              # Job feature
│   ├── work-orders/       # Work order feature
│   ├── offline/           # Offline outbox (hooks, lib, components)
│   └── push/              # Push notifications
├── components/
│   ├── ui/                # Reusable UI primitives
│   └── layout/            # Header, Navigation, SafeArea
├── lib/
│   ├── query-client.ts    # TanStack Query setup
│   ├── validation.ts      # Zod helpers
│   ├── feedback.tsx       # Toast notifications
│   └── storage/           # Seed data + in-memory store
├── types/                 # Domain types
└── plugins/
    └── call-monitor/      # Custom Capacitor plugin (iOS Swift)

docs/
├── decisions/             # ADRs (Architecture Decision Records)
│   ├── 01-push-transport.md
│   ├── 02-custom-plugin-scope.md
│   ├── 03-offline-storage.md
│   └── 04-shell-strategy.md

.kilo/
├── hooks/
│   ├── capture-prompt.js  # PROMPTS.md auto-capture (Node.js)
│   └── capture-prompt.sh  # PROMPTS.md auto-capture (Bash)
```

---

## Documentation

- [LIBRARIES.md](LIBRARIES.md) - Core libraries & architecture decisions
- [PROMPTS.md](PROMPTS.md) - Agent prompts & code review checklist
- [docs/decisions/01-push-transport.md](docs/decisions/01-push-transport.md) - Local Notifications decision
- [docs/decisions/02-custom-plugin-scope.md](docs/decisions/02-custom-plugin-scope.md) - call-monitor iOS-only decision
- [docs/decisions/03-offline-storage.md](docs/decisions/03-offline-storage.md) - IndexedDB + Outbox decision
- [docs/decisions/04-shell-strategy.md](docs/decisions/04-shell-strategy.md) - Bundled Static Export decision

---

## Test Identifiers

All FRD test IDs implemented (see FRD for complete list):
- Slice 1: 15 IDs
- Slice 2: 20 IDs  
- Slice 3: 17 IDs
- Slice 4: 7 IDs
- Slice 5: 4 IDs

---

## Known Limitations

- No Service Worker (offline caching limited to IndexedDB)
- Push simulated via localStorage polling on web
- Native plugins (Camera, Call Monitor) not available on web
- Call Monitor: iOS only (Android uses web fallback)
- Single user (Casey Rivera), no auth
- Android: platform added but no native Camera/Call Monitor implementation
- Static export: no Server Actions, uses client-actions.ts + dataStore
- No background sync (iOS restriction)

---

## License

MIT