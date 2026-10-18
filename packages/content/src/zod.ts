// Field definitions → Zod schemas. Tolerant of what YAML and the CMS actually write
// (empty strings for empty fields, unquoted dates parsed as Date, numbers stored as strings).

import { z } from 'astro/zod';
import { isLocalDate, isTimeHM, parseDecimal, type CurrencyCode } from '@aw/core';
import type { Field } from './fields.ts';

export interface ZodContext {
  /** 'ar' = the full default-locale record; 'en' = translatable fields only, all optional. */
  locale: 'ar' | 'en';
  currency: CurrencyCode;
  /** Astro's image() helper. Without it images are plain path strings (server data). */
  image?: () => z.ZodType;
  /** Production builds: reject off-step prices and over-long text. */
  strict?: boolean;
}

const emptyToUndefined = (v: unknown) => (v === '' || v === null ? undefined : v);

const dateValue = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : emptyToUndefined(v)),
  z.string().refine(isLocalDate, 'Use a date like 2026-10-01'),
);

const timeValue = z.preprocess(
  (v) => {
    if (typeof v === 'number' && Number.isInteger(v)) return `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;
    return emptyToUndefined(v);
  },
  z.string().refine(isTimeHM, 'Use a 24-hour time like 14:00'),
);

const numberValue = (min?: number, max?: number, int?: boolean) => {
  let n = z.number();
  if (int) n = n.int();
  if (min !== undefined) n = n.min(min);
  if (max !== undefined) n = n.max(max);
  return z.preprocess((v) => {
    const e = emptyToUndefined(v);
    return typeof e === 'string' ? Number(e) : e;
  }, n);
};

function moneyValue(ctx: ZodContext) {
  return z.preprocess(emptyToUndefined, z.union([z.string(), z.number()])).transform((v, c) => {
    const s = String(v);
    try {
      parseDecimal(s, ctx.currency, { strictStep: ctx.strict });
    } catch (e) {
      c.addIssue({ code: 'custom', message: (e as Error).message });
      return z.NEVER;
    }
    return s;
  });
}

function opt<T extends z.ZodType>(schema: T, required: boolean | undefined, ctx: ZodContext): z.ZodType {
  if (ctx.locale === 'en' || !required) return z.preprocess(emptyToUndefined, schema.optional());
  return schema;
}

export function fieldToZod(field: Field, ctx: ZodContext): z.ZodType {
  const req = field.required;
  switch (field.kind) {
    case 'string':
    case 'text':
    case 'markdown': {
      let s = z.string();
      if (req && ctx.locale === 'ar') s = s.min(1, 'Required');
      if (ctx.strict && 'maxLength' in field && field.maxLength) s = s.max(field.maxLength);
      return opt(s, req, ctx);
    }
    case 'hidden':
      return z.preprocess(emptyToUndefined, z.string().optional());
    case 'money':
      return req && ctx.locale === 'ar' ? moneyValue(ctx) : moneyValue(ctx).optional();
    case 'number':
      return opt(numberValue(field.min, field.max, field.int), req, ctx);
    case 'boolean':
      return z.preprocess(emptyToUndefined, z.boolean().default(field.default ?? false));
    case 'select': {
      const allowed = field.options.map((o) => o.value);
      const inOptions = (v: string) => allowed.length === 0 || allowed.includes(v);
      if (field.multiple) {
        return z.preprocess(emptyToUndefined, z.array(z.coerce.string().refine(inOptions, `Use one of: ${allowed.join(', ')}`)).default([]));
      }
      const fallback = typeof field.default === 'string' ? field.default : undefined;
      const value = z.string().refine(inOptions, `Use one of: ${allowed.join(', ')}`);
      const mustHave = req && ctx.locale === 'ar' && fallback === undefined;
      const pre = z.preprocess((v) => {
        const e = emptyToUndefined(v);
        if (e === undefined) return fallback;
        return typeof e === 'number' ? String(e) : e;
      }, mustHave || fallback !== undefined ? value : value.optional());
      // Zod 4 skips preprocess for absent keys, so the fallback also needs an outer default.
      return fallback !== undefined && ctx.locale === 'ar' ? pre.default(fallback) : pre;
    }
    case 'relation':
      if (field.multiple) return z.preprocess(emptyToUndefined, z.array(z.string()).default([]));
      return opt(z.string(), req, ctx);
    case 'image':
      return opt(ctx.image ? ctx.image() : z.string(), req, ctx);
    case 'date':
      return opt(dateValue, req, ctx);
    case 'time':
      return opt(timeValue, req, ctx);
    case 'color':
      return opt(z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a colour like #1A4A44'), req, ctx);
    case 'i18nText': {
      const shape = z.object({ ar: z.string().default(''), en: z.string().default('') });
      const checked = req ? shape.refine((v) => v.ar.trim().length > 0, 'Arabic text is required') : shape;
      return z.preprocess(emptyToUndefined, req ? checked : checked.default({ ar: '', en: '' }));
    }
    case 'list': {
      const item = field.of === 'number' ? numberValue() : field.of === 'date' ? dateValue : z.coerce.string();
      return z.preprocess(emptyToUndefined, z.array(item).default([]));
    }
    case 'objects':
      return z.preprocess(emptyToUndefined, z.array(fieldsToZod(field.fields, { ...ctx, locale: 'ar' })).default([]));
    case 'object': {
      const inner = fieldsToZod(field.fields, { ...ctx, locale: 'ar' });
      return z.preprocess(emptyToUndefined, req ? inner : inner.optional());
    }
    case 'typed': {
      const variants = field.types.map((t) => z.object({ type: z.literal(t.name) }).extend(fieldsToZod(t.fields, { ...ctx, locale: 'ar' }).shape));
      const [first, ...rest] = variants;
      if (!first) return z.array(z.never()).default([]);
      return z.preprocess(emptyToUndefined, z.array(rest.length ? z.discriminatedUnion('type', [first, ...rest]) : first).default([]));
    }
  }
}

export function fieldsToZod(fields: Field[], ctx: ZodContext) {
  const shape: Record<string, z.ZodType> = {};
  for (const field of fields) {
    if (ctx.locale === 'en' && !field.i18n) continue;
    shape[field.name] = fieldToZod(field, ctx);
  }
  return z.object(shape);
}

/** An entry file: { ar: all fields, en: translatable fields (optional, so Arabic-first drafts build) }. */
export function entrySchema(fields: Field[], ctx: Omit<ZodContext, 'locale'>) {
  return z.object({
    ar: fieldsToZod(fields, { ...ctx, locale: 'ar' }).loose(),
    en: z.preprocess(emptyToUndefined, fieldsToZod(fields, { ...ctx, locale: 'en' }).loose().default({})),
  });
}

/** A settings file: flat, no i18n panes. */
export function settingsSchema(fields: Field[], ctx: Omit<ZodContext, 'locale'>) {
  return fieldsToZod(fields, { ...ctx, locale: 'ar' }).loose();
}
