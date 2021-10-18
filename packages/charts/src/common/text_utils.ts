/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { $Values as Values } from 'utility-types';

import { ArrayEntry } from '../chart_types/partition_chart/layout/utils/group_by_rollup';
import { integerSnap, monotonicHillClimb } from '../solvers/monotonic_hill_climb';
import { Datum, isRTL } from '../utils/common';
import { Color } from './colors';
import { Pixels, Rectangle } from './geometry';

const FONT_WEIGHTS_NUMERIC = [100, 200, 300, 400, 500, 600, 700, 800, 900];
const FONT_WEIGHTS_ALPHA = ['normal', 'bold', 'lighter', 'bolder', 'inherit', 'initial', 'unset'];

/**
 * todo consider doing tighter control for permissible font families, eg. as in Kibana Canvas - expression language
 *  - though the same applies for permissible (eg. known available or loaded) font weights, styles, variants...
 * @public
 */
export type FontFamily = string;
/** @public */
export const FONT_WEIGHTS = Object.freeze([...FONT_WEIGHTS_NUMERIC, ...FONT_WEIGHTS_ALPHA] as const);
/** @public */
export const FONT_VARIANTS = Object.freeze(['normal', 'small-caps'] as const);
/** @public */
export type FontVariant = typeof FONT_VARIANTS[number];
/** @public */
export type FontWeight = typeof FONT_WEIGHTS[number];
/** @public */
export const FONT_STYLES = Object.freeze(['normal', 'italic', 'oblique', 'inherit', 'initial', 'unset'] as const);
/** @public */
export type FontStyle = typeof FONT_STYLES[number];
/** @public */
export type PartialFont = Partial<Font>;
/** @public */
export const TEXT_ALIGNS = Object.freeze(['start', 'end', 'left', 'right', 'center'] as const);
/** @public */
export type TextAlign = typeof TEXT_ALIGNS[number];
/** @public */
export type TextBaseline = typeof TEXT_BASELINE[number];

/** @internal */
export type VerticalAlignments = Values<typeof VerticalAlignments>;
/** @internal */
export type Relation = Array<Datum>;
/** @internal */
export type TextMeasure = (fontSize: number, boxes: Box[]) => TextMetrics[];

/**
 * this doesn't include the font size, so it's more like a font face (?) - unfortunately all vague terms
 * @public
 */
export interface Font {
  fontStyle: FontStyle;
  fontVariant: FontVariant;
  fontWeight: FontWeight;
  fontFamily: FontFamily;
  textColor: Color;
}

/** @public */
export const TEXT_BASELINE = Object.freeze([
  'top',
  'hanging',
  'middle',
  'alphabetic',
  'ideographic',
  'bottom',
] as const);

/** @internal */
export interface Box extends Font {
  text: string;
}

/** @internal */
export interface Part extends Rectangle {
  node: ArrayEntry;
}

/** @internal */
export function cssFontShorthand({ fontStyle, fontVariant, fontWeight, fontFamily }: Font, fontSize: Pixels) {
  return `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px ${fontFamily}`;
}

/** @internal */
export function measureText(ctx: CanvasRenderingContext2D): TextMeasure {
  return (fontSize: number, boxes: Box[]): TextMetrics[] =>
    boxes.map((box: Box) => {
      ctx.font = cssFontShorthand(box, fontSize);
      return ctx.measureText(box.text);
    });
}

/** @internal */
export const VerticalAlignments = Object.freeze({
  top: 'top' as const,
  middle: 'middle' as const,
  bottom: 'bottom' as const,
  alphabetic: 'alphabetic' as const,
  hanging: 'hanging' as const,
  ideographic: 'ideographic' as const,
});

/** @internal */
export function measureOneBoxWidth(measure: TextMeasure, fontSize: number, box: Box) {
  return measure(fontSize, [box])[0].width;
}

/** @internal */
export function cutToLength(s: string, maxLength: number) {
  const prefix = isRTL(s) ? '…' : ''; // ellipsis is one char
  const postfix = isRTL(s) ? '' : '…'; // ellipsis is one char
  return s.length <= maxLength ? s : `${prefix}${s.slice(0, Math.max(0, maxLength - 1))}${postfix}`;
}

/** @internal */
export function fitText(
  measure: TextMeasure,
  desiredText: string,
  allottedWidth: number,
  fontSize: number,
  font: Font,
) {
  const desiredLength = desiredText.length;
  const response = (v: number) => measure(fontSize, [{ ...font, text: desiredText.slice(0, Math.max(0, v)) }])[0].width;
  const visibleLength = monotonicHillClimb(response, desiredLength, allottedWidth, integerSnap);
  const text = visibleLength < 2 && desiredLength >= 2 ? '' : cutToLength(desiredText, visibleLength);
  const { width } = measure(fontSize, [{ ...font, text }])[0];
  return { width, text };
}

/** @internal */
export function maximiseFontSize(
  measure: TextMeasure,
  text: string,
  font: Font,
  minFontSize: Pixels,
  maxFontSize: Pixels,
  boxWidth: Pixels,
  boxHeight: Pixels,
): Pixels {
  const response = (fontSize: number) => {
    const [{ width }] = measure(fontSize, [{ text, ...font }]);
    const widthDiff = boxWidth - width;
    const heightDiff = boxHeight - fontSize;
    return -Math.min(widthDiff, heightDiff);
  };
  return monotonicHillClimb(response, maxFontSize, 0, integerSnap, minFontSize);
}
