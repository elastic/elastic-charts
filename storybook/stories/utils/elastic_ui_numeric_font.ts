/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import './elastic_ui_numeric_font.scss';

export const ELASTIC_UI_NUMERIC_FONT_FAMILY = "'Elastic UI Numeric'";

type MutableRecord = Record<string, unknown>;

function isRecord(value: unknown): value is MutableRecord {
  return Object.prototype.toString.call(value) === '[object Object]';
}

export function prependNumericFontFamily(fontFamily: string) {
  return fontFamily.includes(ELASTIC_UI_NUMERIC_FONT_FAMILY)
    ? fontFamily
    : `${ELASTIC_UI_NUMERIC_FONT_FAMILY}, ${fontFamily}`;
}

export function withOptionalNumericFontFamily(fontFamily: string, enabled: boolean) {
  return enabled ? prependNumericFontFamily(fontFamily) : fontFamily;
}

export function applyNumericFontFamily(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(applyNumericFontFamily);
    return;
  }

  if (!isRecord(value)) return;

  for (const [key, entry] of Object.entries(value)) {
    if (key === 'fontFamily' && typeof entry === 'string') {
      value[key] = prependNumericFontFamily(entry);
      continue;
    }

    applyNumericFontFamily(entry);
  }
}

export function applyOptionalNumericFontFamily(value: unknown, enabled: boolean): void {
  if (!enabled) return;
  applyNumericFontFamily(value);
}
