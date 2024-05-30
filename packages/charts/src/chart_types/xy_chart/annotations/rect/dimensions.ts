/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { AnnotationRectProps } from './types';
import { getPanelSize, SmallMultipleScales } from '../../../../common/panel_utils';
import { ScaleBand, ScaleContinuous } from '../../../../scales';
import { isBandScale, isContinuousScale } from '../../../../scales/types';
import { isDefined, isNil, Position, Rotation } from '../../../../utils/common';
import { AxisId, GroupId } from '../../../../utils/ids';
import { Point } from '../../../../utils/point';
import { AxisStyle } from '../../../../utils/themes/theme';
import { PrimitiveValue } from '../../../partition_chart/layout/utils/group_by_rollup';
import { isHorizontalRotation, isVerticalRotation } from '../../state/utils/common';
import { getAxesSpecForSpecId } from '../../state/utils/spec';
import { AxisSpec, RectAnnotationDatum, RectAnnotationSpec } from '../../utils/specs';
import { Bounds } from '../types';

/** @internal */
export function isWithinRectBounds({ x, y }: Point, { startX, endX, startY, endY }: Bounds): boolean {
  const withinXBounds = x >= startX && x <= endX;
  const withinYBounds = y >= startY && y <= endY;

  return withinXBounds && withinYBounds;
}

/** @internal */
export function computeRectAnnotationDimensions(
  annotationSpec: RectAnnotationSpec,
  yScales: Map<GroupId, ScaleContinuous>,
  xScale: ScaleBand | ScaleContinuous,
  axesSpecs: AxisSpec[],
  smallMultiplesScales: SmallMultipleScales,
  chartRotation: Rotation,
  getAxisStyle: (id?: AxisId) => AxisStyle,
  isHistogram: boolean = false,
): AnnotationRectProps[] | null {
  const { dataValues, groupId, outside, id: annotationSpecId } = annotationSpec;
  const { xAxis, yAxis } = getAxesSpecForSpecId(axesSpecs, groupId);
  const yScale = yScales.get(groupId);
  const rectsProps: Omit<AnnotationRectProps, 'id' | 'panel'>[] = [];
  const panelSize = getPanelSize(smallMultiplesScales);

  dataValues.forEach((datum: RectAnnotationDatum) => {
    const { x0: initialX0, x1: initialX1, y0: initialY0, y1: initialY1 } = datum.coordinates;

    // if everything is null, return; otherwise we coerce the other coordinates
    if (initialX0 === null && initialX1 === null && initialY0 === null && initialY1 === null) {
      return;
    }
    let height: number | undefined;

    const [x0, x1] = limitValueToDomainRange(xScale, initialX0, initialX1, isHistogram);
    // something is wrong with the data types, don't draw this annotation
    if (x0 === null || x1 === null) {
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
        const isLeftSide =
          (chartRotation === 0 && xAxis?.position === Position.Bottom) ||
          (chartRotation === 180 && xAxis?.position === Position.Top) ||
          (chartRotation === -90 && yAxis?.position === Position.Right) ||
          (chartRotation === 90 && yAxis?.position === Position.Left);
        const orthoDimension = isHorizontalRotation(chartRotation) ? panelSize.height : panelSize.width;
        const outsideDim = annotationSpec.outsideDimension ?? getOutsideDimension(getAxisStyle(xAxis?.id ?? yAxis?.id));
        const rectDimensions = {
          ...xAndWidth,
          ...(outside
            ? {
                y: isLeftSide ? orthoDimension : -outsideDim,
                height: outsideDim,
              }
            : {
                y: 0,
                height: orthoDimension,
              }),
        };
        rectsProps.push({
          specId: annotationSpecId,
          rect: rectDimensions,
          datum,
        });
      }
      return;
    }

    const [y0, y1] = limitValueToDomainRange(yScale, initialY0, initialY1);
    // something is wrong with the data types, don't draw this annotation
    if (!Number.isFinite(y0) || !Number.isFinite(y1)) return;

    let scaledY1 = yScale.pureScale(y1);
    const scaledY0 = yScale.pureScale(y0);
    if (Number.isNaN(scaledY1) || Number.isNaN(scaledY0)) return;

    height = Math.abs(scaledY0 - scaledY1);
    // if the annotation height is 0 override it with the height from chart dimension and if the values in the domain are the same
    if (height === 0 && yScale.domain.length === 2 && yScale.domain[0] === yScale.domain[1]) {
      // eslint-disable-next-line prefer-destructuring
      height = panelSize.height;
      scaledY1 = 0;
    }

    const orthoDimension = isVerticalRotation(chartRotation) ? panelSize.height : panelSize.width;
    const isLeftSide =
      (chartRotation === 0 && yAxis?.position === Position.Left) ||
      (chartRotation === 180 && yAxis?.position === Position.Right) ||
      (chartRotation === -90 && xAxis?.position === Position.Bottom) ||
      (chartRotation === 90 && xAxis?.position === Position.Top);
    const outsideDim = annotationSpec.outsideDimension ?? getOutsideDimension(getAxisStyle(xAxis?.id ?? yAxis?.id));
    const rectDimensions = {
      ...(!isDefined(initialX0) && !isDefined(initialX1) && outside
        ? {
            x: isLeftSide ? -outsideDim : orthoDimension,
            width: outsideDim,
          }
        : xAndWidth),
      y: scaledY1,
      height,
    };

    rectsProps.push({
      specId: annotationSpecId,
      rect: rectDimensions,
      datum,
    });
  });

  return rectsProps.reduce<AnnotationRectProps[]>((acc, props, i) => {
    const duplicated: AnnotationRectProps[] = [];
    smallMultiplesScales.vertical.domain.forEach((vDomainValue) => {
      smallMultiplesScales.horizontal.domain.forEach((hDomainValue) => {
        const id = getAnnotationRectPropsId(annotationSpecId, props.datum, i, vDomainValue, hDomainValue);
        const top = smallMultiplesScales.vertical.scale(vDomainValue);
        const left = smallMultiplesScales.horizontal.scale(hDomainValue);
        if (Number.isNaN(top + left)) return;
        const panel = { ...panelSize, top, left };
        duplicated.push({ ...props, panel, id });
      });
    });
    return acc.concat(duplicated);
  }, []);
}

