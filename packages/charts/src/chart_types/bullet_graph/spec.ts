/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentProps } from 'react';
import { $Values } from 'utility-types';

import { ChartType } from '../../chart_types/index';
import { Spec } from '../../specs';
import { SpecType } from '../../specs/constants';
import { buildSFProps, SFProps, useSpecFactory } from '../../state/spec_factory';
import { stripUndefined } from '../../utils/common';

/** @internal */
export interface BulletDatum {
  title: string;
  subtitle?: string;
  value: number;
  valueFormatter: (value: number) => string;
  target?: number;
  domain: { min: number; max: number; nice: boolean };
  ticks: 'auto' | number[];
  tickFormatter: (value: number) => string;
}

/** @public */
export const BulletGraphSubtype = Object.freeze({
  vertical: 'vertical' as const,
  horizontal: 'horizontal' as const,
  angular: 'angular' as const,
});
/** @public */
export type BulletGraphSubtype = $Values<typeof BulletGraphSubtype>;

/** @alpha */
export interface BulletGraphSpec extends Spec {
  specType: typeof SpecType.Series;
  chartType: typeof ChartType.BulletGraph;
  data: (BulletDatum | undefined)[][];
  subtype: BulletGraphSubtype;
}

const defaultBulletGraph = {};

const buildProps = buildSFProps<BulletGraphSpec>()(
  {
    specType: SpecType.Series,
    chartType: ChartType.BulletGraph,
  },
  {
    ...defaultBulletGraph,
  },
);

/**
 * Add Goal spec to chart
 * @alpha
 */
export const BulletGraph = function (
  props: SFProps<
    BulletGraphSpec,
    keyof (typeof buildProps)['overrides'],
    keyof (typeof buildProps)['defaults'],
    keyof (typeof buildProps)['optionals'],
    keyof (typeof buildProps)['requires']
  >,
) {
  const { defaults, overrides } = buildProps;
  // const angleStart = props.angleStart ?? defaults.angleStart;
  // const angleEnd = props.angleEnd ?? defaults.angleEnd;
  const constraints = {};
  //
  //   if (Math.abs(angleEnd - angleStart) > TAU) {
  //     constraints.angleEnd = angleStart + TAU * Math.sign(angleEnd - angleStart);
  //
  //     Logger.warn(`The total angle of the goal chart must not exceed 2π radians.\
  // To prevent overlapping, the value of \`angleEnd\` will be replaced.
  //
  //   original: ${angleEnd} (~${round(angleEnd / Math.PI, 3)}π)
  //   replaced: ${constraints.angleEnd} (~${round(constraints.angleEnd / Math.PI, 3)}π)
  // `);
  //   }

  useSpecFactory<BulletGraphSpec>({
    ...defaults,
    ...stripUndefined(props),
    ...overrides,
    ...constraints,
  });
  return null;
};

/** @public */
export type BulletGraphProps = ComponentProps<typeof BulletGraph>;
