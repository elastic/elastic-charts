/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getHorizontalAlign, getVerticalAlign, horizontalAlignFraction, verticalAlignFraction } from './ticks/geometry';
import type { TickLabelBox } from './ticks/labels';
import { getMaxLabelDimensions } from './ticks/labels';
import type { AxisTick } from './ticks/types';
import type { Pixels } from '../../../common/geometry';
import type { ScaleBand, ScaleContinuous } from '../../../scales';
import { isBandScale } from '../../../scales/types';
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

const getAllAxisLayersGirth = (timeAxisLayerCount: number, maxLabelBoxGirth: number, multilayerTimeAxis: boolean) => {
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

/** @internal */
export type AxisBand = ReturnType<typeof getAxisBand>;

/** @internal */
export const measureAxisBand = (
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
    scale?: ScaleBand | ScaleContinuous;
    isHidden?: boolean;
  }>,
): PerSideDistance & { margin: { left: number } } => {
  const { chartMargins } = theme;

  const sizes = axes.reduce(
    (acc, { spec, style, ticks, layout, scale, isHidden }) => {
      if (isHidden) return acc;
      const isVertical = isVerticalAxis(spec.position);
      const extent = measureAxisBand(spec, style, ticks, layout);

      switch (spec.position) {
        case Position.Top:
          acc.top += extent + chartMargins.top;
          break;
        case Position.Bottom:
          acc.bottom += extent + chartMargins.bottom;
          break;
        case Position.Left:
          acc.left += extent + chartMargins.left;
          break;
        case Position.Right:
          acc.right += extent + chartMargins.right;
          break;
      }

      // The spilled amount depends on how the label is anchored to the tick, the first tick spills
      // `fraction x bbox` and the last tick spills `(1 - fraction) x bbox`
      const leadingFraction = isVertical
        ? verticalAlignFraction(
            getVerticalAlign(spec.position, style.tickLabel.rotation, style.tickLabel.alignment.vertical),
          )
        : horizontalAlignFraction(
            getHorizontalAlign(spec.position, style.tickLabel.rotation, style.tickLabel.alignment.horizontal),
          );

      let axisPadding = 0;

      if (scale && isBandScale(scale)) {
        axisPadding = scale.outerPadding * scale.step + scale.bandwidth / 2;
      }
      // Overflow accounts for the first/last tick label spilling along the axis direction (orthogonal to
      // the extent we just added). When multiple axes share an overflow side, the larger contribution wins.
      if (isVertical) {
        const top = Math.max(0, (ticks.at(0)?.bboxHeight ?? 0) * leadingFraction - axisPadding);
        const bottom = Math.max(0, (ticks.at(-1)?.bboxHeight ?? 0) * (1 - leadingFraction) - axisPadding);
        acc.overflow.top = Math.max(acc.overflow.top, top);
        acc.overflow.bottom = Math.max(acc.overflow.bottom, bottom);
        // Multilayer time axes are skipped, labels are anchored at start and drops end labels that don't fit.
      } else if (!layout.multilayerTimeAxis) {
        const left = Math.max(0, (ticks.at(0)?.bboxWidth ?? 0) * leadingFraction - axisPadding);
        const right = Math.max(0, (ticks.at(-1)?.bboxWidth ?? 0) * (1 - leadingFraction) - axisPadding);
        acc.overflow.left = Math.max(acc.overflow.left, left);
        acc.overflow.right = Math.max(acc.overflow.right, right);
      }

      return acc;
    },
    {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      overflow: { top: 0, bottom: 0, left: 0, right: 0 },
    },
  );

  const left = Math.max(sizes.overflow.left + chartMargins.left, sizes.left);
  const right = Math.max(sizes.overflow.right + chartMargins.right, sizes.right);
  const top = Math.max(sizes.overflow.top + chartMargins.top, sizes.top);
  const bottom = Math.max(sizes.overflow.bottom + chartMargins.bottom, sizes.bottom);

  return {
    top,
    bottom,
    left,
    right,
    margin: {
      left: left - sizes.left,
    },
  };
};
