/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '..';
import { AnimationConfig } from '../../common/animation';
import { BaseDatum, Spec } from '../../specs';
import { SpecType } from '../../specs/constants'; // kept as long-winded import on separate line otherwise import circularity emerges
import { buildSFProps, SFProps, useSpecFactory } from '../../state/spec_factory';
import { Datum, stripUndefined, ValueAccessor, ValueFormatter } from '../../utils/common';
import { ColumnarViewModel, ValueGetterFunction } from './types';

/**
 * Provides direct controls for the component user
 * @public
 */
export type ControlProviderCallback = (controlName: string, controlFunction: (...args: unknown[]) => void) => void;

/**
 * Specifies the flame chart
 * @public
 */
export interface FlameSpec<D extends BaseDatum = Datum> extends Spec, AnimationConfig {
  specType: typeof SpecType.Series;
  chartType: typeof ChartType.Flame;
  columnarData: ColumnarViewModel;
  controlProviderCallback: ControlProviderCallback;
  valueAccessor: ValueAccessor<D>;
  valueFormatter: ValueFormatter;
  valueGetter: ValueGetterFunction;
}

const buildProps = buildSFProps<FlameSpec>()(
  {
    chartType: ChartType.Flame,
    specType: SpecType.Series,
  },
  {
    valueAccessor: (d) => (typeof d === 'number' ? d : 0),
    valueGetter: (n) => n, // fixme abracadabra
    valueFormatter: (d) => String(d),
    animation: { duration: 0 },
  },
);

/**
 * Adds flame spec to chart specs
 * @public
 */
export const Flame = function <D extends BaseDatum = Datum>(
  props: SFProps<
    FlameSpec<D>,
    keyof typeof buildProps['overrides'],
    keyof typeof buildProps['defaults'],
    keyof typeof buildProps['optionals'],
    keyof typeof buildProps['requires']
  >,
) {
  const { defaults, overrides } = buildProps;
  useSpecFactory<FlameSpec<D>>({ ...defaults, ...stripUndefined(props), ...overrides });
  return null;
};
