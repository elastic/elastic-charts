/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentProps } from 'react';
import { $Values, Optional } from 'utility-types';

import { BulletColorConfig } from './utils/color';
import { ChartType } from '../../chart_types/index';
import { Spec } from '../../specs';
import { SpecType } from '../../specs/constants';
import { buildSFProps, SFProps, useSpecFactory } from '../../state/spec_factory';
import { mergePartial, stripUndefined, ValueFormatter } from '../../utils/common';
import { GenericDomain } from '../../utils/domain';

/** @public */
export interface BulletDatum {
  title: string;
  subtitle?: string;
  value: number;
  target?: number;
  domain: GenericDomain;
  niceDomain?: boolean;
  /**
   * Approximate number of ticks to be returned. Must be greater than 0.
   *
   * Or
   *
   * Function that returns the exact ticks to use, this if you pass bad ticks we will not be able to help you!
   * Sort order must match the direction of the domain.
   *
   * Defaults to auto ticks based on length
   *
   * See https://d3js.org/d3-scale/linear#linear_ticks
   */
  ticks?: number | ((domain: GenericDomain) => number[]);
  syncCursor?: boolean;
  valueFormatter: ValueFormatter;
  targetFormatter?: ValueFormatter;
  tickFormatter: ValueFormatter;
}

/** @public */
export const BulletSubtype = Object.freeze({
  vertical: 'vertical' as const,
  horizontal: 'horizontal' as const,
  /**
   * This bullet subtype is not yet fully supported
   * See https://github.com/elastic/elastic-charts/issues/2200
   * @alpha
   */
  circle: 'circle' as const,
  halfCircle: 'half-circle' as const,
  twoThirdsCircle: 'two-thirds-circle' as const,
});
/** @public */
export type BulletSubtype = $Values<typeof BulletSubtype>;

/** @public */
export interface BulletValueLabels {
  active: string;
  value: string;
  target: string;
}

/** @alpha */
export interface BulletSpec extends Spec {
  specType: typeof SpecType.Series;
  chartType: typeof ChartType.Bullet;
  data: (BulletDatum | undefined)[][];
  subtype: BulletSubtype;
  tickSnapStep?: number;
  colorBands?: BulletColorConfig;
  valueLabels?: Optional<BulletValueLabels>;
}

/** @internal */
export const mergeValueLabels = (labels?: BulletSpec['valueLabels']) =>
  mergePartial<BulletValueLabels>(
    {
      active: 'Active',
      value: 'Value',
      target: 'Target',
    },
    labels,
  );

const buildProps = buildSFProps<BulletSpec>()(
  {
    specType: SpecType.Series,
    chartType: ChartType.Bullet,
  },
  {},
);

/**
 * Add Goal spec to chart
 * @alpha
 */
export const Bullet = function (
  props: SFProps<
    BulletSpec,
    keyof (typeof buildProps)['overrides'],
    keyof (typeof buildProps)['defaults'],
    keyof (typeof buildProps)['optionals'],
    keyof (typeof buildProps)['requires']
  >,
) {
  const { defaults, overrides } = buildProps;
  const constraints = {};

  useSpecFactory<BulletSpec>({
    ...defaults,
    ...stripUndefined(props),
    ...overrides,
    ...constraints,
  });
  return null;
};

/** @public */
export type BulletProps = ComponentProps<typeof Bullet>;
