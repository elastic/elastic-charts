/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { RgbTuple } from './color_library_wrappers';

function sRGBtoLin(colorChannel: number) {
  // Send this function a decimal sRGB gamma encoded color value
  // between 0.0 and 1.0, and it returns a linearized value.
  return colorChannel <= 0.03928 ? colorChannel / 12.92 : Math.pow((colorChannel + 0.055) / 1.055, 2.4);
}

function getLuminance([r, g, b]: RgbTuple) {
  const vR = r / 255;
  const vG = g / 255;
  const vB = b / 255;
  return 0.2126 * sRGBtoLin(vR) + 0.7152 * sRGBtoLin(vG) + 0.0722 * sRGBtoLin(vB);
}

/** @internal */
export function getWCAG2ContrastRatio(foreground: RgbTuple, background: RgbTuple) {
  const lumA = getLuminance(foreground);
  const lumB = getLuminance(background);

  return lumA >= lumB ? (lumA + 0.05) / (lumB + 0.05) : (lumB + 0.05) / (lumA + 0.05);
}
