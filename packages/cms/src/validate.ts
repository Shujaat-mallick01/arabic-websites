// Validates a generated CMS config against Sveltia's own JSON Schema (check-all and site:sync --check).

import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import AjvModule from 'ajv';

const require = createRequire(import.meta.url);
const Ajv = (AjvModule as unknown as { default?: typeof AjvModule }).default ?? AjvModule;

let validator: ((data: unknown) => boolean) & { errors?: Array<{ instancePath: string; message?: string; params?: unknown }> | null };

export function validateCmsConfig(config: unknown): string[] {
  if (!validator) {
    // The schema is not in the package's "exports", so read it from the package folder.
    let dir = dirname(require.resolve('@sveltia/cms'));
    while (!dir.endsWith('cms') && dirname(dir) !== dir) dir = dirname(dir);
    const schema = JSON.parse(readFileSync(join(dir, 'schema', 'sveltia-cms.json'), 'utf8'));
    const ajv = new (Ajv as unknown as new (o: object) => { compile: (s: unknown) => typeof validator })({ allErrors: true, strict: false, validateFormats: false, logger: false });
    validator = ajv.compile(schema);
  }
  if (validator(config)) return [];
  return (validator.errors ?? []).map((e) => `${e.instancePath || '/'} ${e.message ?? ''} ${JSON.stringify(e.params ?? {})}`);
}
