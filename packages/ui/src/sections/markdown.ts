// A small, safe Markdown renderer for owner-written fields inside YAML (descriptions, FAQ answers).
// HTML is escaped first; only paragraphs, line breaks, ### headings, lists, **bold**, *italic*
// and [links](url) with http(s)/mailto/relative targets are produced.

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function inline(s: string): string {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text: string, url: string) => {
      const ok = /^(https?:\/\/|mailto:|\/|#)/.test(url);
      return ok ? `<a href="${url}"${/^https?:/.test(url) ? ' rel="noopener"' : ''}>${text}</a>` : text;
    });
}

export function marked(src: string | undefined): string {
  if (!src) return '';
  const blocks = src.replace(/\r\n?/g, '\n').trim().split(/\n{2,}/);
  return blocks
    .map((b) => {
      const lines = b.split('\n');
      if (lines.every((l) => /^\s*[-*•]\s+/.test(l))) return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*•]\s+/, ''))}</li>`).join('')}</ul>`;
      if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) return `<ol>${lines.map((l) => `<li>${inline(l.replace(/^\s*\d+[.)]\s+/, ''))}</li>`).join('')}</ol>`;
      const h = /^(#{2,4})\s+(.*)$/.exec(b);
      if (h && lines.length === 1) return `<h${Math.min(h[1]!.length, 4)}>${inline(h[2]!)}</h${Math.min(h[1]!.length, 4)}>`;
      return `<p>${lines.map(inline).join('<br>')}</p>`;
    })
    .join('');
}
