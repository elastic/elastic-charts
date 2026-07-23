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

const measureAlongAxisOverflow = (
  isVertical: boolean,
  leadingFraction: number,
  layouts: AxisTick['layout'][],
  scale?: ScaleBand | ScaleContinuous,
  ticks?: AxisTick[],
): { leading: number; trailing: number } => {
  const sizeOf = (layout?: AxisTick['layout']) => (isVertical ? layout?.bboxHeight : layout?.bboxWidth) ?? 0;

  // If the scale and ticks are known, we can measure the overflow of the edge labels.
  if (scale && ticks) {
    const [min, max] = [Math.min(scale.range[0], scale.range[1]), Math.max(scale.range[0], scale.range[1])];
    return ticks.reduce(
      (acc, tick) => {
        const size = sizeOf(tick.layout);
        // Ticks generated past the range end (e.g. band/histogram centering offset) would otherwise be read as a
        // large overhang, so clamp the anchor to the range before measuring how far the label spills past each edge.
        const position = Math.min(max, Math.max(min, tick.position));
        return {
          leading: Math.max(acc.leading, leadingFraction * size - (position - min)),
          trailing: Math.max(acc.trailing, (1 - leadingFraction) * size - (max - position)),
        };
      },
      { leading: 0, trailing: 0 },
    );
  }

  // If the scale and ticks are not known, we assume the first/last label sits at the range end.
  const axisPadding = scale && isBandScale(scale) ? scale.outerPadding * scale.step + scale.bandwidth / 2 : 0;
  return {
    leading: Math.max(0, sizeOf(layouts.at(0)) * leadingFraction - axisPadding),
    trailing: Math.max(0, sizeOf(layouts.at(-1)) * (1 - leadingFraction) - axisPadding),
  };
};

/** @internal */
export const getAxesDimensions = (
  theme: Theme,
  axes: Array<{
    spec: AxisSpec;
    style: AxisStyle;
    layouts: AxisTick['layout'][];
    ticks?: AxisTick[];
    layout: AxisLayoutContext;
    scale?: ScaleBand | ScaleContinuous;
    isHidden?: boolean;
  }>,
): PerSideDistance & { margin: { left: number } } => {
  const { chartMargins } = theme;

  const sizes = axes.reduce(
    (acc, { spec, style, layouts, ticks, layout, scale, isHidden }) => {
      if (isHidden) return acc;
      const isVertical = isVerticalAxis(spec.position);
      const extent = measureAxisBand(spec, style, layouts, layout);

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

      // For adjusting the overflow how much the edge ticks can overflow, based on the alignment of the tick label.
      // centered/middle = 0.5, left/top (start) = 0, right/bottom (end) = 1.
      const leadingFraction = isVertical
        ? verticalAlignFraction(
            getVerticalAlign(spec.position, style.tickLabel.rotation, style.tickLabel.alignment.vertical),
          )
        : horizontalAlignFraction(
            getHorizontalAlign(spec.position, style.tickLabel.rotation, style.tickLabel.alignment.horizontal),
          );

      // Overflow accounts for the edge tick labels spilling along the axis direction.
      // When multiple axes share an overflow side, the larger contribution wins.
      const { leading, trailing } = measureAlongAxisOverflow(isVertical, leadingFraction, layouts, scale, ticks);
      if (isVertical) {
        acc.overflow.top = Math.max(acc.overflow.top, leading);
        acc.overflow.bottom = Math.max(acc.overflow.bottom, trailing);
        // Multilayer time axes are skipped, labels are anchored at start and drops end labels that don't fit.
      } else if (!layout.multilayerTimeAxis) {
        acc.overflow.left = Math.max(acc.overflow.left, leading);
        acc.overflow.right = Math.max(acc.overflow.right, trailing);
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
