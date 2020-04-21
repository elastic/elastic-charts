/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License. */

import { Ratio } from '../types/geometry_types';
import { RgbTuple } from './d3_utils';
import { Color } from '../../../../utils/commons';
import chroma from 'chroma-js';

/** @internal */
export function hueInterpolator(colors: RgbTuple[]) {
  return (d: number) => {
    const index = Math.round(d * 255);
    const [r, g, b, a] = colors[index];
    return colors[index].length === 3 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`;
  };
}

/** @internal */
export function addOpacity(hexColorString: string, opacity: Ratio) {
  // this is a super imperfect multiplicative alpha blender that assumes a "#rrggbb" or "#rrggbbaa" hexColorString
  // todo roll some proper utility that can handle "rgb(...)", "rgba(...)", "red", {r, g, b} etc.
  return opacity === 1
    ? hexColorString
    : hexColorString.slice(0, 7) +
        (hexColorString.slice(7).length === 0 || parseInt(hexColorString.slice(7, 2), 16) === 255
          ? `00${Math.round(opacity * 255).toString(16)}`.substr(-2) // color was of full opacity
          : `00${Math.round((parseInt(hexColorString.slice(7, 2), 16) / 255) * opacity * 255).toString(16)}`.substr(
              -2,
            ));
}

/** @internal */
export function arrayToLookup(keyFun: Function, array: Array<any>) {
  return Object.assign({}, ...array.map((d) => ({ [keyFun(d)]: d })));
}

/** @internal */
function convertRGBAStringToSeparateValues(rgba: Color) {
  const [red1, green1, blue1, alpha1 = 1] = rgba
    .replace(/[^\d.,]/g, '')
    .split(',')
    .map((x) => parseFloat(x));
  return { red: red1, green: green1, blue: blue1, alpha: alpha1 };
}

/** If the user specifies the background of the container in which the chart will be on, we can use that color
 * and make sure to provide optimal contrast
/** @internal */
export function getBackgroundWithContainerColorFromUser(rgba1: Color, rgba2: Color) {
  const alpha1 = convertRGBAStringToSeparateValues(rgba1).alpha;
  const alpha2 = convertRGBAStringToSeparateValues(rgba2).alpha;
  const combineAlpha = alpha1 + alpha2 * (1 - alpha2);

  if (combineAlpha < 0.7) {
    return chroma.mix(rgba1, rgba2, combineAlpha).rgba();
  } else {
    return chroma.blend(rgba1, rgba2, 'multiply').rgba();
  }
}

// /** @internal */
// export function colorIsDark(textColor: Color, bgColor: Color) {
//   const currentContrast = chroma.contrast(textColor, bgColor);
//   const otherTextColor = textColor === '#000000' ? '#ffffff' : '#000000';
//   const otherContrast = chroma.contrast(otherTextColor, bgColor);
//   return currentContrast > otherContrast ? textColor : otherTextColor;
// }

/**
 * make a high contrast text color in cases black and white can't reach 4.5
 * @internal
 */
export function makeHighContrastColor(foreground: Color, background: Color, ratio = 4.5) {
  let contrast = chroma.contrast(foreground, background);
  // determine the lightness factor of the color to determine whether to shade or tint the foreground
  const brightness = chroma(background).luminance();

  let highContrastTextColor = foreground as string;
  while (contrast < ratio) {
    if (brightness > 50) {
      highContrastTextColor = chroma(highContrastTextColor)
        .darken()
        .toString();
    } else {
      highContrastTextColor = chroma(highContrastTextColor)
        .brighten()
        .toString();
    }
    contrast = chroma.contrast(highContrastTextColor, background);
  }
  return highContrastTextColor.toString();
}
