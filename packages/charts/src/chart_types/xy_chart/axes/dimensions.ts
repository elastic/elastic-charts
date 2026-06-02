/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { TickLabelBox } from './ticks/labels';
import { getMaxLabelDimensions } from './ticks/labels';
import type { AxisTick } from './ticks/types';
import type { Pixels } from '../../../common/geometry';
import type { ScaleBand, ScaleContinuous } from '../../../scales';
import type { SmallMultiplesSpec } from '../../../specs';
import { getPercentageValue, Position } from '../../../utils/common';
import { innerPad, outerPad, type PerSideDistance } from '../../../utils/dimensions';
import type { AxisStyle, Theme } from '../../../utils/themes/theme';
import { isVerticalAxis } from '../utils/axis_type_utils';
import { shouldShowTicks } from '../utils/axis_utils';
import type { AxisSpec } from '../utils/specs';

/** @internal */
export const hasPanelTitle = (position: Position, smSpec: SmallMultiplesSpec | null): boolean =>
  Boolean(isVerticalAxis(position) ? smSpec?.splitVertically : smSpec?.splitHorizontally);

/** @internal */
export const measureAxisFixedBand = (
  spec: Pick<AxisSpec, 'title' | 'hide'>,
  style: AxisStyle,
  includePanelTitle: boolean = false,
): number => {
  const ticks = shouldShowTicks(style.tickLine, spec.hide) ? style.tickLine.size + style.tickLine.padding : 0;
  const padding = style.tickLabel.visible ? innerPad(style.tickLabel.padding) + outerPad(style.tickLabel.padding) : 0;
  const title = spec.title ? getTitleDimension(style.axisTitle) : 0;
  const panel = includePanelTitle ? getTitleDimension(style.axisPanelTitle) : 0;

  return ticks + padding + title + panel;
};

/** @internal */
export function getTitleDimension({
  visible,
  fontSize,
  padding,
}: AxisStyle['axisTitle'] | AxisStyle['axisPanelTitle']): number {
  return visible && fontSize > 0 ? innerPad(padding) + fontSize + outerPad(padding) : 0;
}

/** @internal */
export const getAllAxisLayersGirth = (
  timeAxisLayerCount: number,
  maxLabelBoxGirth: number,
  multilayerTimeAxis: boolean,
) => {
  const axisLayerCount = timeAxisLayerCount > 0 && multilayerTimeAxis ? timeAxisLayerCount : 1;
  return axisLayerCount * maxLabelBoxGirth;
};

const resolveExtentPx = (value: Pixels | string | undefined, crossAxisContainerSize: number): number | undefined => {
  if (value === undefined) return undefined;
  const px = getPercentageValue(value, crossAxisContainerSize, 0);
  return px > 0 ? px : undefined;
};

/** @internal */
export const getAxisBand = (
  position: Position,
  style: AxisStyle,
  fixed: number,
  containerWidth: number,
  containerHeight: number,
) => {
  const container = isVerticalAxis(position) ? containerWidth : containerHeight;
  const maxExtent = resolveExtentPx(style.maxExtent, container) ?? container;
  const minExtent = resolveExtentPx(style.minExtent, container) ?? 0;
  const labelBudget = Math.max(0, maxExtent - fixed);
  return { maxExtent, minExtent, labelBudget, fixed, container };
};

type AxisBand = ReturnType<typeof getAxisBand>;

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
  band,
  scale,
}: {
  position: Position;
  style: AxisStyle;
  band: AxisBand;
  scale: ScaleBand | ScaleContinuous;
}) => {
  const vertical = isVerticalAxis(position);

  let maxLineLength: number;
  if (vertical) {
    maxLineLength = Math.min(style.tickLabel.limit ?? band.labelBudget, band.labelBudget, band.container);
  } else {
    const bandwidthCap = scale.bandwidth > 0 ? scale.bandwidth + scale.barsPadding / 2 : band.maxExtent;
    const limit = style.tickLabel.limit ?? bandwidthCap;
    maxLineLength = Math.min(limit, bandwidthCap, band.container);
  }

  const lineHeightPx = style.tickLabel.lineHeight * style.tickLabel.fontSize;
  let maxWrapLines = style.tickLabel.wrapLines;
  if (!vertical && lineHeightPx > 0 && band.labelBudget > 0) {
    const maxWrapFromBudget = Math.max(1, Math.floor(band.labelBudget / lineHeightPx));
    maxWrapLines = Math.min(style.tickLabel.wrapLines, maxWrapFromBudget);
  }

  return { maxLineLength, maxWrapLines };
};

/** @internal */
export const computeAxisBandSize = (
  spec: AxisSpec,
  style: AxisStyle,
  ticks: TickLabelBox[],
  layout: AxisLayoutContext,
): number => {
  const vertical = isVerticalAxis(spec.position);
  const { band, multilayerTimeAxis } = layout;
  const maxLabelDimensions = getMaxLabelDimensions(ticks);
  const maxLabelSize = vertical ? maxLabelDimensions.bboxWidth : maxLabelDimensions.bboxHeight;

  const labelSize = Math.min(maxLabelSize, band.labelBudget);
  const labelLayersBand = style.tickLabel.visible
    ? getAllAxisLayersGirth(spec.timeAxisLayerCount, labelSize, multilayerTimeAxis)
    : 0;
  const axisBand = band.fixed + labelLayersBand;

  return Math.min(band.maxExtent, Math.max(axisBand, band.minExtent));
};

/** @internal */
export type AxisLayoutContext = {
  band: AxisBand;
  multilayerTimeAxis: boolean;
};

/** @internal */
export const getAxesDimensions = (
  theme: Theme,
  axes: Array<{
    spec: AxisSpec;
    style: AxisStyle;
    ticks: AxisTick['layout'][];
    layout: AxisLayoutContext;
    isHidden?: boolean;
  }>,
): PerSideDistance & { margin: { left: number } } => {
  const sizes = axes.reduce(
    (acc, { spec, style, ticks, layout, isHidden }) => {
      if (isHidden) return acc;
      const isVertical = isVerticalAxis(spec.position);

      const extent = computeAxisBandSize(spec, style, ticks, layout);

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
      // TODO(bia): depending on alignment/rotation, might not be just half of the bbox
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
