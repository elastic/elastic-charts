/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '..';
import { Spec } from '../../specs';
import { SpecType } from '../../specs/constants'; // kept as long-winded import on separate line otherwise import circularity emerges
import { buildSFProps, SFProps, useSpecFactory } from '../../state/spec_factory';
import { stripUndefined } from '../../utils/common';

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
export interface PlotMatrixViewModel {
  label: string[];
  value: Float64Array;
  color: Float32Array;
  position0: Float32Array;
  position1: Float32Array;
  size0: Float32Array;
  size1: Float32Array;
}

/**
 * Specifies the plot matrix
 * @public
 */
export interface PlotMatrixSpec extends Spec {
  specType: typeof SpecType.Series;
  chartType: typeof ChartType.PlotMatrix;
  columnarData: PlotMatrixViewModel;
}

const buildProps = buildSFProps<PlotMatrixSpec>()(
  {
    chartType: ChartType.PlotMatrix,
    specType: SpecType.Series,
  },
  {},
);

/**
 * Adds plot matrix spec to chart specs
 * @public
 */
export const PlotMatrix = function (
  props: SFProps<
    PlotMatrixSpec,
    keyof typeof buildProps['overrides'],
    keyof typeof buildProps['defaults'],
    keyof typeof buildProps['optionals'],
    keyof typeof buildProps['requires']
  >,
) {
  const { defaults, overrides } = buildProps;
  useSpecFactory<PlotMatrixSpec>({ ...defaults, ...stripUndefined(props), ...overrides });
  return null;
};
