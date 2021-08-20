/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { ChartType } from '../..';
import { Spec } from '../../../specs';
import { SpecType } from '../../../specs/constants';
import { getConnect, specComponentFactory } from '../../../state/spec_factory';
import { Color, LabelAccessor, RecursivePartial } from '../../../utils/common';
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

const defaultProps = {
  chartType: ChartType.Goal,
  ...defaultGoalSpec,
};

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
   * properties have been migrated to the theme or spec
   * @deprecated
   */
  config?: RecursivePartial<Config>;
  angleStart: number;
  angleEnd: number;
  bandLabels: string[];
}

type SpecRequiredProps = Pick<GoalSpec, 'id' | 'actual'>;
type SpecOptionalProps = Partial<Omit<GoalSpec, 'chartType' | 'specType' | 'id' | 'data'>>;

/** @alpha */
export const Goal: React.FunctionComponent<SpecRequiredProps & SpecOptionalProps> = getConnect()(
  specComponentFactory<
    GoalSpec,
    | 'chartType'
    | 'subtype'
    | 'base'
    | 'target'
    | 'actual'
    | 'bands'
    | 'bandLabels'
    | 'ticks'
    | 'bandFillColor'
    | 'tickValueFormatter'
    | 'labelMajor'
    | 'labelMinor'
    | 'centralMajor'
    | 'centralMinor'
    | 'angleStart'
    | 'angleEnd'
  >(defaultProps),
);
