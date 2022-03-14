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
import { TAU } from '../../../common/constants';
import { Spec } from '../../../specs';
import { SpecType } from '../../../specs/constants';
import { buildSFProps, SFProps, useSpecFactory } from '../../../state/spec_factory';
import { LabelAccessor, round, stripUndefined, ValueFormatter } from '../../../utils/common';
import { Logger } from '../../../utils/logger';
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
  angleStart: number;
  angleEnd: number;
  bandLabels: string[];
  tooltipValueFormatter: ValueFormatter;
}

const buildProps = buildSFProps<GoalSpec>()(
  {
    specType: SpecType.Series,
    chartType: ChartType.Goal,
  },
  {
    ...defaultGoalSpec,
  },
);

/**
 * Add Goal spec to chart
 * @alpha
 */
export const Goal = function (
  props: SFProps<
    GoalSpec,
    keyof typeof buildProps['overrides'],
    keyof typeof buildProps['defaults'],
    keyof typeof buildProps['optionals'],
    keyof typeof buildProps['requires']
  >,
) {
  const { defaults, overrides } = buildProps;
  const angleStart = props.angleStart ?? defaults.angleStart;
  const angleEnd = props.angleEnd ?? defaults.angleEnd;
  const constraints: Pick<typeof props, 'angleEnd'> = {};

  if (Math.abs(angleEnd - angleStart) > TAU) {
    constraints.angleEnd = angleStart + TAU * Math.sign(angleEnd - angleStart);

    Logger.warn(`The total angle of the goal chart must not exceed 2π radians.\
To prevent overlapping, the value of \`angleEnd\` will be replaced.

  original: ${angleEnd} (~${round(angleEnd / Math.PI, 3)}π)
  replaced: ${constraints.angleEnd} (~${round(constraints.angleEnd / Math.PI, 3)}π)
`);
  }

  useSpecFactory<GoalSpec>({
    ...defaults,
    ...stripUndefined(props),
    ...overrides,
    ...constraints,
  });
  return null;
};

/** @public */
export type GoalProps = ComponentProps<typeof Goal>;
