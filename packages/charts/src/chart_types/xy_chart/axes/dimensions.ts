/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { TickLabelBox } from './tick_labels';
import { getMaxLabelDimensions } from './tick_labels';
import type { Pixels } from '../../../common/geometry';
import type { ScaleBand, ScaleContinuous } from '../../../scales';
import type { ScaleType } from '../../../scales/constants';
import type { SmallMultiplesSpec } from '../../../specs';
import type { Rotation } from '../../../utils/common';
import { getPercentageValue, Position } from '../../../utils/common';
import { innerPad, outerPad, type PerSideDistance } from '../../../utils/dimensions';
import type { AxisStyle, Theme } from '../../../utils/themes/theme';
import { isVerticalAxis } from '../utils/axis_type_utils';
import {
  getAllAxisLayersGirth,
  getTitleDimension,
  isMultilayerTimeAxis,
  shouldShowTicks,
  type AxisTick,
} from '../utils/axis_utils';
import type { AxisSpec } from '../utils/specs';

/** @internal */
export const measureAxisStatic = (
  spec: Pick<AxisSpec, 'title' | 'hide'>,
  style: AxisStyle,
  hasPanelTitle: boolean = false,
): number => {
  const ticks = shouldShowTicks(style.tickLine, spec.hide) ? style.tickLine.size + style.tickLine.padding : 0;
  const padding = style.tickLabel.visible ? innerPad(style.tickLabel.padding) + outerPad(style.tickLabel.padding) : 0;
  const title = spec.title ? getTitleDimension(style.axisTitle) : 0;
  const panel = hasPanelTitle ? getTitleDimension(style.axisPanelTitle) : 0;

  return ticks + padding + title + panel;
};

const resolveExtentPx = (value: Pixels | string | undefined, crossAxisContainerSize: number): number | undefined => {
  if (value === undefined) return undefined;
  const px = getPercentageValue(value, crossAxisContainerSize, 0);
  return px > 0 ? px : undefined;
};

type AxisExtentBounds = {
  maxExtentPx: number;
  minExtentPx: number;
  labelBudget: number;
  staticBand: number;
  container: number;
};

/** @internal */
export const getExtentBounds = (
  position: Position,
  style: AxisStyle,
  staticBand: number,
  containerWidth: number,
  containerHeight: number,
): AxisExtentBounds => {
  const container = isVerticalAxis(position) ? containerWidth : containerHeight;
  const maxExtentPx = resolveExtentPx(style.maxExtent, container) ?? Infinity;
  const minExtentPx = resolveExtentPx(style.minExtent, container) ?? 0;
  const labelBudget = Math.max(0, maxExtentPx - staticBand);
  return { maxExtentPx, minExtentPx, labelBudget, staticBand, container };
};

/** @internal */
type TickLabelConstraints = {
  maxLineLength: number;
  maxWrapLines: number;
  bounds: AxisExtentBounds;
};

/**
 * Resolve `tickLabel.limit`, `tickLabel.wrapLines` and `maxExtent` into the
 * effective maximum line width and number of wrap lines that should be passed to the wrap
 * pipeline. `maxExtent` wins over `limit` and over `wrapLines`.
 *
 * - Vertical axes (left/right): cross-axis = width.
 *   `effectiveLineLimit = min(limit ?? labelBudget, labelBudget)`.
 * - Horizontal axes (top/bottom): line width is also capped by band width.
 *   `effectiveWrapLines = min(wrapLines, floor(labelBudget / lineHeightPx))`
 *   so the total wrapped height fits inside `maxExtent`.
 * @internal
 */
export const resolveTickLabelConstraints = ({
  position,
  style,
  staticBand,
  containerWidth,
  containerHeight,
  scale,
}: {
  position: Position;
  style: AxisStyle;
  staticBand: number;
  containerWidth: number;
  containerHeight: number;
  scale: ScaleBand | ScaleContinuous;
}): TickLabelConstraints => {
  const bounds = getExtentBounds(position, style, staticBand, containerWidth, containerHeight);
  const vertical = isVerticalAxis(position);

  let maxLineLength: number;
  if (vertical) {
    maxLineLength = Math.min(style.tickLabel.limit ?? bounds.labelBudget, bounds.labelBudget, bounds.container);
  } else {
    const bandLineCap = scale.bandwidth > 0 ? scale.bandwidth + scale.barsPadding / 2 : bounds.maxExtentPx;
    const limit = style.tickLabel.limit ?? bandLineCap;
    maxLineLength = Math.min(limit, bandLineCap, bounds.container);
  }

  const lineHeightPx = style.tickLabel.lineHeight * style.tickLabel.fontSize;
  let maxWrapLines = style.tickLabel.wrapLines;
  if (!vertical && lineHeightPx > 0 && bounds.labelBudget > 0) {
    const maxWrapFromBudget = Math.max(1, Math.floor(bounds.labelBudget / lineHeightPx));
    maxWrapLines = Math.min(style.tickLabel.wrapLines, maxWrapFromBudget);
  }

  return { maxLineLength, maxWrapLines, bounds };
};

