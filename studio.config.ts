// Your studio identity, used by every demo and the hub (architecture D7).
// Every WhatsApp / phone button on a demo goes to YOUR number, never an invented one.

export interface StudioConfig {
  name: string;
  /** E.164. REPLACE the placeholder with your own WhatsApp number before deploying. */
  whatsapp: `+${string}`;
  email?: string;
  /** The hub site, linked from every demo's footer credit. */
  hubUrl: `https://${string}`;
  /** Credit line on demos and (optionally) live client sites. */
  credit: { ar: string; en: string };
  /** Whether the hub may be indexed by search engines. */
  hubIndexing: boolean;
}

const studio: StudioConfig = {
  name: 'Shujaat',
  // Placeholder: Bahraini numbers never start with 0, so this cannot reach a real person.
  whatsapp: '+97300000000',
  hubUrl: 'https://shujaat-portfolio.netlify.app',
  credit: { ar: 'نموذج مبدئي من إعداد Shujaat — تصميم وتطوير المواقع', en: 'A demo by Shujaat — web design and development' },
  hubIndexing: true,
};

export default studio;
