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
 * under the License.
 */

import { Datum } from '../../../../utils/commons';
import { ArrayEntry } from '../utils/group_by_rollup';

export const FONT_VARIANTS = Object.freeze(['normal', 'small-caps'] as const);
export type FontVariant = typeof FONT_VARIANTS[number];

export const FONT_WEIGHTS = Object.freeze([100, 200, 300, 400, 500, 600, 700, 800, 900, 'normal', 'bold', 'lighter', 'bolder', 'inherit', 'initial', 'unset'] as const);
export type FontWeight = typeof FONT_WEIGHTS[number];
export type NumericFontWeight = number & typeof FONT_WEIGHTS[number];

export const FONT_STYLES = Object.freeze(['normal', 'italic', 'oblique', 'inherit', 'initial', 'unset'] as const);
export type FontStyle = typeof FONT_STYLES[number];

/**
 * todo consider doing tighter control for permissible font families, eg. as in Kibana Canvas - expression language
 *  - though the same applies for permissible (eg. known available or loaded) font weights, styles, variants...
 */
export type FontFamily = string;

export interface Font {
  fontStyle: FontStyle;
  fontVariant: FontVariant;
  fontWeight: FontWeight;
  fontFamily: FontFamily;
  textColor: string;
  textOpacity: number;
}

export type PartialFont = Partial<Font>;

export const TEXT_ALIGNS = Object.freeze(['start', 'end', 'left', 'right', 'center'] as const);
export type TextAlign = typeof TEXT_ALIGNS[number];

export const TEXT_BASELINE = Object.freeze([
  'top',
  'hanging',
  'middle',
  'alphabetic',
  'ideographic',
  'bottom',
] as const);
export type TextBaseline = typeof TEXT_BASELINE[number];

export interface Box extends Font {
  text: string;
}
export type TextMeasure = (fontSize: number, boxes: Box[]) => TextMetrics[];

/**
 * Part-to-whole visualizations such as treemap, sunburst, pie hinge on an aggregation
 * function such that the value is independent of the order of how the constituents are aggregated
 * https://en.wikipedia.org/wiki/Associative_property
 * Hierarchical, space-filling part-to-whole visualizations also need that the
 * the value of a node is equal to the sum of the values of its children
 * https://mboehm7.github.io/teaching/ss19_dbs/04_RelationalAlgebra.pdf p21
 * It's now `count` and `sum` but subject to change
 */
export type AdditiveAggregation = 'count' | 'sum';

export type Relation = Array<Datum>;

export interface Origin {
  x0: number;
  y0: number;
}

export interface Rectangle extends Origin {
  x1: number;
  y1: number;
}

export interface Part extends Rectangle {
  node: ArrayEntry;
}
