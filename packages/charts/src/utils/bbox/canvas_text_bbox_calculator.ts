/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { cssFontShorthand, Font } from '../../common/text_utils';
import { Size } from '../dimensions';

/** @internal */
export const withTextMeasure = <T>(fun: (textMeasure: TextMeasure) => T) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  return fun(ctx ? measureText(ctx) : () => ({ width: 0, height: 0 }));
};

/** @internal */
export type TextMeasure = (text: string, font: Omit<Font, 'textColor'>, fontSize: number, lineHeight?: number) => Size;

/** @internal */
export function measureText(ctx: CanvasRenderingContext2D): TextMeasure {
  return (text, font, fontSize, lineHeight = 1) => {
    if (text.length === 0) {
      // TODO this is a temporary fix to make the multilayer time axis work
      return { width: 0, height: fontSize * lineHeight };
    }
    ctx.font = cssFontShorthand(font, fontSize * 2);
    const { width } = ctx.measureText(text);
    return { width: width / 2, height: fontSize * lineHeight };
  };
}
