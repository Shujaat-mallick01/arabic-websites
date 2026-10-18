// Picks the adapter by name. In mock mode every provider becomes MockProvider wearing that
// provider's capabilities, so demos show the right methods with no network calls.

import type { ProviderName } from '@aw/core';
import type { PaymentProvider, PaymentsMode, ProviderDeps, ProviderFactory } from './types.ts';
import { PaymentConfigError } from './util.ts';

const factories: Record<ProviderName, () => Promise<ProviderFactory>> = {
  mock: () => import('./adapters/mock.ts').then((m) => (deps: ProviderDeps) => m.createMockProvider(deps)),
  cod: () => import('./adapters/cod.ts').then((m) => m.createCodProvider),
  tap: () => import('./adapters/tap.ts').then((m) => m.createTapProvider),
  myfatoorah: () => import('./adapters/myfatoorah.ts').then((m) => m.createMyFatoorahProvider),
  moyasar: () => import('./adapters/moyasar.ts').then((m) => m.createMoyasarProvider),
  paytabs: () => import('./adapters/paytabs.ts').then((m) => m.createPayTabsProvider),
  checkout: () => import('./adapters/checkout.ts').then((m) => m.createCheckoutComProvider),
  credimax: () => import('./adapters/credimax.ts').then((m) => m.createCredimaxProvider),
  fastpay: () => import('./adapters/fastpay.ts').then((m) => m.createFastPayProvider),
  zaincash: () => import('./adapters/zaincash.ts').then((m) => m.createZainCashProvider),
};

export const providerNames = Object.keys(factories) as ProviderName[];

/** PAYMENTS_MODE: mock | test | live. Unset or unknown means mock. */
export function resolveMode(env: Readonly<Record<string, string | undefined>>): PaymentsMode {
  const m = env.PAYMENTS_MODE;
  return m === 'test' || m === 'live' ? m : 'mock';
}

export async function getProvider(name: ProviderName, deps: ProviderDeps): Promise<PaymentProvider> {
  if (name === 'cod') return (await factories.cod())(deps);
  if (deps.mode === 'mock' || name === 'mock') {
    const { createMockProvider } = await import('./adapters/mock.ts');
    return createMockProvider(deps, name);
  }
  const load = factories[name];
  if (!load) throw new PaymentConfigError(`Unknown payment provider "${name}"`);
  return (await load())(deps);
}
