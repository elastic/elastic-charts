/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { isHorizontalAxis } from './axis_type_utils';
import { computeXScale, computeYScales } from './scales';
import { ChartType } from '../..';
import type { ScaleBand, ScaleContinuous } from '../../../scales';
import { ScaleType } from '../../../scales/constants';
import type { AxisSpec, SettingsSpec } from '../../../specs';
import type { Position, Rotation } from '../../../utils/common';
import type { Range } from '../../../utils/domain';
import type { AxisStyle } from '../../../utils/themes/theme';
import type { SeriesDomainsAndData } from '../state/utils/types';

/** @internal */
export const defaultTickFormatter = (tick: unknown) => `${tick}`;

/** @internal */
export function isXDomain(position: Position, chartRotation: Rotation): boolean {
  return isHorizontalAxis(position) === (chartRotation % 180 === 0);
}

/** @internal */
export function getScaleForAxisSpec(
  { xDomain, yDomains }: Pick<SeriesDomainsAndData, 'xDomain' | 'yDomains'>,
  { rotation: chartRotation }: Pick<SettingsSpec, 'rotation'>,
  totalBarsInCluster: number,
  barsPadding?: number,
  enableHistogramMode?: boolean,
) {
  return (
    {
      groupId,
      integersOnly,
      maximumFractionDigits: mfd,
      position,
    }: Pick<AxisSpec, 'groupId' | 'integersOnly' | 'maximumFractionDigits' | 'position'>,
    range: Range,
  ): ScaleContinuous | ScaleBand | null => {
    // TODO: remove this fallback when integersOnly is removed
    const maximumFractionDigits = integersOnly ? 0 : mfd;

    return isXDomain(position, chartRotation)
      ? computeXScale({ xDomain, totalBarsInCluster, range, barsPadding, enableHistogramMode, maximumFractionDigits })
      : computeYScales({ yDomains, range, maximumFractionDigits }).get(groupId) ?? null;
  };
}

/** @internal */
export function isMultilayerTimeAxis(
  { chartType, timeAxisLayerCount, position }: AxisSpec,
  xScaleType: ScaleType,
  rotation: Rotation,
) {
  return (
    chartType === ChartType.XYAxis &&
    timeAxisLayerCount > 0 &&
    isXDomain(position, rotation) &&
    rotation === 0 &&
    xScaleType === ScaleType.Time
  );
}

/** @internal */
export function shouldShowTicks({ visible }: AxisStyle['tickLine'], axisHidden: boolean): boolean {
  return !axisHidden && visible;
}
