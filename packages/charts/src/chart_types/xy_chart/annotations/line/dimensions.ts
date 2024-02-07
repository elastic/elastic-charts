/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { AnnotationLineProps } from './types';
import { Colors } from '../../../../common/colors';
import { SmallMultipleScales, getPanelSize } from '../../../../common/panel_utils';
import { Line } from '../../../../geoms/types';
import { ScaleBand, ScaleContinuous } from '../../../../scales';
import { Position, Rotation } from '../../../../utils/common';
import { Dimensions, Size } from '../../../../utils/dimensions';
import { GroupId } from '../../../../utils/ids';
import { mergeWithDefaultAnnotationLine } from '../../../../utils/themes/merge_utils';
import { isHorizontalRotation, isVerticalRotation } from '../../state/utils/common';
import { AnnotationDomainType, LineAnnotationDatum, LineAnnotationSpec } from '../../utils/specs';
import { getAnnotationXScaledValue } from '../scale_utils';

function computeYDomainLineAnnotationDimensions(
  annotationSpec: LineAnnotationSpec,
  yScale: ScaleContinuous,
  { vertical, horizontal }: SmallMultipleScales,
  chartRotation: Rotation,
  axisPosition?: Position,
): AnnotationLineProps[] {
  const {
    id: specId,
    dataValues,
    marker: icon,
    markerBody: body,
    markerDimensions: dimension,
    markerPosition: specMarkerPosition,
    style,
  } = annotationSpec;
  const lineStyle = mergeWithDefaultAnnotationLine(style);
  const color = lineStyle?.line?.stroke ?? Colors.Red.keyword;
  const isHorizontalChartRotation = isHorizontalRotation(chartRotation);
  // let's use a default Bottom-X/Left-Y axis orientation if we are not showing an axis
  // but we are displaying a line annotation

  const lineProps: AnnotationLineProps[] = [];
  const [domainStart, domainEnd] = yScale.domain;

  const panelSize = getPanelSize({ vertical, horizontal });

  dataValues.forEach((datum: LineAnnotationDatum, i) => {
    const { dataValue } = datum;

    // avoid rendering invalid annotation value
    if (!dataValue && dataValue !== 0) return;

    const annotationValueYPosition = yScale.scale(dataValue);
    // avoid rendering non scalable annotation values
    if (Number.isNaN(annotationValueYPosition)) return;

    // avoid rendering annotation with values outside the scale domain
    if (dataValue < domainStart || dataValue > domainEnd) return;

    vertical.domain.forEach((verticalValue) => {
      horizontal.domain.forEach((horizontalValue) => {
        const top = vertical.scale(verticalValue);
        const left = horizontal.scale(horizontalValue);
        if (Number.isNaN(top + left)) return;

        const width = isHorizontalChartRotation ? horizontal.bandwidth : vertical.bandwidth;
        const height = isHorizontalChartRotation ? vertical.bandwidth : horizontal.bandwidth;
        const linePathPoints = getYLinePath({ width, height }, annotationValueYPosition);
        const alignment = getAnchorPosition(false, chartRotation, axisPosition, specMarkerPosition);

        const position = getMarkerPositionForYAnnotation(
          panelSize,
          chartRotation,
          alignment,
          annotationValueYPosition,
          dimension,
        );

        const lineProp: AnnotationLineProps = {
          specId,
          id: getAnnotationLinePropsId(specId, datum, i, verticalValue, horizontalValue),
          datum,
          linePathPoints,
          markers: icon
            ? [
                {
                  icon,
                  body,
                  color,
                  dimension,
                  position,
                  alignment,
                },
              ]
            : [],
          panel: {
            ...panelSize,
            top,
            left,
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
  xScale: ScaleContinuous | ScaleBand,
  { vertical, horizontal }: SmallMultipleScales,
  chartRotation: Rotation,
  isHistogramMode: boolean,
  axisPosition?: Position,
): AnnotationLineProps[] {
  const {
    id: specId,
    dataValues,
    marker: icon,
    markerBody: body,
    markerDimensions: dimension,
    markerPosition: specMarkerPosition,
    style,
  } = annotationSpec;
  const lineStyle = mergeWithDefaultAnnotationLine(style);
  const color = lineStyle?.line?.stroke ?? Colors.Red.keyword;

  const lineProps: AnnotationLineProps[] = [];
  const isHorizontalChartRotation = isHorizontalRotation(chartRotation);
  const panelSize = getPanelSize({ vertical, horizontal });

  dataValues.forEach((datum: LineAnnotationDatum, i) => {
    const { dataValue } = datum;
    const annotationValueXPosition = getAnnotationXScaledValue(xScale, dataValue, isHistogramMode);

    vertical.domain.forEach((verticalValue) => {
      horizontal.domain.forEach((horizontalValue) => {
        if (Number.isNaN(annotationValueXPosition)) return;

        const top = vertical.scale(verticalValue);
        const left = horizontal.scale(horizontalValue);
        if (Number.isNaN(top + left)) return;

        const width = isHorizontalChartRotation ? horizontal.bandwidth : vertical.bandwidth;
        const height = isHorizontalChartRotation ? vertical.bandwidth : horizontal.bandwidth;

        const linePathPoints = getXLinePath({ width, height }, annotationValueXPosition);
        const alignment = getAnchorPosition(true, chartRotation, axisPosition, specMarkerPosition);

        const position = getMarkerPositionForXAnnotation(
          panelSize,
          chartRotation,
          alignment,
          annotationValueXPosition,
          dimension,
        );

        const lineProp: AnnotationLineProps = {
          specId,
          id: getAnnotationLinePropsId(specId, datum, i, verticalValue, horizontalValue),
          datum,
          linePathPoints,
          markers: icon
            ? [
                {
                  icon,
                  body,
                  color,
                  dimension,
                  position,
                  alignment,
                },
              ]
            : [],
          panel: {
            ...panelSize,
            top,
            left,
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
  yScales: Map<GroupId, ScaleContinuous>,
  xScale: ScaleContinuous | ScaleBand,
  smallMultipleScales: SmallMultipleScales,
  isHistogramMode: boolean,
  axisPosition?: Position,
): AnnotationLineProps[] | null {
  const { domainType, hideLines } = annotationSpec;

  if (hideLines) {
    return null;
  }

  if (domainType === AnnotationDomainType.XDomain) {
    return computeXDomainLineAnnotationDimensions(
      annotationSpec,
      xScale,
      smallMultipleScales,
      chartRotation,
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
    axisPosition,
  );
}

function getAnchorPosition(
  isXDomain: boolean,
  chartRotation: Rotation,
  axisPosition?: Position,
  specMarkerPosition?: Position,
): Position {
  const dflPositionFromAxis = getDefaultMarkerPositionFromAxis(isXDomain, chartRotation, axisPosition);
  if (specMarkerPosition !== undefined) {
    // validate specMarkerPosition against domain
    const validatedPosFromMarkerPos = validateMarkerPosition(isXDomain, chartRotation, specMarkerPosition);
    return validatedPosFromMarkerPos ?? dflPositionFromAxis;
  }
  return dflPositionFromAxis;
}

function validateMarkerPosition(isXDomain: boolean, chartRotation: Rotation, position: Position): Position | undefined {
  if ((isXDomain && isHorizontalRotation(chartRotation)) || (!isXDomain && isVerticalRotation(chartRotation))) {
    return position === Position.Top || position === Position.Bottom ? position : undefined;
  }
  return position === Position.Left || position === Position.Right ? position : undefined;
}

function getDefaultMarkerPositionFromAxis(
  isXDomain: boolean,
  chartRotation: Rotation,
  axisPosition?: Position,
): Position {
  if (axisPosition) {
    return axisPosition;
  }
  if ((isXDomain && isVerticalRotation(chartRotation)) || (!isXDomain && isHorizontalRotation(chartRotation))) {
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

/** @internal */
export function getMarkerPositionForXAnnotation(
  { width, height }: Size,
  rotation: Rotation,
  position: Position,
  value: number,
  { width: mWidth, height: mHeight }: Size = { width: 0, height: 0 },
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
  position: Position,
  value: number,
  { width: mWidth, height: mHeight }: Size = { width: 0, height: 0 },
): Pick<Dimensions, 'top' | 'left'> {
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

/**
 * @internal
 */
export function getAnnotationLinePropsId(
  specId: string,
  datum: LineAnnotationDatum,
  index: number,
  verticalValue?: any,
  horizontalValue?: any,
) {
  return [specId, verticalValue, horizontalValue, datum.header, datum.details, index].join('__');
}
