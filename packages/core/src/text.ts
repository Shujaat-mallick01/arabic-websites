// Small text helpers that money, phone and form code all need.

const ARABIC_INDIC_ZERO = 0x0660; // ٠
const PERSIAN_ZERO = 0x06f0; // ۰

/**
 * Turns Arabic-Indic (٠-٩) and Persian (۰-۹) digits into ASCII digits,
 * and the Arabic decimal/thousands separators into '.' and ','.
 */
export function normaliseDigits(input: string): string {
  let out = '';
  for (const ch of input) {
    const code = ch.codePointAt(0)!;
    if (code >= ARABIC_INDIC_ZERO && code <= ARABIC_INDIC_ZERO + 9) out += String(code - ARABIC_INDIC_ZERO);
    else if (code >= PERSIAN_ZERO && code <= PERSIAN_ZERO + 9) out += String(code - PERSIAN_ZERO);
    else if (ch === '٫') out += '.'; // Arabic decimal separator
    else if (ch === '٬') out += ','; // Arabic thousands separator
    else out += ch;
  }
  return out;
}

/** Left-to-right mark. Put it before '+' phone numbers inside Arabic text. */
export const LRM = '‎';
/** First-strong isolate / pop directional isolate, for Latin runs inside Arabic. */
export const FSI = '⁨';
export const PDI = '⁩';

export function isolate(text: string): string {
  return `${FSI}${text}${PDI}`;
}
