// A minimal JSON key-value store with conditional writes.
// memoryKv for tests and local fallback; blobsKv for Netlify Blobs in functions.

export interface KvEntry<T> {
  value: T;
  etag: string;
}

export interface SetOptions {
  /** Write only if the key does not exist yet. */
  onlyIfNew?: boolean;
  /** Write only if the stored etag still matches. */
  onlyIfMatch?: string;
}

export interface SetResult {
  modified: boolean;
  etag?: string;
}

export interface KvStore {
  getJSON<T>(key: string): Promise<KvEntry<T> | null>;
  setJSON<T>(key: string, value: T, opts?: SetOptions): Promise<SetResult>;
  delete(key: string): Promise<void>;
  /** Keys starting with `prefix`, sorted. */
  list(prefix: string): Promise<string[]>;
  /** Raw binary values (uploads). */
  setBytes?(key: string, bytes: Uint8Array, contentType: string): Promise<void>;
  getBytes?(key: string): Promise<{ bytes: Uint8Array; contentType: string } | null>;
}

export class ConflictError extends Error {
  override name = 'ConflictError';
}

export function memoryKv(): KvStore {
  const data = new Map<string, { json: string; etag: string }>();
  const bin = new Map<string, { bytes: Uint8Array; contentType: string }>();
  let counter = 0;
  return {
    async getJSON<T>(key: string) {
      const hit = data.get(key);
      return hit ? { value: JSON.parse(hit.json) as T, etag: hit.etag } : null;
    },
    async setJSON<T>(key: string, value: T, opts: SetOptions = {}) {
      const hit = data.get(key);
      if (opts.onlyIfNew && hit) return { modified: false };
      if (opts.onlyIfMatch !== undefined && hit?.etag !== opts.onlyIfMatch) return { modified: false };
      const etag = `"m${++counter}"`;
      data.set(key, { json: JSON.stringify(value), etag });
      return { modified: true, etag };
    },
    async delete(key: string) {
      data.delete(key);
      bin.delete(key);
    },
    async list(prefix: string) {
      return [...data.keys(), ...bin.keys()].filter((k) => k.startsWith(prefix)).sort();
    },
    async setBytes(key, bytes, contentType) {
      bin.set(key, { bytes, contentType });
    },
    async getBytes(key) {
      return bin.get(key) ?? null;
    },
  };
}

/**
 * Netlify Blobs store with strong consistency. Imported lazily so that
 * browser bundles and tests never load @netlify/blobs.
 */
export async function blobsKv(storeName: string): Promise<KvStore> {
  const { getStore } = await import('@netlify/blobs');
  const store = getStore({ name: storeName, consistency: 'strong' });
  return {
    async getJSON<T>(key: string) {
      const r = await store.getWithMetadata(key, { type: 'json', consistency: 'strong' });
      if (!r) return null;
      return { value: r.data as T, etag: r.etag ?? '' };
    },
    async setJSON<T>(key: string, value: T, opts: SetOptions = {}) {
      const r = opts.onlyIfNew
        ? await store.setJSON(key, value, { onlyIfNew: true })
        : opts.onlyIfMatch !== undefined
          ? await store.setJSON(key, value, { onlyIfMatch: opts.onlyIfMatch })
          : await store.setJSON(key, value);
      return { modified: r.modified, ...(r.etag ? { etag: r.etag } : {}) };
    },
    async delete(key: string) {
      await store.delete(key);
    },
    async list(prefix: string) {
      const { blobs } = await store.list({ prefix });
      return blobs.map((b) => b.key).sort();
    },
    async setBytes(key, bytes, contentType) {
      await store.set(key, new Blob([bytes as BlobPart], { type: contentType }), { metadata: { contentType } });
    },
    async getBytes(key) {
      const r = await store.getWithMetadata(key, { type: 'arrayBuffer', consistency: 'strong' });
      if (!r) return null;
      return { bytes: new Uint8Array(r.data), contentType: String(r.metadata?.contentType ?? 'application/octet-stream') };
    },
  };
}

/**
 * Read-modify-write with optimistic concurrency.
 * `fn` gets the current value (or null) and returns the next value, or `undefined` to abort.
 * Retries up to `attempts` times with jitter when another writer wins.
 */
export async function withEtagRetry<T, R = T>(
  kv: KvStore,
  key: string,
  fn: (current: T | null) => { next: T; result: R } | undefined | Promise<{ next: T; result: R } | undefined>,
  attempts = 5,
): Promise<R | undefined> {
  for (let i = 0; i < attempts; i++) {
    const cur = await kv.getJSON<T>(key);
    const out = await fn(cur?.value ?? null);
    if (out === undefined) return undefined;
    const res = await kv.setJSON(key, out.next, cur ? { onlyIfMatch: cur.etag } : { onlyIfNew: true });
    if (res.modified) return out.result;
    await new Promise((r) => setTimeout(r, 5 + Math.random() * 20 * (i + 1)));
  }
  throw new ConflictError(`Could not update "${key}" after ${attempts} attempts`);
}
