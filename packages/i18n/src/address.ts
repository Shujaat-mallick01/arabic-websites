// Address fields as people in each country actually write them.

import type { CountryCode, I18nText } from '@aw/core';

export interface AddressField {
  id: string;
  label: I18nText;
  required: boolean;
  /** Short hint shown under the field. */
  hint?: I18nText;
  autocomplete?: string;
  inputmode?: 'text' | 'numeric';
  maxLength: number;
}

const f = (id: string, ar: string, en: string, required = true, extra: Partial<AddressField> = {}): AddressField => ({
  id,
  label: { ar, en },
  required,
  maxLength: 80,
  ...extra,
});

export const ADDRESS_FIELDS: Record<CountryCode, AddressField[]> = {
  BH: [
    f('area', 'المنطقة', 'Area', true, { autocomplete: 'address-level2' }),
    f('block', 'المجمع', 'Block', true, { inputmode: 'numeric', maxLength: 5 }),
    f('road', 'الطريق', 'Road', true, { maxLength: 40 }),
    f('building', 'المبنى / المنزل', 'Building / house', true, { maxLength: 20 }),
    f('flat', 'الشقة', 'Flat', false, { maxLength: 10 }),
  ],
  KW: [
    f('area', 'المنطقة', 'Area', true, { autocomplete: 'address-level2' }),
    f('block', 'القطعة', 'Block', true, { inputmode: 'numeric', maxLength: 5 }),
    f('street', 'الشارع', 'Street', true, { maxLength: 40 }),
    f('avenue', 'الجادة', 'Avenue', false, { maxLength: 20 }),
    f('house', 'المنزل / المبنى', 'House / building', true, { maxLength: 20 }),
  ],
  SA: [
    f('city', 'المدينة', 'City', true, { autocomplete: 'address-level2' }),
    f('district', 'الحي', 'District', true),
    f('street', 'الشارع', 'Street', true),
    f('building', 'رقم المبنى', 'Building number', true, { maxLength: 10 }),
    f('shortAddress', 'العنوان الوطني المختصر', 'Short national address', false, {
      maxLength: 8,
      hint: { ar: '٤ حروف و٤ أرقام، مثل RRRD2929 (اختياري)', en: '4 letters + 4 digits, e.g. RRRD2929 (optional)' },
    }),
  ],
  IQ: [
    f('governorate', 'المحافظة', 'Governorate', true, { autocomplete: 'address-level1' }),
    f('district', 'القضاء / المنطقة', 'District', true),
    f('neighbourhood', 'المحلة / الحي', 'Neighbourhood', true),
    f('landmark', 'أقرب نقطة دالة', 'Nearest landmark', true, {
      hint: { ar: 'مثل: قرب جامع أو مدرسة أو سوق معروف', en: 'e.g. next to a known mosque, school or market' },
    }),
    f('house', 'رقم الدار / الزقاق', 'House / alley', false, { maxLength: 30 }),
  ],
  AE: [f('emirate', 'الإمارة', 'Emirate'), f('area', 'المنطقة', 'Area'), f('street', 'الشارع', 'Street'), f('building', 'المبنى / الفيلا', 'Building / villa')],
  QA: [f('zone', 'المنطقة (Zone)', 'Zone', true, { inputmode: 'numeric', maxLength: 3 }), f('street', 'الشارع', 'Street', true, { maxLength: 5 }), f('building', 'المبنى', 'Building', true, { maxLength: 5 })],
  OM: [f('governorate', 'المحافظة', 'Governorate'), f('wilayat', 'الولاية', 'Wilayat'), f('area', 'المنطقة', 'Area'), f('house', 'رقم المنزل / الطريق', 'House / way', false)],
  JO: [f('city', 'المدينة', 'City'), f('area', 'المنطقة', 'Area'), f('street', 'الشارع', 'Street'), f('building', 'رقم البناية', 'Building number')],
};

/** Address for GCC shipping from another country: lighter, since couriers re-confirm by phone. */
export const SHIPPING_FIELDS: AddressField[] = [
  f('city', 'المدينة', 'City', true, { autocomplete: 'address-level2' }),
  f('line1', 'العنوان (المنطقة، الشارع، المبنى)', 'Address (area, street, building)', true, { autocomplete: 'street-address', maxLength: 160 }),
  f('postcode', 'الرمز البريدي', 'Postcode', false, { maxLength: 10, autocomplete: 'postal-code' }),
];

export function addressFields(country: CountryCode): AddressField[] {
  return ADDRESS_FIELDS[country];
}

/** One readable line for messages and packing slips. */
export function formatAddress(fields: AddressField[], values: Record<string, string>, lang: 'ar' | 'en'): string {
  return fields
    .filter((fl) => values[fl.id]?.trim())
    .map((fl) => `${fl.label[lang]} ${values[fl.id]!.trim()}`)
    .join(lang === 'ar' ? '، ' : ', ');
}