function scaleXonBandScale(
  xScale: ScaleBand,
  x0: string | number,
  x1: string | number,
): { x: number; width: number } | null {
  // the band scale return the start of the band, we need to cover
  // also the inner padding of the bar
  const padding = (xScale.step - xScale.originalBandwidth) / 2;
  let scaledX1 = xScale.scale(x1);
  let scaledX0 = xScale.scale(x0);
  if (Number.isNaN(scaledX1 + scaledX0)) {
    return null;
  }
  // extend the x1 scaled value to fully cover the last bar
  scaledX1 += xScale.originalBandwidth + padding;
  // give the x1 value a maximum of the chart range
  if (scaledX1 > xScale.range[1]) {
    scaledX1 = xScale.range[1];
  }

  scaledX0 -= padding;
  if (scaledX0 < xScale.range[0]) {
    scaledX0 = xScale.range[0];
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
  const scaledX1 =
    xScale.totalBarsInCluster > 0 && !isHistogramModeEnabled ? xScale.scale(x1 + xScale.minInterval) : xScale.scale(x1);
  // the width needs to be computed before adjusting the x anchor
  const width = Math.abs(scaledX1 - scaledX0);
  return Number.isNaN(width)
    ? null
    : { width, x: scaledX0 - (xScale.bandwidthPadding / 2) * xScale.totalBarsInCluster };
}

/**
 * This function extend and limits the values in a scale domain
 * @param scale the scale
 * @param minValue a min value
 * @param maxValue a max value
 * @param isHistogram
 */
function limitValueToDomainRange(
  scale: ScaleBand | ScaleContinuous,
  minValue?: PrimitiveValue,
  maxValue?: PrimitiveValue,
  isHistogram = false,
): [PrimitiveValue, PrimitiveValue] {
  if (isContinuousScale(scale)) {
    const [domainStartValue, domainEndValue] = scale.domain;
    const min = maxOf(domainStartValue, minValue);
    const max = minOf(isHistogram ? domainEndValue + scale.minInterval : domainEndValue, maxValue);
    // extend to edge values if values are null/undefined
    return min !== null && max !== null && min > max ? [null, null] : [min, max];
  } else {
    const min = isNil(minValue) || !scale.domain.includes(minValue) ? scale.domain[0] : minValue;
    const max = isNil(maxValue) || !scale.domain.includes(maxValue) ? scale.domain.at(-1) : maxValue;
    return [min ?? null, max ?? null];
  }
}

function minOf(base: number, value?: number | string | null | undefined): number | string {
  return typeof value === 'number' ? Math.min(value, base) : typeof value === 'string' ? value : base;
}

function maxOf(base: number, value: number | string | null | undefined): number | string {
  return typeof value === 'number' ? Math.max(value, base) : typeof value === 'string' ? value : base;
}

function getOutsideDimension({ tickLine: { visible, size } }: AxisStyle): number {
  return visible ? size : 0;
}

/**
 * @internal
 */
export function getAnnotationRectPropsId(
  specId: string,
  datum: RectAnnotationDatum,
  index: number,
  verticalValue: number | string,
  horizontalValue: number | string,
) {
  return [specId, verticalValue, horizontalValue, ...Object.values(datum.coordinates), datum.details, index].join('__');
}
