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

import { Line } from '../../../../geoms/types';
import { Scale } from '../../../../scales';
import { isContinuousScale, isBandScale } from '../../../../scales/types';
import { isNil, Position, Rotation } from '../../../../utils/commons';
import { Dimensions, Size } from '../../../../utils/dimensions';
import { GroupId } from '../../../../utils/ids';
import { SmallMultipleScales } from '../../state/selectors/compute_small_multiple_scales';
import { isHorizontalRotation } from '../../state/utils/common';
import { computeXScaleOffset } from '../../state/utils/utils';
import { getPanelSize } from '../../utils/panel';
import { AnnotationDomainTypes, LineAnnotationSpec, LineAnnotationDatum } from '../../utils/specs';
import { AnnotationMarker } from '../types';
import { AnnotationLineProps } from './types';

/** @internal */
export const DEFAULT_LINE_OVERFLOW = 0;

function computeYDomainLineAnnotationDimensions(
  annotationSpec: LineAnnotationSpec,
  yScale: Scale,
  { vertical, horizontal }: SmallMultipleScales,
  chartRotation: Rotation,
  lineColor: string,
  axisPosition?: Position,
): AnnotationLineProps[] {
  const {
    dataValues,
    marker,
    markerDimensions = { width: 0, height: 0 },
    markerPosition: specMarkerPosition,
  } = annotationSpec;
  const isHorizontalChartRotation = isHorizontalRotation(chartRotation);
  // let's use a default Bottom-X/Left-Y axis orientation if we are not showing an axis
  // but we are displaying a line annotation

  const anchorPosition = getAnchorPosition(false, isHorizontalChartRotation, specMarkerPosition, axisPosition);
  const lineProps: AnnotationLineProps[] = [];
  const [domainStart, domainEnd] = yScale.domain;

  const panelSize = getPanelSize({ vertical, horizontal });

  dataValues.forEach((datum: LineAnnotationDatum) => {
    const { dataValue } = datum;

    // avoid rendering invalid annotation value
    if (dataValue === null || dataValue === undefined || dataValue === '') {
      return;
    }

    const annotationValueYPosition = yScale.scale(dataValue);
    // avoid rendering non scalable annotation values
    if (annotationValueYPosition === null) {
      return;
    }

    // avoid rendering annotation with values outside the scale domain
    if (dataValue < domainStart || dataValue > domainEnd) {
      return;
    }

    vertical.domain.forEach((verticalValue) => {
      horizontal.domain.forEach((horizontalValue) => {
        const topPos = vertical.scaleOrThrow(verticalValue);
        const leftPos = horizontal.scaleOrThrow(horizontalValue);

        const width = isHorizontalChartRotation ? horizontal.bandwidth : vertical.bandwidth;
        const height = isHorizontalChartRotation ? vertical.bandwidth : horizontal.bandwidth;

        const markerPosition = getMarkerPositionForYAnnotation(
          panelSize,
          chartRotation,
          markerDimensions,
          anchorPosition,
          annotationValueYPosition,
        );
        const linePathPoints = getYLinePath({ width, height }, annotationValueYPosition);

        const annotationMarker: AnnotationMarker | undefined = marker
          ? {
              icon: marker,
              color: lineColor,
              dimension: { ...markerDimensions },
              position: {
                top: markerPosition.top,
                left: markerPosition.left,
              },
            }
          : undefined;
        const lineProp: AnnotationLineProps = {
          linePathPoints,
          marker: annotationMarker,
          panel: {
            ...panelSize,
            top: topPos,
            left: leftPos,
          },
          details: {
            detailsText: datum.details,
            headerText: datum.header || dataValue.toString(),
          },
        };

        lineProps.push(lineProp);
      });
    });
  });

  return lineProps;
}

