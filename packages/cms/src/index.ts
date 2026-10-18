// Sveltia CMS configuration, generated from the same field definitions as the Astro schemas.
// Output: sites/NN/public/admin/config.yml and public/admin/index.html (both GENERATED).

import { stringify } from 'yaml';
import { CURRENCIES, type CurrencyCode, type SiteConfig } from '@aw/core';
import { collectionFields, collectionFormat, pageFields, SETTINGS_LABELS, settingsFields, type Field } from '@aw/content';
import type { CollectionId, ResolvedPreset } from '@aw/presets';

export const SVELTIA_VERSION = '0.248.0';

const CURRENCY_LABEL: Record<CurrencyCode, string> = { BHD: 'د.ب', KWD: 'د.ك', OMR: 'ر.ع', JOD: 'د.أ', SAR: 'ر.س', AED: 'د.إ', QAR: 'ر.ق', IQD: 'د.ع' };

const COLLECTION_LABELS: Record<Exclude<CollectionId, 'settings'>, { label: string; singular: string; summary: string }> = {
  products: { label: 'المنتجات', singular: 'منتج', summary: '{{title}} — {{price}}' },
  categories: { label: 'الأقسام', singular: 'قسم', summary: '{{title}}' },
  offers: { label: 'العروض', singular: 'عرض', summary: '{{title}}' },
  services: { label: 'الخدمات', singular: 'خدمة', summary: '{{title}} — {{durationMinutes}} دقيقة' },
  packages: { label: 'الباقات', singular: 'باقة', summary: '{{title}} — {{price}}' },
  addons: { label: 'الإضافات', singular: 'إضافة', summary: '{{title}} — {{price}}' },
  themes: { label: 'الثيمات', singular: 'ثيم', summary: '{{title}}' },
  resources: { label: 'الفريق والغرف', singular: 'عضو أو غرفة', summary: '{{id}}' },
  notes: { label: 'المكوّنات العطرية', singular: 'مكوّن', summary: '{{title}}' },
  wrappers: { label: 'تصاميم الأغلفة', singular: 'تصميم', summary: '{{title}}' },
  gallery: { label: 'معرض الصور', singular: 'صورة', summary: '{{caption}}' },
  reviews: { label: 'آراء العملاء (توضيحية)', singular: 'رأي', summary: '{{name}}' },
  faqs: { label: 'الأسئلة الشائعة', singular: 'سؤال', summary: '{{question}}' },
  branches: { label: 'الفروع', singular: 'فرع', summary: '{{title}}' },
  stockists: { label: 'نقاط البيع', singular: 'نقطة بيع', summary: '{{title}}' },
  pages: { label: 'الصفحات', singular: 'صفحة', summary: '{{title}}' },
};

export interface CmsOptions {
  /** GitHub "owner/repo". */
  repo: string;
  branch?: string;
  /** Repo-relative folder of the site ('sites/02-noha-modest'), or '' in an extracted client repo. */
  root: string;
  /** Display name for the admin title. */
  brandName: string;
  /** Size options from settings/sizes.json, so the product size picker lists the shop's real sizes. */
  sizeOptions?: Array<{ value: string; label: string }>;
  /** Monorepo demos skip CI on CMS commits to save build credits. */
  skipCi?: boolean;
  /** Per-collection editorial workflow (client repos). */
  editorialWorkflow?: boolean;
  target?: 'sveltia' | 'decap';
}

type Obj = Record<string, unknown>;

function hint(field: Field): Obj {
  return field.hint ? { hint: field.hint.ar } : {};
}

