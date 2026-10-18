// No-op-by-default analytics layer. Every event is dispatched as `aw:track` on window; an adapter
// forwards it to Plausible or GA4 when the site configures one. ?debug=analytics logs events.

export type AnalyticsEvent =
  | { name: 'whatsapp_click'; props: { context: string; itemId?: string } }
  | { name: 'add_to_cart'; props: { itemId: string; value: string; currency: string; qty: number } }
  | { name: 'begin_checkout'; props: { value: string; currency: string; items: number } }
  | { name: 'purchase'; props: { orderId: string; value: string; currency: string; method: string } }
  | { name: 'booking_submit'; props: { serviceId: string; tier: 'lite' | 'full'; deposit?: string } }
  | { name: 'share_product'; props: { itemId: string; channel: 'native' | 'whatsapp' | 'copy' } }
  | { name: 'lang_switch'; props: { to: string } };

declare global {
  interface Window {
    plausible?: (name: string, opts?: { props?: Record<string, unknown> }) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(e: AnalyticsEvent): void {
  try {
    window.dispatchEvent(new CustomEvent('aw:track', { detail: e }));
    if (new URLSearchParams(location.search).get('debug') === 'analytics') console.info('[aw:track]', e.name, e.props);
    const provider = document.documentElement.dataset.analytics;
    if (provider === 'plausible') window.plausible?.(e.name, { props: e.props });
    if (provider === 'ga4') window.gtag?.('event', e.name, e.props);
  } catch {
    /* analytics must never break the page */
  }
}

/** Declarative tracking for links: <a data-track="whatsapp" data-track-context="fab">. */
export function bindDeclarativeTracking(): void {
  document.addEventListener('click', (ev) => {
    const el = (ev.target as Element | null)?.closest<HTMLElement>('[data-track]');
    if (!el) return;
    if (el.dataset.track === 'whatsapp') {
      track({ name: 'whatsapp_click', props: { context: el.dataset.trackContext ?? 'link', ...(el.dataset.trackItem ? { itemId: el.dataset.trackItem } : {}) } });
    }
  });
}
