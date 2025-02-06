/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '..';
import { LegacyAnimationConfig } from '../../common/animation';
import { BaseDatum } from '../../specs';
import { Spec, SpecType } from '../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import { buildSFProps, SFProps, useSpecFactory } from '../../state/spec_factory';
import { Datum, ValueAccessor, ValueFormatter, stripUndefined } from '../../utils/common';

/**
 * Control function for resetting chart focus
 * @public
 */
export type FlameGlobalControl = () => void; // takes no argument

/**
 * Control function for setting chart focus on a specific node
 * @public
 */
export type FlameNodeControl = (nodeIndex: number) => void; // takes no arguments

/**
 * Control function for setting chart focus on a specific node
 * @public
 */
export type FlameSearchControl = (text: string) => void; // takes no arguments

/**
 * Provides direct controls for the Flame component user.
 * The call site supplied callback function is invoked on the chart component initialization as well as on component update,
 * so the callback must be idempotent.
 * @public
 */
export interface ControlReceiverCallbacks {
  resetFocus: (control: FlameGlobalControl) => void; // call site responsibility to store and use the `control` function
  focusOnNode: (control: FlameNodeControl) => void; // same but the control function passed to the call site uses one arg
  search: (control: FlameSearchControl) => void;
}

/**
 * Column oriented data input for N data points:
 *   - label: array of N strings
 *   - value: Float64Array of N numbers, for tooltip value display
 *   - color: Float32Array of 4 * N numbers, eg. green[i] = color[4 * i + 1]
 *   - position0: Tween from: Float32Array of 2 * N numbers with unit coordinates [x0, y0, x1, y1, ..., xN-1, yN-1]
 *   - position1: Tween to: Float32Array of 2 * N numbers with unit coordinates [x0, y0, x1, y1, ..., xN-1, yN-1]
 *   - size0: Tween from: Float32Array of N numbers with unit widths [width0, width1, ... , widthN-1]
 *   - size1: Tween to: Float32Array of N numbers with unit widths [width0, width1, ... , widthN-1]
 * If position0 === position1 and size0 === size1, then the nodes are not animated
 * @public
 */
export interface ColumnarViewModel {
  label: string[];
  value: Float64Array;
  color: Float32Array;
  position0: Float32Array;
  position1: Float32Array;
  size0: Float32Array;
  size1: Float32Array;
}

/**
 * Specifies the flame chart
 * @public
 */
export interface FlameSpec<D extends BaseDatum = Datum> extends Spec, LegacyAnimationConfig {
  specType: typeof SpecType.Series;
  chartType: typeof ChartType.Flame;
  columnarData: ColumnarViewModel;
  controlProviderCallback: Partial<ControlReceiverCallbacks>; // call site may grab any number of controls
  valueAccessor: ValueAccessor<D>;
  valueFormatter: ValueFormatter;
  valueGetter: (datumIndex: number) => number;
  search?: { text: string };
  onSearchTextChange?: (text: string) => void;
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
    keyof (typeof buildProps)['overrides'],
    keyof (typeof buildProps)['defaults'],
    keyof (typeof buildProps)['optionals'],
    keyof (typeof buildProps)['requires']
  >,
) {
  const { defaults, overrides } = buildProps;
  useSpecFactory<FlameSpec<D>>({ ...defaults, ...stripUndefined(props), ...overrides });
  return null;
};
