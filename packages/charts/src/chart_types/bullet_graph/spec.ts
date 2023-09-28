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
import { stripUndefined, ValueFormatter } from '../../utils/common';

/** @public */
export interface BulletDatum {
  title: string;
  subtitle?: string;
  value: number;
  target?: number;
  domain: { min: number; max: number; nice: boolean };
  reverse?: boolean;
  ticks: 'auto' | number[];
  syncCursor?: boolean;
  valueFormatter: ValueFormatter;
  targetFormatter?: ValueFormatter;
  tickFormatter: ValueFormatter;
}

/** @public */
export const BulletGraphSubtype = Object.freeze({
  vertical: 'vertical' as const,
  horizontal: 'horizontal' as const,
  angular: 'angular' as const,
});
/** @public */
export type BulletGraphSubtype = $Values<typeof BulletGraphSubtype>;

/** @public */
export const BulletGraphSize = Object.freeze({
  full: 'full' as const, // need to address label overlapping
  half: 'half' as const,
  twoThirds: 'two-thirds' as const,
});
/** @public */
export type BulletGraphSize = $Values<typeof BulletGraphSize>;

/** @alpha */
export interface BulletGraphSpec extends Spec {
  specType: typeof SpecType.Series;
  chartType: typeof ChartType.BulletGraph;
  data: (BulletDatum | undefined)[][];
  subtype: BulletGraphSubtype;
  /**
   * Size options of chart for angular subType only
   */
  size: BulletGraphSize;
  tickSnapStep?: number;
}

const buildProps = buildSFProps<BulletGraphSpec>()(
  {
    specType: SpecType.Series,
    chartType: ChartType.BulletGraph,
  },
  {
    size: BulletGraphSize.twoThirds,
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
  const constraints = {};

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
