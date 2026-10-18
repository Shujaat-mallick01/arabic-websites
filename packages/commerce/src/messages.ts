// Turns line issues into the exact, fix-it messages the forms show.

import type { Lang, LocalDate } from '@aw/core';
import type { Translator } from '@aw/i18n';
import type { LineIssue } from './pricing.ts';

export interface MessageFormatters {
  lang: Lang;
  date: (d: LocalDate) => string;
  num: (n: number) => string;
}

export function lineIssueMessage(issue: LineIssue, tr: Translator, f: MessageFormatters): string {
  const label = 'label' in issue ? issue.label[f.lang] : '';
  switch (issue.code) {
    case 'sold_out':
      return tr('product.soldOut');
    case 'choice_required':
      return tr('form.err.choose', { field: label });
    case 'text_required':
    case 'file_required':
      return tr('form.err.required', { field: label });
    case 'text_too_long':
      return tr('form.err.tooLong', { got: f.num(issue.got), max: f.num(issue.max), diff: f.num(issue.got - issue.max) });
    case 'date_required':
    case 'date_invalid':
      return tr('form.err.date');
    case 'date_too_soon':
      return tr('form.err.dateTooSoon', { date: f.date(issue.earliest) });
    case 'date_too_far':
      return tr('form.err.dateTooFar', { date: f.date(issue.latest) });
    case 'qty_min':
      return tr('form.err.minQty', { min: f.num(issue.min), diff: f.num(issue.diff) });
    case 'qty_step':
      return tr('form.err.step', { step: f.num(issue.step) });
    case 'qty_max':
      return tr('form.err.maxQty', { max: f.num(issue.max) });
    default:
      return tr('form.err.generic');
  }
}
