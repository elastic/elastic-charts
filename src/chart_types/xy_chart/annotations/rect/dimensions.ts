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
 * under the License. */

import { RectAnnotationDatum, RectAnnotationSpec } from '../../utils/specs';
import { GroupId } from '../../../../utils/ids';
import { Scale, ScaleBand, ScaleContinuous } from '../../../../scales';
import { Point } from '../../../../utils/point';
import { Bounds } from '../types';
import { AnnotationRectProps } from './types';
import { isBandScale, isContinuousScale } from '../../../../scales/types';
import { PrimitiveValue } from '../../../partition_chart/layout/utils/group_by_rollup';

/** @internal */
export function isWithinRectBounds({ x, y }: Point, { startX, endX, startY, endY }: Bounds): boolean {
  const withinXBounds = x >= startX && x <= endX;
  const withinYBounds = y >= startY && y <= endY;

  return withinXBounds && withinYBounds;
}

/** @internal */
export function computeRectAnnotationDimensions(
  annotationSpec: RectAnnotationSpec,
  yScales: Map<GroupId, Scale>,
  xScale: Scale,
  isHistogram: boolean = false,
): AnnotationRectProps[] | null {
  const { dataValues } = annotationSpec;
  const groupId = annotationSpec.groupId;
  const yScale = yScales.get(groupId);
  if (!yScale) {
    return null;
  }

  const rectsProps: AnnotationRectProps[] = [];

  dataValues.forEach((dataValue: RectAnnotationDatum) => {
    let { x0, x1, y0, y1 } = dataValue.coordinates;

    // if everything is null, return; otherwise we coerce the other coordinates
    if (x0 == null && x1 == null && y0 == null && y1 == null) {
      return;
    }
    [x0, x1] = limitValueToDomainRange(xScale, x0, x1, isHistogram);
    [y0, y1] = limitValueToDomainRange(yScale, y0, y1);

    // something is wrong with the data types, don't draw this annotation
    if (x0 == null || x1 == null || y0 == null || y1 == null) {
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
    const y = yScale.pureScale(y1);
    const height = Math.abs(yScale.pureScale(y0) - y);

    const rectDimensions = {
      ...xAndWidth,
      y,
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

  // extend the x1 scaled value to fully cover the last bar
  let x1Scaled: number = xScale.scale(x1) + xScale.originalBandwidth + padding;
  // give the x1 value a maximum of the chart range
  if (x1Scaled > xScale.range[1]) {
    x1Scaled = xScale.range[1];
  }

  let x0Scaled = xScale.scale(x0) - padding;
  if (x0Scaled < xScale.range[0]) {
    x0Scaled = xScale.range[0];
  }
  const width = Math.abs(x1Scaled - x0Scaled);
  return {
    x: x0Scaled,
    width,
  };
}

function scaleXonContinuousScale(
  xScale: ScaleContinuous,
  x0: PrimitiveValue,
  x1: PrimitiveValue,
  isHistogramModeEnabled: boolean = false,
): { x: number; width: number } | null {
  let x1Scaled: number;
  if (typeof x1 !== 'number' || typeof x0 !== 'number') {
    return null;
  }
  if (xScale.totalBarsInCluster > 0 && !isHistogramModeEnabled) {
    x1Scaled = xScale.scale(x1 + xScale.minInterval);
  } else {
    x1Scaled = xScale.scale(x1);
  }
  const x0Scaled = xScale.scale(x0);
  // the width needs to be computed before adjusting the x anchor
  const width = Math.abs(x1Scaled - x0Scaled);
  return {
    x: x0Scaled - (xScale.bandwidthPadding / 2) * xScale.totalBarsInCluster,
    width,
  };
}

/**
 * This function extend and limits the values in a scale domain
 * @param scale the scale
 * @param minValue a min value
 * @param maxValue a max value
 */
function limitValueToDomainRange(
  scale: Scale,
  minValue?: PrimitiveValue,
  maxValue?: PrimitiveValue,
  isHistogram: boolean = false,
): [PrimitiveValue, PrimitiveValue] {
  const domainStartValue = scale.domain[0];
  // this fix the case where rendering on categorical scale and we have only one element
  const domainEndValue = scale.domain.length > 0 ? scale.domain[scale.domain.length - 1] : scale.domain[0];

  // extend to edge values if values are null/undefined
  let min = minValue == null ? domainStartValue : minValue;
  let max = maxValue == null ? domainEndValue : maxValue;

  if (isContinuousScale(scale)) {
    if (minValue == null) {
      // we expand null/undefined values to the edge
      min = domainStartValue;
    } else if (typeof minValue !== 'number') {
      // we need to restrict to number only for continuous scales
      min = null;
    } else if (minValue < domainStartValue) {
      // we limit values to the edge
      min = domainStartValue;
    } else {
      min = minValue;
    }

    if (maxValue == null) {
      // we expand null/undefined values to the edge
      max = isHistogram ? domainEndValue + scale.minInterval : domainEndValue;
    } else if (typeof maxValue !== 'number') {
      // we need to restrict to number only for continuous scales
      max = null;
    } else if (maxValue > domainEndValue) {
      // we limit values to the edge
      max = domainEndValue;
    } else {
      max = maxValue;
    }
  }
  return [min, max];
}
