// Seed lists for delivery zones. Owners edit fees and switch zones on or off; the ids and names come from here.

import type { CountryCode, I18nText } from '@aw/core';

export interface ZoneSeed {
  id: string;
  name: I18nText;
}

const z = (id: string, ar: string, en: string): ZoneSeed => ({ id, name: { ar, en } });

export const BH_GOVERNORATES: ZoneSeed[] = [
  z('capital', 'محافظة العاصمة', 'Capital'),
  z('muharraq', 'محافظة المحرق', 'Muharraq'),
  z('northern', 'المحافظة الشمالية', 'Northern'),
  z('southern', 'المحافظة الجنوبية', 'Southern'),
];

export const KW_GOVERNORATES: ZoneSeed[] = [
  z('capital', 'العاصمة', 'Capital'),
  z('hawalli', 'حولي', 'Hawalli'),
  z('farwaniya', 'الفروانية', 'Farwaniya'),
  z('mubarak-al-kabeer', 'مبارك الكبير', 'Mubarak Al-Kabeer'),
  z('ahmadi', 'الأحمدي', 'Ahmadi'),
  z('jahra', 'الجهراء', 'Jahra'),
];

export const IQ_GOVERNORATES: ZoneSeed[] = [
  z('baghdad', 'بغداد', 'Baghdad'),
  z('basra', 'البصرة', 'Basra'),
  z('nineveh', 'نينوى', 'Nineveh'),
  z('erbil', 'أربيل', 'Erbil'),
  z('sulaymaniyah', 'السليمانية', 'Sulaymaniyah'),
  z('duhok', 'دهوك', 'Duhok'),
  z('kirkuk', 'كركوك', 'Kirkuk'),
  z('anbar', 'الأنبار', 'Anbar'),
  z('babil', 'بابل', 'Babil'),
  z('karbala', 'كربلاء', 'Karbala'),
  z('najaf', 'النجف', 'Najaf'),
  z('diyala', 'ديالى', 'Diyala'),
  z('wasit', 'واسط', 'Wasit'),
  z('dhi-qar', 'ذي قار', 'Dhi Qar'),
  z('maysan', 'ميسان', 'Maysan'),
  z('muthanna', 'المثنى', 'Muthanna'),
  z('qadisiyyah', 'القادسية', 'Qadisiyyah'),
  z('salah-al-din', 'صلاح الدين', 'Salah al-Din'),
  z('halabja', 'حلبجة', 'Halabja'),
];

export const JEDDAH_DISTRICTS: ZoneSeed[] = [
  z('al-rawdah', 'الروضة', 'Al Rawdah'),
  z('al-salamah', 'السلامة', 'Al Salamah'),
  z('al-zahra', 'الزهراء', 'Al Zahra'),
  z('al-nahda', 'النهضة', 'Al Nahda'),
  z('al-andalus', 'الأندلس', 'Al Andalus'),
  z('al-shati', 'الشاطئ', 'Al Shati'),
  z('obhur-north', 'أبحر الشمالية', 'Obhur North'),
  z('al-hamra', 'الحمراء', 'Al Hamra'),
  z('al-rehab', 'الرحاب', 'Al Rehab'),
  z('al-safa', 'الصفا', 'Al Safa'),
  z('al-marwah', 'المروة', 'Al Marwah'),
  z('al-naeem', 'النعيم', 'Al Naeem'),
  z('al-faisaliyah', 'الفيصلية', 'Al Faisaliyah'),
  z('al-aziziyah', 'العزيزية', 'Al Aziziyah'),
  z('al-baghdadiyah', 'البغدادية', 'Al Baghdadiyah'),
  z('al-balad', 'البلد', 'Al Balad'),
  z('al-khalidiyah', 'الخالدية', 'Al Khalidiyah'),
  z('al-muhammadiyah', 'المحمدية', 'Al Muhammadiyah'),
  z('al-basateen', 'البساتين', 'Al Basateen'),
  z('al-sharafeyah', 'الشرفية', 'Al Sharafeyah'),
];

export const RIYADH_DISTRICTS: ZoneSeed[] = [
  z('al-malqa', 'الملقا', 'Al Malqa'),
  z('al-yasmin', 'الياسمين', 'Al Yasmin'),
  z('al-narjis', 'النرجس', 'Al Narjis'),
  z('hittin', 'حطين', 'Hittin'),
  z('al-olaya', 'العليا', 'Al Olaya'),
  z('al-sulimaniyah', 'السليمانية', 'Al Sulimaniyah'),
  z('al-wurud', 'الورود', 'Al Wurud'),
  z('al-nakheel', 'النخيل', 'Al Nakheel'),
  z('al-rawdah', 'الروضة', 'Al Rawdah'),
  z('al-sahafa', 'الصحافة', 'Al Sahafa'),
  z('al-aqiq', 'العقيق', 'Al Aqiq'),
  z('al-ghadir', 'الغدير', 'Al Ghadir'),
  z('al-murooj', 'المروج', 'Al Murooj'),
  z('al-nuzha', 'النزهة', 'Al Nuzha'),
  z('qurtubah', 'قرطبة', 'Qurtubah'),
  z('al-hamra', 'الحمراء', 'Al Hamra'),
  z('al-rabwah', 'الربوة', 'Al Rabwah'),
  z('al-falah', 'الفلاح', 'Al Falah'),
];

export type ZoneSeedListId = 'bh-governorates' | 'kw-governorates' | 'iq-governorates' | 'jeddah-districts' | 'riyadh-districts';

export const ZONE_SEEDS: Record<ZoneSeedListId, ZoneSeed[]> = {
  'bh-governorates': BH_GOVERNORATES,
  'kw-governorates': KW_GOVERNORATES,
  'iq-governorates': IQ_GOVERNORATES,
  'jeddah-districts': JEDDAH_DISTRICTS,
  'riyadh-districts': RIYADH_DISTRICTS,
};

export const DEFAULT_SEED_BY_COUNTRY: Partial<Record<CountryCode, ZoneSeedListId>> = {
  BH: 'bh-governorates',
  KW: 'kw-governorates',
  IQ: 'iq-governorates',
  SA: 'riyadh-districts',
};

/** Name of a seeded zone id, searching all lists of a country. */
export function zoneName(id: string, lists: ZoneSeedListId[]): I18nText | undefined {
  for (const l of lists) {
    const hit = ZONE_SEEDS[l].find((s) => s.id === id);
    if (hit) return hit.name;
  }
  return undefined;
}
