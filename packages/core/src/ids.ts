// Random identifiers. Crockford base32 (no I, L, O, U) so codes read well over the phone.

import type { LocalDate } from './types.ts';

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function randomCode(length: number, alphabet = ALPHABET): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

/** 'NH' + '2026-09-23' → 'NH-260923-7K3M'. */
export function orderId(prefix: string, date: LocalDate): string {
  const yymmdd = date.slice(2, 4) + date.slice(5, 7) + date.slice(8, 10);
  return `${prefix}-${yymmdd}-${randomCode(4)}`;
}

/** Booking ids carry a B: 'MR-B-261010-Q8TD'. */
export function bookingId(prefix: string, date: LocalDate): string {
  return orderId(`${prefix}-B`, date);
}

/** Our payment session id: 'ps_' + 20 base32 chars, lowercased. */
export function sessionId(): string {
  return `ps_${randomCode(20).toLowerCase()}`;
}

export function shortCode(length = 6): string {
  return randomCode(length);
}

/** Gift card code: 'NOHA-7K3M-Q8TD-2WXZ'. */
export function giftCardCode(prefix: string): string {
  return `${prefix}-${randomCode(4)}-${randomCode(4)}-${randomCode(4)}`;
}
