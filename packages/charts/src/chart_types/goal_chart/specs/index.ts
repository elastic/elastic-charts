/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentProps } from 'react';

import { ChartType } from '../..';
import { Color } from '../../../common/colors';
import { Spec } from '../../../specs';
import { SpecType } from '../../../specs/constants';
import { specComponentFactory } from '../../../state/spec_factory';
import { LabelAccessor, RecursivePartial } from '../../../utils/common';
import { Config } from '../layout/types/config_types';
import { defaultGoalSpec } from '../layout/types/viewmodel_types';
import { GoalSubtype } from './constants';

/** @alpha */
export interface BandFillColorAccessorInput {
  value: number;
  index: number;
  base: number;
  target?: number;
  highestValue: number;
  lowestValue: number;
  aboveBaseCount: number;
  belowBaseCount: number;
}

/** @alpha */
export type BandFillColorAccessor = (input: BandFillColorAccessorInput) => Color;

/** @alpha */
export type GoalLabelAccessor = LabelAccessor<BandFillColorAccessorInput>;

/** @alpha */
export interface GoalSpec extends Spec {
  specType: typeof SpecType.Series;
  chartType: typeof ChartType.Goal;
  subtype: GoalSubtype;
  base: number;
  target?: number;
  actual: number;
  bands: number[];
  ticks: number[];
  bandFillColor: BandFillColorAccessor;
  tickValueFormatter: GoalLabelAccessor;
  labelMajor: string | GoalLabelAccessor;
  labelMinor: string | GoalLabelAccessor;
  centralMajor: string | GoalLabelAccessor;
  centralMinor: string | GoalLabelAccessor;
  /**
   * @deprecated properties have been migrated to the theme or spec.
   * To be removed with partition, heatmap and wordmap configs.
   */
  config?: RecursivePartial<Config>;
  angleStart: number;
  angleEnd: number;
  bandLabels: string[];
}

/**
 * Add Goal spec to chart
 * @alpha
 */
export const Goal = specComponentFactory<GoalSpec>()(
  {
    specType: SpecType.Series,
    chartType: ChartType.Goal,
  },
  {
    ...defaultGoalSpec,
  },
);

/** @public */
export type GoalProps = ComponentProps<typeof Goal>;
