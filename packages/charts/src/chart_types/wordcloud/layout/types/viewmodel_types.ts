/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Word as D3Word } from 'd3-cloud';
import type { $Values as Values } from 'utility-types';

import type { Color } from '../../../../common/colors';
import type { Pixels, PointObject } from '../../../../common/geometry';
import type { FontStyle } from '../../../../common/text_utils';

/** @public */
export interface WordModel {
  text: string;
  weight: number;
  color: Color;
}

/** @public */
export const WeightFn = Object.freeze({
  log: 'log' as const,
  linear: 'linear' as const,
  exponential: 'exponential' as const,
  squareRoot: 'squareRoot' as const,
});

/** @public */
export type WeightFn = Values<typeof WeightFn>;

/**
 * Word properties extends `D3Word` except for explicitly defined values.
 *
 * `D3Word` values are added datum via d3TagCloud, but may be undefined
 * @internal
 */
export interface Word extends D3Word {
  datum: WordModel;
  text: string;
  color: string;
  fontFamily: string;
  style: string;
  fontWeight: number;
  size: number;
}

/** @public */
export type OutOfRoomCallback = (wordCount: number, renderedWordCount: number, renderedWords: string[]) => void;

/** @public */
export interface WordcloudViewModel {
  startAngle: number;
  endAngle: number;
  angleCount: number;
  padding: number;
  fontWeight: number;
  fontFamily: string;
  fontStyle: FontStyle;
  minFontSize: number;
  maxFontSize: number;
  spiral: string;
  exponent: number;
  data: WordModel[];
  weightFn: WeightFn;
  outOfRoomCallback: OutOfRoomCallback;
}

/** @internal */
export interface Datum {
  text: string;
  weight: number;
  color: string;
}

/** @internal */
export type PickFunction = (x: Pixels, y: Pixels) => Array<WordcloudViewModel>;

/** @internal */
export type ShapeViewModel = {
  wordcloudViewModel: WordcloudViewModel;
  chartCenter: PointObject;
  pickQuads: PickFunction;
  specId: string;
};

const commonDefaults: WordcloudViewModel = {
  startAngle: -20,
  endAngle: 20,
  angleCount: 5,
  padding: 2,
  fontWeight: 300,
  fontFamily: 'Impact',
  fontStyle: 'italic',
  minFontSize: 10,
  maxFontSize: 50,
  spiral: 'archimedean',
  exponent: 3,
  data: [],
  weightFn: 'exponential',
  outOfRoomCallback: () => {},
};

/** @internal */
export const defaultWordcloudSpec = {
  ...commonDefaults,
};

/** @internal */
export const nullWordcloudViewModel: WordcloudViewModel = {
  ...commonDefaults,
  data: [],
};

/** @internal */
export const nullShapeViewModel = (): ShapeViewModel => ({
  wordcloudViewModel: nullWordcloudViewModel,
  chartCenter: { x: 0, y: 0 },
  pickQuads: () => [],
  specId: 'empty',
});
