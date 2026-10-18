// Mailer: `outbox` (demo and dev) writes messages to the store, visible in /owner/;
// `resend` sends real mail on a client's verified domain. A failed send never fails an order.

import type { KvStore } from '@aw/core/server';
import type { SiteConfig } from '@aw/core';

export interface MailMessage {
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

export interface OutboxItem extends MailMessage {
  id: string;
  at: string;
  provider: 'outbox' | 'resend';
  status: 'stored' | 'sent' | 'failed';
  error?: string;
}

export interface Mailer {
  send(m: MailMessage): Promise<{ id: string; status: OutboxItem['status'] }>;
  list(limit?: number): Promise<OutboxItem[]>;
}

export function createMailer(env: Readonly<Record<string, string | undefined>>, kv: KvStore, site: SiteConfig): Mailer {
  const provider = (env.MAIL_PROVIDER as 'outbox' | 'resend' | undefined) ?? site.ops?.mailer ?? 'outbox';
  const record = async (item: OutboxItem) => {
    await kv.setJSON(`outbox/${item.at.replace(/[:.]/g, '-')}-${item.id}.json`, item);
  };
  return {
    async send(m) {
      const id = Math.random().toString(36).slice(2, 10);
      const at = new Date().toISOString();
      if (provider === 'resend' && env.RESEND_API_KEY && env.MAIL_FROM) {
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
            body: JSON.stringify({ from: env.MAIL_FROM, to: m.to, subject: m.subject, text: m.text, html: m.html, ...(m.replyTo ? { reply_to: m.replyTo } : {}) }),
          });
          const status = res.ok ? 'sent' : 'failed';
          await record({ ...m, id, at, provider: 'resend', status, ...(res.ok ? {} : { error: `HTTP ${res.status}` }) });
          return { id, status };
        } catch (e) {
          await record({ ...m, id, at, provider: 'resend', status: 'failed', error: (e as Error).message });
          return { id, status: 'failed' };
        }
      }
      await record({ ...m, id, at, provider: 'outbox', status: 'stored' });
      return { id, status: 'stored' };
    },
    async list(limit = 50) {
      const keys = (await kv.list('outbox/')).reverse().slice(0, limit);
      const out: OutboxItem[] = [];
      for (const k of keys) {
        const v = await kv.getJSON<OutboxItem>(k);
        if (v) out.push(v.value);
      }
      return out;
    },
  };
}
