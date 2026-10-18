// Which fields a collection has for a given site: base fields plus the niche's field packs.

import type { CollectionId, ResolvedPreset } from '@aw/presets';
import type { Field } from '../fields.ts';
import {
  addonFields,
  branchFields,
  categoryFields,
  faqFields,
  galleryFields,
  noteFields,
  offerFields,
  packageFields,
  packs,
  pageFields,
  productBase,
  resourceFields,
  reviewFields,
  serviceBase,
  stockistFields,
  themeFields,
  wrapperFields,
} from './collections.ts';

export * from './collections.ts';
export * from './settings.ts';

/** Extra packs some niches always get, on top of their preset's list. */
const EXTRA_PRODUCT_PACKS: Partial<Record<ResolvedPreset['niche'], string[]>> = {
  fashion: ['fashion.hemming'],
  perfume: ['occasion'],
  favors: ['occasion'],
};

function withPacks(base: Field[], names: string[]): Field[] {
  const out = [...base];
  const seen = new Set(out.map((x) => x.name));
  for (const n of names) {
    const pack = packs[n];
    if (!pack) throw new Error(`Unknown field pack "${n}"`);
    for (const field of pack) {
      if (seen.has(field.name)) continue;
      seen.add(field.name);
      out.push(field);
    }
  }
  return out;
}

export function productPackNames(r: ResolvedPreset): string[] {
  const names = [...r.fieldPacks.products, ...(EXTRA_PRODUCT_PACKS[r.niche] ?? [])];
  if (r.modules.has('personalisation') && !names.includes('personalisation')) names.push('personalisation');
  if (r.modules.has('referenceUpload') && !names.includes('referenceImage')) names.push('referenceImage');
  return names;
}

export function collectionFields(id: Exclude<CollectionId, 'settings'>, r: ResolvedPreset): Field[] {
  switch (id) {
    case 'products':
      return withPacks(productBase, productPackNames(r));
    case 'services':
      return withPacks(serviceBase, r.fieldPacks.services);
    case 'categories':
      return categoryFields;
    case 'packages':
      return packageFields;
    case 'addons':
      return addonFields;
    case 'themes':
      return themeFields;
    case 'resources':
      return resourceFields;
    case 'notes':
      return noteFields;
    case 'wrappers':
      return wrapperFields;
    case 'gallery':
      return galleryFields;
    case 'reviews':
      return reviewFields;
    case 'faqs':
      return faqFields;
    case 'branches':
      return branchFields;
    case 'stockists':
      return stockistFields;
    case 'offers':
      return offerFields;
    case 'pages':
      return pageFields;
  }
}

/** Collections stored as one YAML per entry folder with ar/en keys. Resources are operational: no i18n panes. */
export function collectionFormat(id: CollectionId): 'yaml-i18n' | 'yaml-plain' | 'md' | 'json' {
  if (id === 'settings') return 'json';
  if (id === 'pages') return 'md';
  if (id === 'resources') return 'yaml-plain';
  return 'yaml-i18n';
}
