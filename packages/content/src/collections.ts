// Astro content collections for a site, generated from the same field definitions as the CMS.
// Used by each site's src/content.config.ts: `export const collections = defineCollections(site)`.

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import type { SiteConfig } from '@aw/core';
import { resolvePreset, type SettingsId } from '@aw/presets';
import { collectionFields, collectionFormat, pageFields, settingsFields } from './defs/index.ts';
import { entrySchema, fieldsToZod, settingsSchema } from './zod.ts';

type SchemaContext = { image: () => z.ZodType };

/** Settings files are separate collections ('s-general', 's-home'…) so each gets its own schema and images. */
export function settingsCollectionName(id: SettingsId): string {
  return `s-${id}`;
}

export function defineCollections(site: SiteConfig) {
  const r = resolvePreset(site);
  const strict = process.env.AW_STRICT_CONTENT === '1';
  const currency = site.locale.currency;
  const collections: Record<string, unknown> = {};

  for (const id of r.collections) {
    if (id === 'settings') continue;
    const format = collectionFormat(id);
    if (format === 'md') {
      collections[id] = defineCollection({
        loader: glob({ pattern: '*/index.*.md', base: `./src/content/${id}`, generateId: ({ entry }) => entry.replace(/\/index\.(ar|en)\.md$/, '.$1') }),
        schema: ({ image }: SchemaContext) =>
          fieldsToZod(pageFields, { locale: 'en', currency, image: () => image() })
            .extend({ title: z.string().min(1), kind: z.string().optional(), order: z.number().optional(), image: image().optional() })
            .loose(),
      });
      continue;
    }
    const fields = collectionFields(id, r);
    collections[id] = defineCollection({
      loader: glob({ pattern: '*/index.yml', base: `./src/content/${id}`, generateId: ({ entry }) => entry.split('/')[0]! }),
      schema: ({ image }: SchemaContext) =>
        format === 'yaml-plain'
          ? settingsSchema(fields, { currency, strict, image: () => image() })
          : entrySchema(fields, { currency, strict, image: () => image() }),
    });
  }

  for (const id of r.settings) {
    collections[settingsCollectionName(id)] = defineCollection({
      loader: glob({ pattern: `${id}.json`, base: './src/content/settings', generateId: () => id }),
      schema: ({ image }: SchemaContext) => settingsSchema(settingsFields(id, r.sections), { currency, strict, image: () => image() }),
    });
  }

  return collections;
}