const computeAxisExtent = (
  spec: AxisSpec,
  style: AxisStyle,
  ticks: TickLabelBox[],
  staticBand: number,
  containerWidth: number,
  containerHeight: number,
  xScaleType: ScaleType,
  rotation: Rotation,
): number => {
  const vertical = isVerticalAxis(spec.position);

  const { maxExtentPx, minExtentPx, labelBudget } = getExtentBounds(
    spec.position,
    style,
    staticBand,
    containerWidth,
    containerHeight,
  );

  const maxLabelDimensions = getMaxLabelDimensions(ticks);
  const rawGirth = vertical ? maxLabelDimensions.bboxWidth : maxLabelDimensions.bboxHeight;
  const cappedGirth = Math.min(rawGirth, labelBudget);

  const labelLayersBand = style.tickLabel.visible
    ? getAllAxisLayersGirth(spec.timeAxisLayerCount, cappedGirth, isMultilayerTimeAxis(spec, xScaleType, rotation))
    : 0;

  const axisBand = staticBand + labelLayersBand;
  return Math.min(maxExtentPx, Math.max(axisBand, minExtentPx));
};

/** @internal */
export const getAxesDimensions = (
  theme: Theme,
  axes: Array<{
    spec: AxisSpec;
    style: AxisStyle;
    ticks: AxisTick['layout'][];
    isHidden?: boolean;
  }>,
  smSpec: SmallMultiplesSpec | null,
  xScaleType: ScaleType,
  rotation: Rotation,
  containerWidth: number,
  containerHeight: number,
): PerSideDistance & { margin: { left: number } } => {
  const sizes = axes.reduce(
    (acc, { spec, style, ticks, isHidden }) => {
      if (isHidden) return acc;
      const isVertical = isVerticalAxis(spec.position);

      const hasPanelTitle = isVertical ? smSpec?.splitVertically : smSpec?.splitHorizontally;
      const staticBand = measureAxisStatic(spec, style, Boolean(hasPanelTitle));

      const extent = computeAxisExtent(
        spec,
        style,
        ticks,
        staticBand,
        containerWidth,
        containerHeight,
        xScaleType,
        rotation,
      );

      switch (spec.position) {
        case Position.Top:
          acc.top += extent;
          break;
        case Position.Bottom:
          acc.bottom += extent;
          break;
        case Position.Left:
          acc.left += extent;
          break;
        case Position.Right:
          acc.right += extent;
          break;
      }

      /* Overflow accounts for the first/last tick label spilling along the axis direction (orthogonal to 
      the extent we just added) */
      if (isVertical) {
        acc.overflow.top += (ticks.at(-1)?.bboxHeight ?? 0) / 2;
        acc.overflow.bottom += (ticks.at(0)?.bboxHeight ?? 0) / 2;
      } else {
        acc.overflow.left += (ticks.at(-1)?.bboxWidth ?? 0) / 2;
        acc.overflow.right += (ticks.at(0)?.bboxWidth ?? 0) / 2;
      }

      return acc;
    },
    {
      top: theme.chartMargins.top,
      bottom: theme.chartMargins.bottom,
      left: theme.chartMargins.left,
      right: theme.chartMargins.right,
      overflow: { top: 0, bottom: 0, left: 0, right: 0 },
    },
  );

  return {
    top: Math.max(sizes.top, theme.chartMargins.top + sizes.overflow.top),
    bottom: Math.max(sizes.bottom, theme.chartMargins.bottom + sizes.overflow.bottom),
    left: Math.max(sizes.left, theme.chartMargins.left + sizes.overflow.left),
    right: Math.max(sizes.right, theme.chartMargins.right + sizes.overflow.right),
    margin: {
      left: 0, // TODO(bia): check why we needed this before, do we still need it?
    },
  };
};
