/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { $Values as Values } from 'utility-types';

import type { Color } from './colors';
import type { Pixels, Rectangle } from './geometry';
import type { ArrayEntry } from '../chart_types/partition_chart/layout/utils/group_by_rollup';
import { integerSnap, monotonicHillClimb } from '../solvers/monotonic_hill_climb';
import type { TextMeasure } from '../utils/bbox/canvas_text_bbox_calculator';
import type { Datum } from '../utils/common';

const FONT_WEIGHTS_NUMERIC = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
const FONT_WEIGHTS_ALPHA = ['normal', 'bold', 'lighter', 'bolder', 'inherit', 'initial', 'unset'] as const;

/**
 * todo consider doing tighter control for permissible font families, eg. as in Kibana Canvas - expression language
 *  - though the same applies for permissible (eg. known available or loaded) font weights, styles, variants...
 * @public
 */
export type FontFamily = string;
/** @public */
export const FONT_WEIGHTS = Object.freeze([...FONT_WEIGHTS_NUMERIC, ...FONT_WEIGHTS_ALPHA]);
/** @public */
export const FONT_VARIANTS = Object.freeze(['normal', 'small-caps'] as const);
/** @public */
export type FontVariant = (typeof FONT_VARIANTS)[number];
/** @public */
export type FontWeight = (typeof FONT_WEIGHTS)[number];
/** @public */
export const FONT_STYLES = Object.freeze(['normal', 'italic', 'oblique', 'inherit', 'initial', 'unset'] as const);
/** @public */
export type FontStyle = (typeof FONT_STYLES)[number];
/** @public */
export type PartialFont = Partial<Font>;
/** @public */
export const TEXT_ALIGNS = Object.freeze(['start', 'end', 'left', 'right', 'center'] as const);
/** @public */
export type TextAlign = (typeof TEXT_ALIGNS)[number];
/** @public */
export type TextBaseline = (typeof TEXT_BASELINE)[number];

/** @internal */
export type VerticalAlignments = Values<typeof VerticalAlignments>;
/** @internal */
export type Relation = Array<Datum>;

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
  isValue: boolean;
}

/** @internal */
export interface Part extends Rectangle {
  node: ArrayEntry;
}

/** @internal */
export function cssFontShorthand(
  { fontStyle, fontVariant, fontWeight, fontFamily }: Omit<Font, 'textColor'>,
  fontSize: Pixels,
) {
  return `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px ${fontFamily}`;
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
export const HorizontalAlignment = Object.freeze({
  left: 'left' as const,
  center: 'center' as const,
  right: 'right' as const,
});
/** @internal */
export type HorizontalAlignment = Values<typeof HorizontalAlignment>;

/** @internal */
export function measureOneBoxWidth(measure: TextMeasure, fontSize: number, box: Box) {
  return measure(box.text, box, fontSize).width;
}

/** @internal */
export function cutToLength(s: string, maxLength: number) {
  return s.length <= maxLength ? s : `${s.slice(0, Math.max(0, maxLength - 1))}…`; // ellipsis is one char
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
  const response = (v: number) => measure(desiredText.slice(0, Math.max(0, v)), font, fontSize).width;
  const visibleLength = monotonicHillClimb(response, desiredLength, allottedWidth, integerSnap);
  const text = visibleLength < 2 && desiredLength >= 2 ? '' : cutToLength(desiredText, visibleLength);
  const { width } = measure(text, font, fontSize);
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
    const { width } = measure(text, font, fontSize);
    const widthDiff = boxWidth - width;
    const heightDiff = boxHeight - fontSize;
    return -Math.min(widthDiff, heightDiff);
  };
  return monotonicHillClimb(response, maxFontSize, 0, integerSnap, minFontSize);
}
