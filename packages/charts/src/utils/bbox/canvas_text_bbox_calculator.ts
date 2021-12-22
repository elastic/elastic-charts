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
export type TextMeasure = (text: string, font: Omit<Font, 'textColor'>, fontSize: number, lineHeight?: number) => Size;

/** @internal */
export const withTextMeasure = <T>(fun: (textMeasure: TextMeasure) => T) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  return fun(
    ctx
      ? (text, font, fontSize, lineHeight = 1) => {
          ctx.font = cssFontShorthand(font, fontSize);
          const { actualBoundingBoxLeft, actualBoundingBoxRight } = ctx.measureText(text);
          return { width: actualBoundingBoxLeft + actualBoundingBoxRight, height: fontSize * lineHeight };
        }
      : () => ({ width: 0, height: 0 }),
  );
};