/** One field → a Sveltia widget definition. */
export function toWidget(field: Field, ctx: { currency: CurrencyCode; i18nCollection: boolean; sizeOptions?: CmsOptions['sizeOptions'] }): Obj {
  const base: Obj = { name: field.name, label: field.label.ar, ...hint(field) };
  if (ctx.i18nCollection) base.i18n = field.i18n ? true : false;
  const required = field.required ? (ctx.i18nCollection && field.i18n ? { required: ['ar'] } : {}) : { required: false };
  const cur = CURRENCIES[ctx.currency];
  switch (field.kind) {
    case 'string':
      return { ...base, widget: 'string', ...required, ...(field.pattern ? { pattern: [field.pattern[0], field.pattern[1].ar] } : {}), ...(field.default ? { default: field.default } : {}) };
    case 'text':
      return { ...base, widget: 'text', ...required };
    case 'markdown':
      return { ...base, widget: 'markdown', ...required, buttons: ['bold', 'italic', 'link', 'bulleted-list', 'numbered-list', 'heading-three'], editor_components: [] };
    case 'money':
      return {
        ...base,
        widget: 'number',
        value_type: 'float/string',
        step: cur.step / 10 ** cur.exponent,
        min: 0,
        after_input: CURRENCY_LABEL[ctx.currency],
        ...required,
        ...(field.hint ? {} : { hint: ctx.currency === 'IQD' ? 'بالدينار العراقي، بمضاعفات 250.' : `بالعملة المحلية، مثل ${cur.exponent === 3 ? '12.500' : '125.00'}.` }),
      };
    case 'number':
      return { ...base, widget: 'number', value_type: field.int ? 'int' : 'float', ...(field.min !== undefined ? { min: field.min } : {}), ...(field.max !== undefined ? { max: field.max } : {}), ...(field.step ? { step: field.step } : {}), ...(field.default !== undefined ? { default: field.default } : {}), ...required };
    case 'boolean':
      return { ...base, widget: 'boolean', default: field.default ?? false, required: false };
    case 'select': {
      const options = field.name === 'sizes' && field.options.length === 0 && ctx.sizeOptions ? ctx.sizeOptions : field.options.map((o) => ({ value: o.value, label: o.label.ar }));
      return { ...base, widget: 'select', options, ...(field.multiple ? { multiple: true } : {}), ...(field.default !== undefined ? { default: field.default } : {}), ...required };
    }
    case 'relation':
      return { ...base, widget: 'relation', collection: field.collection, value_field: '{{slug}}', search_fields: ['title'], display_fields: ['title'], ...(field.multiple ? { multiple: true } : {}), ...required };
    case 'image':
      return { ...base, widget: 'image', choose_url: false, ...required };
    case 'date':
      return { ...base, widget: 'datetime', type: 'date', format: 'YYYY-MM-DD', ...required };
    case 'time':
      return { ...base, widget: 'datetime', type: 'time', format: 'HH:mm', ...required };
    case 'hidden':
      return { name: field.name, widget: 'hidden', ...(field.default ? { default: field.default } : {}), ...(ctx.i18nCollection ? { i18n: false } : {}) };
    case 'color':
      return { ...base, widget: 'color', ...required };
    case 'i18nText': {
      const w = field.multiline ? 'text' : 'string';
      return { ...base, widget: 'object', fields: [{ name: 'ar', label: 'بالعربي', widget: w, ...(field.required ? {} : { required: false }) }, { name: 'en', label: 'بالإنجليزي', widget: w, required: false }] };
    }
    case 'list': {
      const sub = field.of === 'number' ? { widget: 'number', value_type: 'float' } : field.of === 'date' ? { widget: 'datetime', type: 'date', format: 'YYYY-MM-DD' } : { widget: 'string' };
      return { ...base, widget: 'list', field: { name: 'item', label: field.label.ar, ...sub }, required: false, ...(field.min ? { min: field.min } : {}), ...(field.max ? { max: field.max } : {}) };
    }
    case 'objects':
      return {
        ...base,
        widget: 'list',
        ...(field.summary ? { summary: field.summary } : {}),
        ...(field.min ? { min: field.min } : {}),
        ...(field.max ? { max: field.max } : {}),
        required: field.required ?? false,
        fields: field.fields.map((x) => toWidget(x, { ...ctx, i18nCollection: false })),
      };
    case 'object':
      return { ...base, widget: 'object', ...(field.collapsed ? { collapsed: true } : {}), required: field.required ?? false, fields: field.fields.map((x) => toWidget(x, { ...ctx, i18nCollection: false })) };
    case 'typed':
      return {
        ...base,
        widget: 'list',
        typeKey: 'type',
        required: false,
        types: field.types.map((t) => ({ name: t.name, label: t.label.ar, widget: 'object', summary: '{{fields.title.ar}}', fields: t.fields.map((x) => toWidget(x, { ...ctx, i18nCollection: false })) })),
      };
  }
}

