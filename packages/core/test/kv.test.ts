import { describe, expect, it } from 'vitest';
import { memoryKv, withEtagRetry } from '../src/server/index.ts';
import { bookingId, giftCardCode, orderId, sessionId } from '../src/index.ts';

describe('memoryKv', () => {
  it('supports onlyIfNew and onlyIfMatch', async () => {
    const kv = memoryKv();
    const a = await kv.setJSON('k', { n: 1 }, { onlyIfNew: true });
    expect(a.modified).toBe(true);
    expect((await kv.setJSON('k', { n: 2 }, { onlyIfNew: true })).modified).toBe(false);
    expect((await kv.setJSON('k', { n: 3 }, { onlyIfMatch: '"nope"' })).modified).toBe(false);
    expect((await kv.setJSON('k', { n: 4 }, { onlyIfMatch: a.etag! })).modified).toBe(true);
    expect((await kv.getJSON<{ n: number }>('k'))?.value.n).toBe(4);
    expect(await kv.list('k')).toEqual(['k']);
    await kv.delete('k');
    expect(await kv.getJSON('k')).toBeNull();
  });

  it('lets exactly one of many concurrent writers take the last unit', async () => {
    const kv = memoryKv();
    await kv.setJSON('cap', { used: 0, limit: 1 });
    const results = await Promise.all(
      Array.from({ length: 10 }, () =>
        withEtagRetry<{ used: number; limit: number }, 'ok' | 'full'>(kv, 'cap', (cur) => {
          const c = cur ?? { used: 0, limit: 1 };
          if (c.used >= c.limit) return { next: c, result: 'full' };
          return { next: { ...c, used: c.used + 1 }, result: 'ok' };
        }, 20),
      ),
    );
    expect(results.filter((r) => r === 'ok')).toHaveLength(1);
    expect((await kv.getJSON<{ used: number }>('cap'))?.value.used).toBe(1);
  });
});

describe('ids', () => {
  it('builds readable ids', () => {
    expect(orderId('DR', '2026-09-23')).toMatch(/^DR-260923-[0-9A-HJKMNP-TV-Z]{4}$/);
    expect(bookingId('MR', '2026-10-10')).toMatch(/^MR-B-261010-[0-9A-Z]{4}$/);
    expect(sessionId()).toMatch(/^ps_[0-9a-z]{20}$/);
    expect(giftCardCode('NOHA')).toMatch(/^NOHA-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/);
  });
});
