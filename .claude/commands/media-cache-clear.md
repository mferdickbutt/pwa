---
description: Clear media URL cache
allowed-tools: Bash, Read
---

# Media Cache Clear Command

Your task is to: $ARGUMENTS

Clear the in-memory media URL cache.

## Steps

1. **Check cache status**
   In `packages/frontend/src/lib/api/media.ts`, check:
   - Current cache size (number of URLs)
   - Expired entries
   - Oldest entries

2. **Clear cache** (manual implementation)
   Since cache is in-memory, it will clear when:
   - Frontend restarts
   - `clearMediaCache()` function is called

3. **Force cache clear** (add if needed)
   To manually clear cache, add this function call to component:
   ```typescript
   import { clearMediaCache } from '@/lib/api/media';
   
   // Call to clear cache
   clearMediaCache();
   ```

## Cache Location

**File**: `packages/frontend/src/lib/api/media.ts`
**Cache Type**: In-memory Map
**TTL**: 5 minutes (300,000ms)

## Cache Implementation

```typescript
// Current implementation (if it exists)
const urlCache = new Map<string, { url: string; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCachedMediaUrl(familyId: string, objectKey: string): Promise<string> {
  const cacheKey = `${familyId}:${objectKey}`;
  const cached = urlCache.get(cacheKey);
  const now = Date.now();

  // Return cached URL if not expired
  if (cached && cached.expiresAt > now) {
    return cached.url;
  }

  // Fetch new URL
  const url = await getSignedReadUrl(familyId, objectKey);

  // Cache it
  urlCache.set(cacheKey, {
    url,
    expiresAt: now + CACHE_TTL,
  });

  return url;
}

export function clearMediaCache(): void {
  urlCache.clear();
  console.log('[Media Cache] Cache cleared');
}
```

## Output

Report:
- Cache size before clear (number of entries)
- Number of expired entries (if available)
- Cache status after clear
- Any errors or warnings

## Notes

- Cache is in-memory, so clearing requires function call
- Cache expires automatically after 5 minutes
- Forcing cache clear may improve debugging (see fresh URLs)
- Cache is not persisted across page reloads (by design)
- Consider adding localStorage cache for persistence (future enhancement)

## Common Issues

**Cache not clearing:**
- Verify `clearMediaCache()` function is imported
- Check if function is actually being called
- Add console.log to verify execution

**Cache growing too large:**
- Reduce CACHE_TTL (e.g., to 2 minutes)
- Implement maximum cache size limit
- Clear expired entries periodically

**Stale URLs:**
- Reduce CACHE_TTL
- Implement background cleanup of expired entries
- Check `getSignedReadUrl` response headers for actual expiry

## Related Commands

- `/dev` - Start development servers
- `/test` - Run tests
- `/build` - Build for production
