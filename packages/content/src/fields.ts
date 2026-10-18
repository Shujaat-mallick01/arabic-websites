// One field definition → both the Astro/Zod schema and the Sveltia CMS field.
// This is why the CMS and the site cannot drift apart.

import type { I18nText } from '@aw/core';

export interface BaseField {
  name: string;
  /** Arabic label for the CMS (neutral phrasing); English for docs and tooling. */
  label: I18nText;
  hint?: I18nText;
  required?: boolean;
  /** Translatable: stored under both `ar:` and `en:`. Default false. */
  i18n?: boolean;
}

export type Field =
  | (BaseField & { kind: 'string'; pattern?: [string, I18nText]; maxLength?: number; default?: string })
  | (BaseField & { kind: 'text'; maxLength?: number })
  | (BaseField & { kind: 'markdown' })
  | (BaseField & { kind: 'money' })
  | (BaseField & { kind: 'number'; min?: number; max?: number; step?: number; int?: boolean; default?: number })
  | (BaseField & { kind: 'boolean'; default?: boolean })
  | (BaseField & { kind: 'select'; options: Array<{ value: string; label: I18nText }>; multiple?: boolean; default?: string | string[] })
  | (BaseField & { kind: 'relation'; collection: string; multiple?: boolean })
  | (BaseField & { kind: 'image' })
  | (BaseField & { kind: 'date' })
  | (BaseField & { kind: 'time' })
  | (BaseField & { kind: 'hidden'; default?: string })
  | (BaseField & { kind: 'color' })
  | (BaseField & { kind: 'i18nText'; multiline?: boolean; maxLength?: number })
  | (BaseField & { kind: 'list'; of: 'string' | 'number' | 'date'; min?: number; max?: number })
  | (BaseField & { kind: 'objects'; fields: Field[]; min?: number; max?: number; summary?: string })
  | (BaseField & { kind: 'object'; fields: Field[]; collapsed?: boolean })
  | (BaseField & { kind: 'typed'; types: Array<{ name: string; label: I18nText; fields: Field[] }> });

type Opt<F> = Omit<F, 'kind' | 'name' | 'label'>;
const l = (ar: string, en: string): I18nText => ({ ar, en });

/** Terse builders: f.string('title', 'الاسم', 'Name', { i18n: true, required: true }). */
export const f = {
  string: (name: string, ar: string, en: string, o: Opt<Extract<Field, { kind: 'string' }>> = {}): Field => ({ kind: 'string', name, label: l(ar, en), ...o }),
  text: (name: string, ar: string, en: string, o: Opt<Extract<Field, { kind: 'text' }>> = {}): Field => ({ kind: 'text', name, label: l(ar, en), ...o }),
  markdown: (name: string, ar: string, en: string, o: Opt<Extract<Field, { kind: 'markdown' }>> = {}): Field => ({ kind: 'markdown', name, label: l(ar, en), ...o }),
  money: (name: string, ar: string, en: string, o: Opt<Extract<Field, { kind: 'money' }>> = {}): Field => ({ kind: 'money', name, label: l(ar, en), ...o }),
  number: (name: string, ar: string, en: string, o: Opt<Extract<Field, { kind: 'number' }>> = {}): Field => ({ kind: 'number', name, label: l(ar, en), ...o }),
  boolean: (name: string, ar: string, en: string, o: Opt<Extract<Field, { kind: 'boolean' }>> = {}): Field => ({ kind: 'boolean', name, label: l(ar, en), ...o }),
  select: (name: string, ar: string, en: string, options: Array<[string, string, string]>, o: Omit<Opt<Extract<Field, { kind: 'select' }>>, 'options'> = {}): Field => ({
    kind: 'select',
    name,
    label: l(ar, en),
    options: options.map(([value, oar, oen]) => ({ value, label: l(oar, oen) })),
    ...o,
  }),
  relation: (name: string, ar: string, en: string, collection: string, o: Omit<Opt<Extract<Field, { kind: 'relation' }>>, 'collection'> = {}): Field => ({ kind: 'relation', name, label: l(ar, en), collection, ...o }),
  image: (name: string, ar: string, en: string, o: Opt<Extract<Field, { kind: 'image' }>> = {}): Field => ({ kind: 'image', name, label: l(ar, en), ...o }),
  date: (name: string, ar: string, en: string, o: Opt<Extract<Field, { kind: 'date' }>> = {}): Field => ({ kind: 'date', name, label: l(ar, en), ...o }),
  time: (name: string, ar: string, en: string, o: Opt<Extract<Field, { kind: 'time' }>> = {}): Field => ({ kind: 'time', name, label: l(ar, en), ...o }),
  hidden: (name: string, o: Opt<Extract<Field, { kind: 'hidden' }>> = {}): Field => ({ kind: 'hidden', name, label: l(name, name), ...o }),
  color: (name: string, ar: string, en: string, o: Opt<Extract<Field, { kind: 'color' }>> = {}): Field => ({ kind: 'color', name, label: l(ar, en), ...o }),
  i18nText: (name: string, ar: string, en: string, o: Opt<Extract<Field, { kind: 'i18nText' }>> = {}): Field => ({ kind: 'i18nText', name, label: l(ar, en), ...o }),
  list: (name: string, ar: string, en: string, of: 'string' | 'number' | 'date', o: Omit<Opt<Extract<Field, { kind: 'list' }>>, 'of'> = {}): Field => ({ kind: 'list', name, label: l(ar, en), of, ...o }),
  objects: (name: string, ar: string, en: string, fields: Field[], o: Omit<Opt<Extract<Field, { kind: 'objects' }>>, 'fields'> = {}): Field => ({ kind: 'objects', name, label: l(ar, en), fields, ...o }),
  object: (name: string, ar: string, en: string, fields: Field[], o: Omit<Opt<Extract<Field, { kind: 'object' }>>, 'fields'> = {}): Field => ({ kind: 'object', name, label: l(ar, en), fields, ...o }),
  typed: (name: string, ar: string, en: string, types: Array<{ name: string; label: I18nText; fields: Field[] }>, o: Omit<Opt<Extract<Field, { kind: 'typed' }>>, 'types'> = {}): Field => ({ kind: 'typed', name, label: l(ar, en), types, ...o }),
};

export function translatable(fields: Field[]): Field[] {
  return fields.filter((x) => x.i18n);
}
