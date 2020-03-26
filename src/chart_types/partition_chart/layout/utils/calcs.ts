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
import { RgbTuple, stringToRGB } from './d3_utils';
import { Color } from '../../../../utils/commons';
import { DARK_THEME } from '../../../../utils/themes/dark_theme';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
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

/** @internal */
function computeRelativeLuminosity(rgb: string) {
  return colorJS(rgb).luminosity();
}

/** @internal */
function computeContrast(rgb1: string, rgb2: string) {
  return colorJS(rgb1).contrast(colorJS(rgb2));
}

/** @internal */
function getAAARelativeLum(bgColor: string, fgColor: string, ratio = 7) {
  const relLum1 = computeRelativeLuminosity(bgColor);
  const relLum2 = computeRelativeLuminosity(fgColor);
  if (relLum1 > relLum2) {
    // relLum1 is brighter, relLum2 is darker
    return (relLum1 + 0.05 - ratio * 0.05) / ratio;
  } else {
    // relLum1 is darker, relLum2 is brighter
    return Math.min(ratio * (relLum1 + 0.05) - 0.05, 1);
  }
}

/** @internal */
function getGrayFromRelLum(relLum: number) {
  if (relLum <= 0.0031308) {
    return relLum * 12.92;
  } else {
    return (1.0 + 0.055) * Math.pow(relLum, 1.0 / 2.4) - 0.055;
  }
}

/** @internal */
function getGrayRGBfromGray(gray: number) {
  const g = Math.round(gray * 255);
  return `rgb(${g},${g},${g})`;
}

/** @internal */
function getAAAGray(bgColor: string, fgColor: string, ratio = 7) {
  const relLum = getAAARelativeLum(bgColor, fgColor, ratio);
  const gray = getGrayFromRelLum(relLum);
  return getGrayRGBfromGray(gray);
}

/** @internal */
function findBestContrastColor(bgColor: string, lightFgColor: string, darkFgColor: string, ratio = 4.5) {
  const lc = computeContrast(bgColor, lightFgColor);
  const dc = computeContrast(bgColor, darkFgColor);
  if (lc >= dc) {
    if (lc >= ratio) {
      return lightFgColor;
    }
    return getAAAGray(bgColor, lightFgColor, ratio);
  }
  if (dc >= ratio) {
    return darkFgColor;
  }
  return getAAAGray(bgColor, darkFgColor, ratio);
}

/** @internal */
export function colorIsDark(bgColor: Color) {
  const color = findBestContrastColor(
    bgColor,
    LIGHT_THEME.axes.axisTitleStyle.fill,
    DARK_THEME.axes.axisTitleStyle.fill,
  );
  return stringToRGB(color);
  // fixme this assumes a white or very light background
  // const rgba = stringToRGB(color);
  // const { r, g, b, opacity } = rgba;
  // const a = rgba.hasOwnProperty('opacity') ? opacity : 1;
  // return r * 0.299 + g * 0.587 + b * 0.114 < a * 150;
}

/** @internal */
export function getChartClasses(bgColor?: string) {
  if (typeof bgColor !== 'string') {
    return;
  }
  const bgLuminosity = computeRelativeLuminosity(bgColor);
  return bgLuminosity <= 0.179 ? DARK_THEME : LIGHT_THEME;
}
