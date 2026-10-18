// Headings can mark one phrase for the accent treatment with *asterisks*:
//   "أزياء *تحكي* عنك" → أزياء <span class="aw-hl">تحكي</span> عنك
// Everything else is escaped, so CMS text can never inject markup.

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ESC[c]!);
}

export function hl(text: string | undefined | null): string {
  if (!text) return '';
  return escapeHtml(text).replace(/\*([^*]+)\*/g, '<span class="aw-hl">$1</span>');
}

/** The same text without the markers (for aria labels, meta titles and alt text). */
export function plain(text: string | undefined | null): string {
  return (text ?? '').replace(/\*([^*]+)\*/g, '$1');
}
