// SHA-256 of the inline language script for the CSP.

import { createHash } from 'node:crypto';
export { LANG_SCRIPT } from '@aw/ui/lang-script.ts';

export function scriptHash(source: string): `sha256-${string}` {
  return `sha256-${createHash('sha256').update(source, 'utf8').digest('base64')}`;
}
