/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeLineAnnotationDimensions } from './line/dimensions';
import { computeRectAnnotationDimensions } from './rect/dimensions';
import { AnnotationDimensions } from './types';
import { SmallMultipleScales } from '../../../common/panel_utils';
import { SettingsSpec } from '../../../specs';
import { Rotation, Position } from '../../../utils/common';
import { Dimensions } from '../../../utils/dimensions';
import { AnnotationId, AxisId, GroupId } from '../../../utils/ids';
import { Point } from '../../../utils/point';
import { AxisStyle, Theme } from '../../../utils/themes/theme';
import { getAxesSpecForSpecId } from '../state/utils/spec';
import { ComputedGeometries } from '../state/utils/types';
import { AnnotationDomainType, AnnotationSpec, AxisSpec, isLineAnnotation } from '../utils/specs';

/** @internal */
export function getAnnotationAxis(
  axesSpecs: AxisSpec[],
  groupId: GroupId,
  domainType: AnnotationDomainType,
  chartRotation: Rotation,
): Position | undefined {
  const { xAxis, yAxis } = getAxesSpecForSpecId(axesSpecs, groupId, chartRotation);
  const isXDomainAnnotation = isXDomain(domainType);
  return isXDomainAnnotation ? xAxis?.position : yAxis?.position;
}

/** @internal */
export function isXDomain(domainType: AnnotationDomainType): boolean {
  return domainType === AnnotationDomainType.XDomain;
}

/** @internal */
export function getTransformedCursor(
  cursorPosition: Point,
  chartDimensions: Dimensions,
  chartRotation: Rotation | null,
  /**
   * getTransformedCursor to account for projected cursor position relative to chart dimensions
   */
  projectArea = false,
): Point {
  const { height, width, left, top } = chartDimensions;
  let { x, y } = cursorPosition;

  if (projectArea) {
    x = cursorPosition.x - left;
    y = cursorPosition.y - top;
  }

  if (chartRotation === null) {
    return { x, y };
  }

  switch (chartRotation) {
    case 90:
      return { x: y, y: width - x };
    case -90:
      return { x: height - y, y: x };
    case 180:
      return { x: width - x, y: height - y };
    case 0:
    default:
      return { x, y };
  }
}

/** @internal */
export function invertTransformedCursor(
  cursorPosition: Point,
  chartDimensions: Dimensions,
  chartRotation: Rotation | null,
  /**
   * Used to account for projected cursor position relative to chart dimensions
   */
  projectArea = false,
): Point {
  const { height, width, left, top } = chartDimensions;
  let { x, y } = cursorPosition;

  switch (chartRotation) {
    case 0:
    case null:
      break;
    case 90:
      x = width - cursorPosition.y;
      y = cursorPosition.x;
      break;
    case -90:
      y = height - cursorPosition.x;
      x = cursorPosition.y;
      break;
    case 180:
    default:
      y = height - cursorPosition.y;
      x = width - cursorPosition.x;
  }

  if (projectArea) {
    x += left;
    y += top;
  }

  return { x, y };
}

/** @internal */
export function computeAnnotationDimensions(
  annotations: AnnotationSpec[],
  { rotation: chartRotation }: Pick<SettingsSpec, 'rotation'>,
  { scales: { xScale, yScales } }: Pick<ComputedGeometries, 'scales'>,
  axesSpecs: AxisSpec[],
  { lineAnnotation: lineAnnotationStyle }: Theme,
  isHistogramModeEnabled: boolean,
  smallMultipleScales: SmallMultipleScales,
  getAxisStyle: (id?: AxisId) => AxisStyle,
): Map<AnnotationId, AnnotationDimensions> {
  return annotations.reduce<Map<AnnotationId, AnnotationDimensions>>((annotationDimensions, annotationSpec) => {
    const { id } = annotationSpec;

    if (isLineAnnotation(annotationSpec)) {
      const { groupId, domainType } = annotationSpec;
      const annotationAxisPosition = getAnnotationAxis(axesSpecs, groupId, domainType, chartRotation);

      const dimensions = computeLineAnnotationDimensions(
        annotationSpec,
        chartRotation,
        yScales,
        xScale,
        smallMultipleScales,
        lineAnnotationStyle,
        isHistogramModeEnabled,
        annotationAxisPosition,
      );
      if (dimensions) {
        annotationDimensions.set(id, dimensions);
      }
      return annotationDimensions;
    } else {
      const dimensions = computeRectAnnotationDimensions(
        annotationSpec,
        yScales,
        xScale,
        axesSpecs,
        smallMultipleScales,
        chartRotation,
        getAxisStyle,
        isHistogramModeEnabled,
      );

      if (dimensions) {
        annotationDimensions.set(id, dimensions);
      }
      return annotationDimensions;
    }
  }, new Map());
}
