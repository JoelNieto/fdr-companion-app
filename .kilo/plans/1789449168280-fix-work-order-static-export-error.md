# Fix Work Order Static Export Error

## Problem
The app uses `output: 'export'` (static export) for Capacitor mobile builds. Dynamic route `/work-orders/[id]` requires `generateStaticParams()` to return all possible IDs at build time. However, new work orders are created at runtime with timestamp-based IDs (`wo-${Date.now()}`), which are not included in the static params. Navigating to these new work orders fails with:
```
Error: Page "/work-orders/[id]/page" is missing param "/work-orders/[id]" in "generateStaticParams()"
```

## Root Cause
- `next.config.ts` has `output: 'export'`
- `/app/work-orders/[id]/page.tsx` has `generateStaticParams()` that only returns seed data work orders
- `dataStore.createWorkOrderWithJob()` creates new work orders with `wo-${Date.now()}` IDs at runtime
- These runtime IDs don't exist at build time, so static export doesn't generate pages for them

## Solution: Change Routing to Static Page with Query Parameters

Since the app must keep `output: 'export'` for Capacitor, we'll change the work order detail route from a dynamic route to a static page that reads the ID from query parameters.

### Changes Required

1. **Create new static page**: `/app/work-orders/detail/page.tsx`
   - Reads `id` from `searchParams` (client-side)
   - Fetches work order data client-side using React Query
   - Renders `WorkOrderDetail` component

2. **Remove dynamic route**: Delete `/app/work-orders/[id]/page.tsx` and `/app/work-orders/[id]/not-found.tsx`

3. **Update navigation**: Change all `Link` components from `/work-orders/${wo.id}` to `/work-orders/detail?id=${wo.id}`

4. **Update client-side navigation**: Any programmatic navigation (router.push) to use the new URL format

### Files to Modify

| File | Change |
|------|--------|
| `app/work-orders/detail/page.tsx` | New static page with client-side data fetching |
| `app/work-orders/[id]/page.tsx` | **DELETE** |
| `app/work-orders/[id]/not-found.tsx` | **DELETE** |
| `src/features/work-orders/components/MyWorkOrdersList.tsx` | Update Link hrefs |
| `src/features/jobs/components/WorkOrderList.tsx` | Update Link hrefs (if exists) |
| Any other files linking to work order detail | Update hrefs |

### Implementation Details

**New `/app/work-orders/detail/page.tsx`:**
```tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getWorkOrder } from '@/lib/client-actions';
import { WorkOrderDetail } from '@/features/work-orders/components/WorkOrderDetail';

export default function WorkOrderDetailPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['work-order', id],
    queryFn: async () => {
      const result = await getWorkOrder(id!);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!id,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error || !data) return <div>Work order not found</div>;

  return <WorkOrderDetail workOrderId={id!} />;
}
```

**Update Links:**
```tsx
// Before
<Link href={`/work-orders/${wo.id}`}>

// After  
<Link href={`/work-orders/detail?id=${wo.id}`}>
```

## Validation
1. Run `npm run build` - should complete without the generateStaticParams error
2. Test creating a new work order and navigating to it
3. Test navigating to existing seed work orders
4. Verify Capacitor build still works: `npm run build:mobile`

## Risks
- URL structure changes (breaking change for bookmarks/links)
- Need to ensure all navigation points are updated
- SEO impact (minimal for mobile app)

## Alternative (Not Recommended)
Remove `output: 'export'` and deploy with SSR - but this breaks Capacitor static web build.