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
import colorJS from 'color';

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

// /** @internal */
// function computeRelativeLuminosity(rgb: string) {
//   return colorJS(rgb).luminosity();
// }

/** @internal */
function computeContrast(rgb1: string, rgb2: string) {
  return colorJS(rgb1).contrast(colorJS(rgb2));
}

/** @internal */
export function colorIsDark(textColor: Color, bgColor: Color) {
  const currentContrast = computeContrast(textColor, bgColor);
  if (textColor === '#ffffff' || textColor === '#000000') {
    return currentContrast > 4.5 ? textColor : textColor === '#ffffff' ? '#000000' : '#ffffff';
  } else {
    const newTextColor =
      computeContrast(textColor, '#000000') > computeContrast(textColor, '#ffffff') ? '#ffffff' : '#000000';
    return currentContrast > 4.5 ? newTextColor : newTextColor === '#ffffff' ? '#000000' : '#ffffff';
  }
}
