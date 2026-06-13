import "server-only";

type CacheEntry<T> = {
  expiresAt: number;
  pending?: Promise<T>;
  value?: T;
};

declare global {
  // eslint-disable-next-line no-var
  var __worldcupServerCache: Map<string, CacheEntry<unknown>> | undefined;
}

const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

function getCacheStore() {
  if (!globalThis.__worldcupServerCache) {
    globalThis.__worldcupServerCache = new Map();
  }

  return globalThis.__worldcupServerCache;
}

export function getServerCacheTtlMs() {
  const value = Number(process.env.WORLDCUP_DB_CACHE_TTL_MS);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_CACHE_TTL_MS;
}

export async function getCachedServerData<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs = getServerCacheTtlMs()
): Promise<T> {
  const now = Date.now();
  const store = getCacheStore();
  const entry = store.get(key) as CacheEntry<T> | undefined;

  if (entry?.value !== undefined && entry.expiresAt > now) {
    return entry.value;
  }

  if (entry?.pending) {
    return entry.pending;
  }

  const pending = loader()
    .then((value) => {
      store.set(key, {
        expiresAt: Date.now() + ttlMs,
        value
      });
      return value;
    })
    .catch((error) => {
      store.delete(key);
      throw error;
    });

  store.set(key, {
    expiresAt: now + ttlMs,
    pending
  });

  return pending;
}

export function clearServerDataCache(prefix?: string) {
  const store = getCacheStore();

  if (!prefix) {
    store.clear();
    return;
  }

  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}
