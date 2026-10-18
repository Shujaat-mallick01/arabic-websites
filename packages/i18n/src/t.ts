// Dictionary lookup with dialect and audience overlays.

import type { Audience, Dialect, Lang } from '@aw/core';
import { ar, type DictKey } from './dict/ar.ts';
import { en } from './dict/en.ts';
import { dialectAudience, dialects, women, type Overlay } from './dict/overlays.ts';

export interface TContext {
  lang: Lang;
  dialect: Dialect;
  audience: Audience;
  /** Per-site overrides, e.g. a hero CTA text from settings/home.json. */
  overrides?: Partial<Record<Lang, Overlay>>;
}

export type TVars = Record<string, string | number>;

function interpolate(s: string, vars?: TVars): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** Lookup order: site override → dialect+audience → audience → dialect → base. English has no overlays. */
export function t(key: DictKey, ctx: TContext, vars?: TVars): string {
  const o = ctx.overrides?.[ctx.lang]?.[key];
  if (o !== undefined) return interpolate(o, vars);
  if (ctx.lang === 'en') return interpolate(en[key], vars);
  const da = dialectAudience[`${ctx.dialect}+${ctx.audience}`]?.[key];
  if (da !== undefined) return interpolate(da, vars);
  if (ctx.audience === 'women') {
    const w = women[key];
    if (w !== undefined) return interpolate(w, vars);
  }
  const d = dialects[ctx.dialect]?.[key];
  if (d !== undefined) return interpolate(d, vars);
  return interpolate(ar[key], vars);
}

/** A bound translator: `const tr = translator(ctx); tr('cart.add')`. */
export function translator(ctx: TContext) {
  return (key: DictKey, vars?: TVars) => t(key, ctx, vars);
}

export type Translator = ReturnType<typeof translator>;

export interface PluralForms {
  zero?: string;
  one: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

const prCache = new Map<Lang, Intl.PluralRules>();

/** CLDR plural category for the language, with fallbacks to 'other'. `{n}` in the form is replaced. */
export function plural(lang: Lang, n: number, forms: PluralForms, formattedN?: string): string {
  let pr = prCache.get(lang);
  if (!pr) {
    pr = new Intl.PluralRules(lang);
    prCache.set(lang, pr);
  }
  const cat = pr.select(n) as keyof PluralForms;
  const form = forms[cat] ?? forms.other;
  return form.replace(/\{n\}/g, formattedN ?? String(n));
}
