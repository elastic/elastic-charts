/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Pixels, PointObject } from '../../../../common/geometry';
import { SpecType } from '../../../../specs/constants';
import { BandFillColorAccessorInput } from '../../specs';
import { GoalSubtype } from '../../specs/constants';
import { config } from '../config/config';
import { Config } from './config_types';

/** @internal */
export interface BandViewModel {
  value: number;
  fillColor: string;
  text: string[];
}

interface TickViewModel {
  value: number;
  text: string;
}

/** @internal */
export interface BulletViewModel {
  subtype: string;
  base: number;
  target?: number;
  actual: number;
  bands: Array<BandViewModel>;
  ticks: Array<TickViewModel>;
  labelMajor: string;
  labelMinor: string;
  centralMajor: string;
  centralMinor: string;
  highestValue: number;
  lowestValue: number;
  aboveBaseCount: number;
  belowBaseCount: number;
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
  specType: SpecType.Series,
  subtype: GoalSubtype.Goal,
  base: 0,
  actual: 50,
  ticks: [0, 25, 50, 75, 100],
};

/** @internal */
export const defaultGoalSpec = {
  ...commonDefaults,
  bands: [50, 75, 100],
  bandFillColor: ({ value, base, highestValue, lowestValue }: BandFillColorAccessorInput) => {
    const aboveBase = value > base;
    const ratio = aboveBase
      ? (value - base) / (Math.max(base, highestValue) - base)
      : (value - base) / (Math.min(base, lowestValue) - base);
    const level = Math.round(255 * ratio);
    return aboveBase ? `rgb(0, ${level}, 0)` : `rgb( ${level}, 0, 0)`;
  },
  tickValueFormatter: ({ value }: BandFillColorAccessorInput) => String(value),
  labelMajor: ({ base }: BandFillColorAccessorInput) => String(base),
  // eslint-disable-next-line no-empty-pattern
  labelMinor: ({}: BandFillColorAccessorInput) => 'unit',
  centralMajor: ({ base }: BandFillColorAccessorInput) => String(base),
  centralMinor: ({ target }: BandFillColorAccessorInput) => (target ? String(target) : ''),
  bandLabels: [],
};

/** @internal */
export const nullGoalViewModel = {
  ...commonDefaults,
  bands: [],
  ticks: [],
  labelMajor: '',
  labelMinor: '',
  centralMajor: '',
  centralMinor: '',
  highestValue: 100,
  lowestValue: 0,
  aboveBaseCount: 0,
  belowBaseCount: 0,
};

/** @internal */
export const nullShapeViewModel = (specifiedConfig?: Config, chartCenter?: PointObject): ShapeViewModel => ({
  config: specifiedConfig || config,
  bulletViewModel: nullGoalViewModel,
  chartCenter: chartCenter || { x: 0, y: 0 },
  pickQuads: () => [],
});