function computeXDomainLineAnnotationDimensions(
  annotationSpec: LineAnnotationSpec,
  xScale: Scale,
  { vertical, horizontal }: SmallMultipleScales,
  chartRotation: Rotation,
  lineColor: string,
  isHistogramMode: boolean,
  axisPosition?: Position,
): AnnotationLineProps[] {
  const {
    dataValues,
    marker,
    markerDimensions = { width: 0, height: 0 },
    markerPosition: specMarkerPosition,
  } = annotationSpec;

  const lineProps: AnnotationLineProps[] = [];
  const isHorizontalChartRotation = isHorizontalRotation(chartRotation);
  const anchorPosition = getAnchorPosition(true, isHorizontalChartRotation, specMarkerPosition, axisPosition);
  const panelSize = getPanelSize({ vertical, horizontal });

  dataValues.forEach((datum: LineAnnotationDatum) => {
    const { dataValue } = datum;
    let annotationValueXPosition = xScale.scale(dataValue);
    if (isNil(annotationValueXPosition)) {
      return;
    }
    if (isContinuousScale(xScale) && typeof dataValue === 'number') {
      const [minDomain] = xScale.domain;
      const maxDomain = isHistogramMode ? xScale.domain[1] + xScale.minInterval : xScale.domain[1];
      if (dataValue < minDomain || dataValue > maxDomain) {
        return;
      }
      if (isHistogramMode) {
        const offset = computeXScaleOffset(xScale, true);
        const pureScaledValue = xScale.pureScale(dataValue);
        if (pureScaledValue == null) {
          return;
        }
        annotationValueXPosition = pureScaledValue - offset;
      } else {
        annotationValueXPosition += (xScale.bandwidth * xScale.totalBarsInCluster) / 2;
      }
    } else if (isBandScale(xScale)) {
      if (isHistogramMode) {
        const padding = (xScale.step - xScale.originalBandwidth) / 2;
        annotationValueXPosition -= padding;
      } else {
        annotationValueXPosition += xScale.originalBandwidth / 2;
      }
    } else {
      return;
    }
    if (isNaN(annotationValueXPosition) || annotationValueXPosition == null) {
      return;
    }

    vertical.domain.forEach((verticalValue) => {
      horizontal.domain.forEach((horizontalValue) => {
        if (annotationValueXPosition == null) {
          return;
        }

        const topPos = vertical.scaleOrThrow(verticalValue);
        const leftPos = horizontal.scaleOrThrow(horizontalValue);
        const width = isHorizontalChartRotation ? horizontal.bandwidth : vertical.bandwidth;
        const height = isHorizontalChartRotation ? vertical.bandwidth : horizontal.bandwidth;

        const markerPosition = getMarkerPositionForXAnnotation(
          panelSize,
          chartRotation,
          markerDimensions,
          anchorPosition,
          annotationValueXPosition,
        );

        const linePathPoints = getXLinePath({ width, height }, annotationValueXPosition);

        const annotationMarker: AnnotationMarker | undefined = marker
          ? {
              icon: marker,
              color: lineColor,
              dimension: { ...markerDimensions },
              position: {
                top: markerPosition.top,
                left: markerPosition.left,
              },
            }
          : undefined;
        const lineProp: AnnotationLineProps = {
          linePathPoints,
          details: {
            detailsText: datum.details,
            headerText: datum.header || dataValue.toString(),
          },
          marker: annotationMarker,
          panel: {
            ...panelSize,
            top: topPos,
            left: leftPos,
          },
        };
        lineProps.push(lineProp);
      });
    });
  });

  return lineProps;
}

/** @internal */
export function computeLineAnnotationDimensions(
  annotationSpec: LineAnnotationSpec,
  chartRotation: Rotation,
  yScales: Map<GroupId, Scale>,
  xScale: Scale,
  smallMultipleScales: SmallMultipleScales,
  isHistogramMode: boolean,
  axisPosition?: Position,
): AnnotationLineProps[] | null {
  const { domainType, hideLines } = annotationSpec;

  if (hideLines) {
    return null;
  }

  // this type is guaranteed as this has been merged with default
  const lineStyle = annotationSpec.style;
  const lineColor = lineStyle?.line?.stroke ?? 'red';

  if (domainType === AnnotationDomainTypes.XDomain) {
    return computeXDomainLineAnnotationDimensions(
      annotationSpec,
      xScale,
      smallMultipleScales,
      chartRotation,
      lineColor,
      isHistogramMode,
      axisPosition,
    );
  }

  const { groupId } = annotationSpec;
  const yScale = yScales.get(groupId);
  if (!yScale) {
    return null;
  }

  return computeYDomainLineAnnotationDimensions(
    annotationSpec,
    yScale,
    smallMultipleScales,
    chartRotation,
    lineColor,
    axisPosition,
  );
}

