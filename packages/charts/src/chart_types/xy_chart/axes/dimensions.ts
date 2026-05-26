/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getMaxLabelDimensions } from './tick_labels';
import type { ScaleType } from '../../../scales/constants';
import type { SmallMultiplesSpec } from '../../../specs';
import type { Rotation } from '../../../utils/common';
import { Position } from '../../../utils/common';
import type { PerSideDistance } from '../../../utils/dimensions';
import { innerPad, outerPad } from '../../../utils/dimensions';
import type { AxisStyle, Theme } from '../../../utils/themes/theme';
import { isVerticalAxis } from '../utils/axis_type_utils';
import type { AxisTick } from '../utils/axis_utils';
import { getAllAxisLayersGirth, getTitleDimension, isMultilayerTimeAxis, shouldShowTicks } from '../utils/axis_utils';
import type { AxisSpec } from '../utils/specs';

/** @internal */
export const measureAxisStatic = (spec: AxisSpec, style: AxisStyle, hasPanelTitle: boolean = false): number => {
  const ticks = shouldShowTicks(style.tickLine, spec.hide) ? style.tickLine.size + style.tickLine.padding : 0;
  const padding = style.tickLabel.visible ? innerPad(style.tickLabel.padding) + outerPad(style.tickLabel.padding) : 0;
  const title = spec.title ? getTitleDimension(style.axisTitle) : 0;
  const panel = hasPanelTitle ? getTitleDimension(style.axisPanelTitle) : 0;

  return ticks + padding + title + panel;
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
): PerSideDistance & { margin: { left: number } } => {
  const sizes = axes.reduce(
    (acc, { spec, style, ticks, isHidden }) => {
      if (isHidden) return acc;
      const isVertical = isVerticalAxis(spec.position);

      const hasPanelTitle = isVertical ? smSpec?.splitVertically : smSpec?.splitHorizontally;
      const staticBand = measureAxisStatic(spec, style, Boolean(hasPanelTitle));

      const maxLabelDimensions = getMaxLabelDimensions(ticks);

      const labelLayersBand = style.tickLabel.visible
        ? getAllAxisLayersGirth(
            spec.timeAxisLayerCount,
            isVertical ? maxLabelDimensions.bboxWidth : maxLabelDimensions.bboxHeight,
            isMultilayerTimeAxis(spec, xScaleType, rotation),
          )
        : 0;

      const axisBand = staticBand + labelLayersBand;

      switch (spec.position) {
        case Position.Top:
          acc.top += axisBand;
          break;
        case Position.Bottom:
          acc.bottom += axisBand;
          break;
        case Position.Left:
          acc.left += axisBand;
          break;
        case Position.Right:
          acc.right += axisBand;
          break;
      }

      // space for labels, but coarse estimation. adjust after placing ticks?
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
    top: Math.min(
      Math.max(sizes.top, theme.chartMargins.top + sizes.overflow.top),
      theme.axes.maxSize?.top ?? Infinity,
    ),
    bottom: Math.min(
      Math.max(sizes.bottom, theme.chartMargins.bottom + sizes.overflow.bottom),
      theme.axes.maxSize?.bottom ?? Infinity,
    ),
    left: Math.min(
      Math.max(sizes.left, theme.chartMargins.left + sizes.overflow.left),
      theme.axes.maxSize?.left ?? Infinity,
    ),
    right: Math.min(
      Math.max(sizes.right, theme.chartMargins.right + sizes.overflow.right),
      theme.axes.maxSize?.right ?? Infinity,
    ),
    margin: {
      left: 0, // TODO(bia): check why we needed this before
    },
  };
};
