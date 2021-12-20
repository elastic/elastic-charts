/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getGreensColorScale } from '../../../../common/color_library_wrappers';
import { Pixels, PointObject } from '../../../../common/geometry';
import { SpecType } from '../../../../specs/constants';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import { Theme } from '../../../../utils/themes/theme';
import { BandFillColorAccessorInput } from '../../specs';
import { GoalSubtype } from '../../specs/constants';

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
  angleStart: number;
  angleEnd: number;
}

/** @internal */
export type PickFunction = (x: Pixels, y: Pixels) => Array<BulletViewModel>;

/** @internal */
export type ShapeViewModel = {
  theme: Theme['goal'];
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
  bandFillColor: ({ value, highestValue, lowestValue }: BandFillColorAccessorInput) => {
    return getGreensColorScale(0.5, [highestValue, lowestValue])(value);
  },
  tickValueFormatter: ({ value }: BandFillColorAccessorInput) => String(value),
  labelMajor: ({ base }: BandFillColorAccessorInput) => String(base),
  labelMinor: () => 'unit',
  centralMajor: ({ base }: BandFillColorAccessorInput) => String(base),
  centralMinor: ({ target }: BandFillColorAccessorInput) => (target ? String(target) : ''),
  bandLabels: [],
  angleStart: Math.PI + Math.PI / 4,
  angleEnd: -Math.PI / 4,
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
  angleStart: 0,
  angleEnd: 0,
};

/** @internal */
export const nullShapeViewModel = ({ goal }: Theme = LIGHT_THEME): ShapeViewModel => ({
  theme: goal,
  bulletViewModel: nullGoalViewModel,
  chartCenter: { x: 0, y: 0 },
  pickQuads: () => [],
});
