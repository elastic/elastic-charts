/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Font } from '../../common/text_utils';
import { cssFontShorthand } from '../../common/text_utils';
import { withContext } from '../../renderers/canvas';
import type { MeasureContext } from '../../renderers/measure';
import { getMeasureContext } from '../../renderers/measure';
import type { Size } from '../dimensions';

/** @internal */
export type TextMeasure = (text: string, font: Omit<Font, 'textColor'>, fontSize: number, lineHeight?: number) => Size;

function measureWith(
  ctx: MeasureContext,
  text: string,
  font: Omit<Font, 'textColor'>,
  fontSize: number,
  lineHeight: number,
): Size {
  if (text.length === 0) {
    return { width: 0, height: fontSize * lineHeight };
  }
  return withContext(ctx, (ctx): Size => {
    ctx.font = cssFontShorthand(font, fontSize);
    const { width } = ctx.measureText(text);
    return { width, height: fontSize * lineHeight };
  });
}

/** @internal */
export function measureText(ctx: MeasureContext): TextMeasure {
  return (text, font, fontSize, lineHeight = 1) => measureWith(ctx, text, font, fontSize, lineHeight);
}

// asks for the context on every call: layouts keep closures sharing scope with the measure, and
// those must not keep a canvas, with its text cache, alive
const measureOnSharedContext: TextMeasure = (text, font, fontSize, lineHeight = 1) => {
  const ctx = getMeasureContext();
  return ctx ? measureWith(ctx, text, font, fontSize, lineHeight) : { width: 0, height: 0 };
};

/** @internal */
export const withTextMeasure = <T>(fun: (textMeasure: TextMeasure) => T) => fun(measureOnSharedContext);
