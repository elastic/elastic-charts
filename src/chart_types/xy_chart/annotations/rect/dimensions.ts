/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Scale, ScaleBand, ScaleContinuous } from '../../../../scales';
import { isBandScale, isContinuousScale } from '../../../../scales/types';
import { isDefined } from '../../../../utils/commons';
import { Dimensions } from '../../../../utils/dimensions';
import { GroupId } from '../../../../utils/ids';
import { Point } from '../../../../utils/point';
import { PrimitiveValue } from '../../../partition_chart/layout/utils/group_by_rollup';
import { RectAnnotationDatum, RectAnnotationSpec } from '../../utils/specs';
import { Bounds } from '../types';
import { AnnotationRectProps } from './types';

/** @internal */
export function isWithinRectBounds({ x, y }: Point, { startX, endX, startY, endY }: Bounds): boolean {
  const withinXBounds = x >= startX && x <= endX;
  const withinYBounds = y >= startY && y <= endY;

  return withinXBounds && withinYBounds;
}

/** @internal */
export function computeRectAnnotationDimensions(
  annotationSpec: RectAnnotationSpec,
  chartDimensions: Dimensions,
  yScales: Map<GroupId, Scale>,
  xScale: Scale,
  isHistogram: boolean = false,
): AnnotationRectProps[] | null {
  const { dataValues } = annotationSpec;
  const { groupId } = annotationSpec;
  const yScale = yScales.get(groupId);

  const rectsProps: AnnotationRectProps[] = [];
  dataValues.forEach((dataValue: RectAnnotationDatum) => {
    const { x0: initialX0, x1: initialX1, y0: initialY0, y1: initialY1 } = dataValue.coordinates;

    // if everything is null, return; otherwise we coerce the other coordinates
    if (initialX0 == null && initialX1 == null && initialY0 == null && initialY1 == null) {
      return;
    }
    let height: number | undefined;

    const [x0, x1] = limitValueToDomainRange(xScale, initialX0, initialX1, isHistogram);
    // something is wrong with the data types, don't draw this annotation
    if (x0 == null || x1 == null) {
      return;
    }

    let xAndWidth: { x: number; width: number } | null = null;

    if (isBandScale(xScale)) {
      xAndWidth = scaleXonBandScale(xScale, x0, x1);
    } else if (isContinuousScale(xScale)) {
      xAndWidth = scaleXonContinuousScale(xScale, x0, x1, isHistogram);
    }
    // something is wrong with scales, don't draw
    if (!xAndWidth) {
      return;
    }
    if (!yScale) {
      if (!isDefined(initialY0) && !isDefined(initialY1)) {
        const rectDimensions = {
          ...xAndWidth,
          y: 0,
          height: chartDimensions.height,
        };

        rectsProps.push({
          rect: rectDimensions,
          details: dataValue.details,
        });
      }
      return;
    }

    const [y0, y1] = limitValueToDomainRange(yScale, initialY0, initialY1);
    // something is wrong with the data types, don't draw this annotation
    if (y0 == null || y1 == null) {
      return;
    }

    let scaledY1 = yScale.pureScale(y1);
    const scaledY0 = yScale.pureScale(y0);
    if (scaledY1 == null || scaledY0 == null) {
      return;
    }
    height = Math.abs(scaledY0 - scaledY1);
    // if the annotation height is 0 override it with the height from chart dimension and if the values in the domain are the same
    if (height === 0 && yScale.domain.length === 2 && yScale.domain[0] === yScale.domain[1]) {
      // eslint-disable-next-line prefer-destructuring
      height = chartDimensions.height;
      scaledY1 = 0;
    }

    const rectDimensions = {
      ...xAndWidth,
      y: scaledY1,
      height,
    };

    rectsProps.push({
      rect: rectDimensions,
      details: dataValue.details,
    });
  });

  return rectsProps;
}

function scaleXonBandScale(
  xScale: ScaleBand,
  x0: PrimitiveValue,
  x1: PrimitiveValue,
): { x: number; width: number } | null {
  // the band scale return the start of the band, we need to cover
  // also the inner padding of the bar
  const padding = (xScale.step - xScale.originalBandwidth) / 2;
  let scaledX1 = xScale.scale(x1);
  let scaledX0 = xScale.scale(x0);
  if (scaledX1 == null || scaledX0 == null) {
    return null;
  }
  // extend the x1 scaled value to fully cover the last bar
  scaledX1 += xScale.originalBandwidth + padding;
  // give the x1 value a maximum of the chart range
  if (scaledX1 > xScale.range[1]) {
    [, scaledX1] = xScale.range;
  }

  scaledX0 -= padding;
  if (scaledX0 < xScale.range[0]) {
    [scaledX0] = xScale.range;
  }
  const width = Math.abs(scaledX1 - scaledX0);
  return {
    x: scaledX0,
    width,
  };
}

function scaleXonContinuousScale(
  xScale: ScaleContinuous,
  x0: PrimitiveValue,
  x1: PrimitiveValue,
  isHistogramModeEnabled: boolean = false,
): { x: number; width: number } | null {
  if (typeof x1 !== 'number' || typeof x0 !== 'number') {
    return null;
  }
  const scaledX0 = xScale.scale(x0);
  let scaledX1: number | null;
  if (xScale.totalBarsInCluster > 0 && !isHistogramModeEnabled) {
    scaledX1 = xScale.scale(x1 + xScale.minInterval);
  } else {
    scaledX1 = xScale.scale(x1);
  }
  if (scaledX1 == null || scaledX0 == null) {
    return null;
  }
  // the width needs to be computed before adjusting the x anchor
  const width = Math.abs(scaledX1 - scaledX0);
  return {
    x: scaledX0 - (xScale.bandwidthPadding / 2) * xScale.totalBarsInCluster,
    width,
  };
}

/**
 * This function extend and limits the values in a scale domain
 * @param scale the scale
 * @param minValue a min value
 * @param maxValue a max value
 * @param isHistogram
 */
function limitValueToDomainRange(
  scale: Scale,
  minValue?: PrimitiveValue,
  maxValue?: PrimitiveValue,
  isHistogram = false,
): [PrimitiveValue, PrimitiveValue] {
  const [domainStartValue] = scale.domain;
  // this fix the case where rendering on categorical scale and we have only one element
  const domainEndValue = scale.domain.length > 0 ? scale.domain[scale.domain.length - 1] : scale.domain[0];

  const min = getMin(domainStartValue, minValue);

  const max = getMax(isHistogram ? domainEndValue + scale.minInterval : domainEndValue, maxValue);
  // extend to edge values if values are null/undefined
  if (!isContinuousScale(scale)) {
    return [min, max];
  }
  if (min !== null && max !== null && min > max) {
    return [null, null];
  }
  return [min, max];
}

function getMax(max: number, value?: number | string | null) {
  if (value == null) {
    return max;
  }
  if (typeof value === 'number') {
    return Math.min(value, max);
  }
  return value;
}

function getMin(min: number, value?: number | string | null) {
  if (value == null) {
    return min;
  }
  if (typeof value === 'number') {
    return Math.max(value, min);
  }
  return value;
}
