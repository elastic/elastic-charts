/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ScaleBand, ScaleContinuous } from '../../../scales';
import { isBandScale, isContinuousScale } from '../../../scales/types';
import { computeXScaleOffset } from '../state/utils/utils';

/** @internal */
export function getAnnotationXScaledValue(
  xScale: ScaleBand | ScaleContinuous,
  dataValue: string | number,
  isHistogramMode: boolean,
): number {
  let annotationValueXPosition = xScale.scale(dataValue);
  if (Number.isNaN(annotationValueXPosition)) {
    return NaN;
  }
  if (isContinuousScale(xScale) && typeof dataValue === 'number') {
    const [minDomain, scaleMaxDomain] = xScale.domain;
    const maxDomain = isHistogramMode ? scaleMaxDomain + xScale.minInterval : scaleMaxDomain;
    if (dataValue < minDomain || dataValue > maxDomain) {
      return NaN;
    }
    if (isHistogramMode) {
      const offset = computeXScaleOffset(xScale, true);
      const pureScaledValue = xScale.pureScale(dataValue);
      if (!Number.isNaN(pureScaledValue)) {
        // Number.isFinite is regrettably not a type guard yet https://github.com/microsoft/TypeScript/issues/10038#issuecomment-924115831
        annotationValueXPosition = pureScaledValue - offset;
      }
    } else {
      annotationValueXPosition += (xScale.bandwidth * xScale.totalBarsInCluster) / 2;
    }
  } else if (isBandScale(xScale)) {
    annotationValueXPosition += isHistogramMode
      ? -(xScale.step - xScale.originalBandwidth) / 2
      : xScale.originalBandwidth / 2;
  } else {
    return NaN;
  }
  if (!isFinite(annotationValueXPosition)) {
    return NaN;
  }
  return annotationValueXPosition;
}
