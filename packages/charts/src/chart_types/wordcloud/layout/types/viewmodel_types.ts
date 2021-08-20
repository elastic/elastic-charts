/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { $Values as Values } from 'utility-types';

import { Color } from '../../../../common/color';
import { Pixels, PointObject, Rectangle } from '../../../../common/geometry';
import { FontStyle } from '../../../../common/text_utils';
import { config } from '../config/config';
import { Config } from './config_types';

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

/** @internal */
export interface Word extends Rectangle {
  color: string;
  font: string;
  fontFamily: string;
  fontWeight: number;
  hasText: boolean;
  height: number;
  padding: number;
  rotate: number;
  size: number;
  style: string;
  text: string;
  weight: number;
  x: number;
  xoff: number;
  y: number;
  yoff: number;
  datum: WordModel;
}

/** @public */
export interface Configs {
  count: number;
  endAngle: number;
  exponent: number;
  fontFamily: string;
  fontStyle: FontStyle;
  fontWeight: number;
  height: number;
  maxFontSize: number;
  minFontSize: number;
  padding: number;
  spiral: string;
  startAngle: number;
  weightFn: WeightFn;
  width: number;
}

/** @public */
export type OutOfRoomCallback = (wordCount: number, renderedWordCount: number, renderedWords: string[]) => void;

/** @internal */
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
  // specType: string;
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
  config: Config;
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
export const nullShapeViewModel = (specifiedConfig?: Config, chartCenter?: PointObject): ShapeViewModel => ({
  config: specifiedConfig || config,
  wordcloudViewModel: nullWordcloudViewModel,
  chartCenter: chartCenter || { x: 0, y: 0 },
  pickQuads: () => [],
  specId: 'empty',
});
