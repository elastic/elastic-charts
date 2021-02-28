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

import { Pixels, PointObject } from '../../../../common/geometry';
import { SpecTypes } from '../../../../specs/constants';
import { Color } from '../../../../utils/common';
import { config } from '../config/config';
import { Config } from './config_types';

/** @internal */
export interface WordModel {
  text: string;
  weight: number;
  color: Color;
}

/** @internal */
export interface BulletViewModel {
  startAngle: number;
  endAngle: number;
  angleCount: number;
  padding: number;
  fontWeight: number;
  fontFamily: string;
  fontStyle: string;
  minFontSize: number;
  maxFontSize: number;
  spiral: string;
  exponent: number;
  data: WordModel[];
}

/** @internal */
export type PickFunction = (x: Pixels, y: Pixels) => Array<BulletViewModel>;

/** @internal */
export type ShapeViewModel = {
  config: Config;
  bulletViewModel: BulletViewModel;
  chartCenter: PointObject;
  pickQuads: PickFunction;
};

const commonDefaults = {
  specType: SpecTypes.Series,
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
};

/** @internal */
export const defaultWordcloudSpec = {
  ...commonDefaults,
};

/** @internal */
export const nullGoalViewModel = {
  ...commonDefaults,
  data: [],
};

/** @internal */
export const nullShapeViewModel = (specifiedConfig?: Config, chartCenter?: PointObject): ShapeViewModel => ({
  config: specifiedConfig || config,
  bulletViewModel: nullGoalViewModel,
  chartCenter: chartCenter || { x: 0, y: 0 },
  pickQuads: () => [],
});
