/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentProps } from 'react';

import { GoalSubtype } from './constants';
import { Color } from '../../../common/colors';
import { TAU } from '../../../common/constants';
import { Spec } from '../../../specs/spec';
import { SpecType } from '../../../specs/spec_type';
import { SFProps } from '../../../state/build_props_types';
import { buildSFProps } from '../../../state/build_sf_props';
import { useSpecFactory } from '../../../state/spec_factory';
import { LabelAccessor, round, ValueFormatter } from '../../../utils/common';
import { Logger } from '../../../utils/logger';
import { stripUndefined } from '../../../utils/strip_undefined';
import { ChartType } from '../../chart_type';
import { defaultGoalSpec } from '../layout/types/viewmodel_types';

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
export interface GoalDomainRange {
  /**
   * A finite number to defined the lower bound of the domain. Defaults to 0 if _not_ finite.
   */
  min: number;
  /**
   * A finite number to defined the upper bound of the domain. Defaults to 1 if _not_ finite.
   */
  max: number;
}

/** @alpha */
export interface GoalSpec extends Spec {
  specType: typeof SpecType.Series;
  chartType: typeof ChartType.Goal;
  subtype: GoalSubtype;
  base: number;
  target?: number;
  actual: number;
  /**
   * array of discrete band intervals or approximate number of desired bands
   */
  bands?: number | number[];
  /**
   * Array of discrete tick values or approximate number of desired ticks
   */
  ticks?: number | number[];
  /**
   * Domain of goal charts. Limits every value to within domain.
   */
  domain: GoalDomainRange;
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
 * @deprecated please use `Bullet` spec instead
 * @alpha
 */
export const Goal = function (
  props: SFProps<
    GoalSpec,
    keyof (typeof buildProps)['overrides'],
    keyof (typeof buildProps)['defaults'],
    keyof (typeof buildProps)['optionals'],
    keyof (typeof buildProps)['requires']
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