function getAnchorPosition(
  isXDomain: boolean,
  isChartHorizontal: boolean,
  specMarkerPosition?: Position,
  axisPosition?: Position,
): Position {
  const dflPositionFromAxis = getDefaultMarkerPositionFromAxis(isXDomain, isChartHorizontal, axisPosition);

  if (specMarkerPosition !== undefined) {
    // validate specMarkerPosition against domain
    const validatedPosFromMarkerPos = validateMarkerPosition(isXDomain, isChartHorizontal, specMarkerPosition);
    return validatedPosFromMarkerPos ?? dflPositionFromAxis;
  }
  return dflPositionFromAxis;
}

function validateMarkerPosition(isXDomain: boolean, isHorizontal: boolean, position: Position): Position | undefined {
  if ((isXDomain && isHorizontal) || (!isXDomain && !isHorizontal)) {
    return position === Position.Top || position === Position.Bottom ? position : undefined;
  }
  return position === Position.Left || position === Position.Right ? position : undefined;
}

function getDefaultMarkerPositionFromAxis(
  isXDomain: boolean,
  isHorizontal: boolean,
  axisPosition?: Position,
): Position {
  if (axisPosition) {
    return axisPosition;
  }
  if ((isXDomain && isHorizontal) || (!isXDomain && !isHorizontal)) {
    return Position.Left;
  }
  return Position.Bottom;
}

function getXLinePath({ height }: Size, value: number): Line {
  return {
    x1: value,
    y1: 0,
    x2: value,
    y2: height,
  };
}

function getYLinePath({ width }: Size, value: number): Line {
  return {
    x1: 0,
    y1: value,
    x2: width,
    y2: value,
  };
}

export function getMarkerPositionForXAnnotation(
  { width, height }: Size,
  rotation: Rotation,
  { width: mWidth, height: mHeight }: Size,
  position: Position,
  value: number,
): Pick<Dimensions, 'top' | 'left'> {
  switch (position) {
    case Position.Right:
      return {
        top: rotation === -90 ? height - value - mHeight / 2 : value - mHeight / 2,
        left: width,
      };
    case Position.Left:
      return {
        top: rotation === -90 ? height - value - mHeight / 2 : value - mHeight / 2,
        left: -mWidth,
      };
    case Position.Top:
      return {
        top: 0 - mHeight,
        left: rotation === 180 ? width - value - mWidth / 2 : value - mWidth / 2,
      };
    case Position.Bottom:
    default:
      return {
        top: height,
        left: rotation === 180 ? width - value - mWidth / 2 : value - mWidth / 2,
      };
  }
}

function getMarkerPositionForYAnnotation(
  { width, height }: Size,
  rotation: Rotation,
  { width: mWidth, height: mHeight }: Size,
  position: Position,
  value: number,
): {
  top: number;
  left: number;
} {
  switch (position) {
    case Position.Right:
      return {
        top: rotation === 180 ? height - value - mHeight / 2 : value - mHeight / 2,
        left: width,
      };
    case Position.Left:
      return {
        top: rotation === 180 ? height - value - mHeight / 2 : value - mHeight / 2,
        left: -mWidth,
      };
    case Position.Top:
      return {
        top: -mHeight,
        left: rotation === 90 ? width - value - mWidth / 2 : value - mWidth / 2,
      };
    case Position.Bottom:
    default:
      return {
        top: height,
        left: rotation === 90 ? width - value - mWidth / 2 : value - mWidth / 2,
      };
  }
}
