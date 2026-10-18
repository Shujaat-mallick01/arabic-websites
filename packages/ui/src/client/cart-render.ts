// Renders cart lines as HTML (drawer and cart page). All text is escaped.

import type { CartLineStored } from './cart.ts';
import { escapeHtml, money, num, siteBlob, str } from './runtime.ts';

export function renderLines(container: HTMLElement, lines: CartLineStored[]) {
  const lang = siteBlob().lang;
  container.innerHTML = lines
    .map((l) => {
      const opts = l.labels.map((x) => `${escapeHtml(x.label[lang] || x.label.ar)}: ${escapeHtml(x.value[lang] || x.value.ar)}`).join(' · ');
      const title = escapeHtml(l.title[lang] || l.title.ar);
      return `<div class="flex gap-3 py-4 border-b border-line" data-key="${escapeHtml(l.key)}">
        ${l.image ? `<img src="${escapeHtml(l.image)}" alt="" width="72" height="96" loading="lazy" class="w-[72px] h-[96px] object-cover rounded-image bg-bg shrink-0">` : ''}
        <div class="flex-1 min-w-0 flex flex-col gap-1">
          <a href="${escapeHtml(lang === 'en' ? `/en/products/${l.slug}/` : `/products/${l.slug}/`)}" class="no-underline text-body leading-snug">${title}</a>
          ${opts ? `<p class="m-0 text-small text-muted">${opts}</p>` : ''}
          <div class="flex items-center justify-between gap-2 mt-auto">
            <div class="inline-flex items-center border border-muted rounded-control">
              <button type="button" class="tap inline-flex items-center justify-center bg-transparent border-0 cursor-pointer text-ink" data-dec aria-label="${escapeHtml(str('product.decrease'))}">−</button>
              <span class="min-w-8 text-center tabular" aria-live="polite">${num(l.qty)}</span>
              <button type="button" class="tap inline-flex items-center justify-center bg-transparent border-0 cursor-pointer text-ink" data-inc aria-label="${escapeHtml(str('product.increase'))}">+</button>
            </div>
            <span class="price">${money(l.total)}</span>
          </div>
        </div>
        <button type="button" class="tap self-start -me-2 inline-flex items-center justify-center bg-transparent border-0 cursor-pointer text-muted" data-remove aria-label="${escapeHtml(str('cart.removeItem', { title: l.title[lang] || l.title.ar }))}">✕</button>
      </div>`;
    })
    .join('');
}