export function buildCmsConfig(site: SiteConfig, r: ResolvedPreset, o: CmsOptions): Obj {
  const prefix = o.root ? `${o.root.replace(/\/$/, '')}/` : '';
  const currency = site.locale.currency;
  const collections: Obj[] = [];

  for (const id of r.collections) {
    if (id === 'settings') continue;
    const meta = COLLECTION_LABELS[id];
    const format = collectionFormat(id);
    const folder = `${prefix}src/content/${id}`;
    if (format === 'md') {
      collections.push({
        name: id,
        label: meta.label,
        label_singular: meta.singular,
        folder,
        path: '{{slug}}/index',
        extension: 'md',
        format: 'frontmatter',
        slug: '{{fields._slug}}',
        media_folder: '',
        public_folder: '',
        i18n: { structure: 'multiple_files' },
        summary: meta.summary,
        ...(o.editorialWorkflow ? { publish_mode: 'editorial_workflow' } : {}),
        fields: [
          { name: '_slug', label: 'رابط الصفحة (بالإنجليزي)', widget: 'string', i18n: false, hint: 'مثل shipping أو returns. لا يُغيَّر بعد النشر.' },
          ...pageFields.map((x) => toWidget(x, { currency, i18nCollection: true })),
          { name: 'body', label: 'المحتوى', widget: 'markdown', i18n: true, required: ['ar'] },
        ],
      });
      continue;
    }
    const plain = format === 'yaml-plain';
    const fields = collectionFields(id, r);
    collections.push({
      name: id,
      label: meta.label,
      label_singular: meta.singular,
      folder,
      path: '{{slug}}/index',
      extension: 'yml',
      format: 'yaml',
      create: true,
      slug: plain ? '{{fields.id}}' : fields.some((x) => x.name === '_slug') ? '{{fields._slug}}' : '{{uuid_short}}',
      media_folder: '',
      public_folder: '',
      i18n: !plain,
      summary: meta.summary,
      ...(id === 'products' || id === 'services' ? { sortable_fields: ['title', 'price', 'order'] } : {}),
      ...(o.editorialWorkflow && ['products', 'services', 'packages'].includes(id) ? { publish_mode: 'editorial_workflow' } : {}),
      fields: fields.map((x) => toWidget(x, { currency, i18nCollection: !plain, sizeOptions: o.sizeOptions })),
    });
  }

  collections.push({
    name: 'settings',
    label: 'الإعدادات',
    label_singular: 'إعداد',
    i18n: false,
    editor: { preview: false },
    files: r.settings.map((id) => ({
      name: id,
      label: SETTINGS_LABELS[id].ar,
      file: `${prefix}src/content/settings/${id}.json`,
      format: 'json',
      media_folder: 'media',
      public_folder: './media',
      fields: settingsFields(id, r.sections).map((x) => toWidget(x, { currency, i18nCollection: false })),
    })),
  });

  return {
    backend: { name: 'github', repo: o.repo, branch: o.branch ?? 'main', ...(o.skipCi ? { skip_ci: true } : {}) },
    site_url: site.deploy.url,
    display_url: site.deploy.url,
    logo_url: '/favicon.svg',
    app_title: `${o.brandName} · إدارة المحتوى`,
    media_folder: `${prefix}src/content/_uploads`,
    public_folder: '/_uploads',
    media_libraries: {
      all: {
        max_file_size: 8_000_000,
        slugify_filename: true,
        transformations: {
          raster_image: { format: 'webp', quality: 85, width: 2048, height: 2048 },
          heic: { format: 'webp', quality: 82, width: 1600, height: 1600 },
          svg: { optimize: true },
        },
      },
    },
    i18n: { structure: 'single_file', locales: ['ar', 'en'], default_locale: 'ar' },
    collections,
  };
}

export function cmsConfigYaml(config: Obj): string {
  return `# GENERATED by pnpm site:sync from @aw/content field definitions. Do not edit.\n${stringify(config, { lineWidth: 0 })}`;
}

/** The admin page: Arabic pre-seed before the pinned CMS script, plus a link to the orders dashboard on full sites. */
export function adminIndexHtml(opts: { brandName: string; ownerDashboard: boolean; version?: string }): string {
  const v = opts.version ?? SVELTIA_VERSION;
  const header = opts.ownerDashboard
    ? `\n  <div id="nc-root" style="display:none"></div>\n  <a href="/owner/" style="position:fixed;inset-block-end:16px;inset-inline-start:16px;z-index:9999;padding:10px 14px;background:#111;color:#fff;border-radius:8px;font:14px/1.2 system-ui;text-decoration:none">لوحة الطلبات</a>`
    : '';
  return `<!doctype html>
<!-- GENERATED by pnpm site:sync. Do not edit. -->
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>${opts.brandName} · إدارة المحتوى</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <script>
    // Open the CMS in Arabic by default (Sveltia ignores the locale option and follows the browser).
    try {
      var k = 'sveltia-cms.prefs', p = JSON.parse(localStorage.getItem(k) || '{}') || {};
      if (!p.locale || p.locale === 'auto') { p.locale = 'ar'; localStorage.setItem(k, JSON.stringify(p)); }
    } catch (e) {}
  </script>
</head>
<body>${header}
  <script src="https://unpkg.com/@sveltia/cms@${v}/dist/sveltia-cms.js"></script>
</body>
</html>
`;
}
export * from './validate.ts';
