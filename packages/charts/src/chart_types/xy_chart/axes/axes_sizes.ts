/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ScaleType } from '../../../scales/constants';
import { SmallMultiplesSpec } from '../../../specs';
import { Position, Rotation } from '../../../utils/common';
import { innerPad, outerPad, PerSideDistance } from '../../../utils/dimensions';
import { AxisId } from '../../../utils/ids';
import { AxisStyle, Theme } from '../../../utils/themes/theme';
import { AxesTicksDimensions } from '../state/selectors/compute_axis_ticks_dimensions';
import { getSpecsById } from '../state/utils/spec';
import { isHorizontalAxis, isVerticalAxis } from '../utils/axis_type_utils';
import {
  getAllAxisLayersGirth,
  getTitleDimension,
  isMultilayerTimeAxis,
  shouldShowTicks,
  TickLabelBounds,
} from '../utils/axis_utils';
import { AxisSpec } from '../utils/specs';

const getAxisSizeForLabel = (
  axisSpec: AxisSpec,
  { axes: sharedAxesStyles, chartMargins }: Theme,
  axesStyles: Map<AxisId, AxisStyle | null>,
  { maxLabelBboxWidth = 0, maxLabelBboxHeight = 0 }: TickLabelBounds,
  smSpec: SmallMultiplesSpec | null,
  multilayerTimeAxis: boolean,
) => {
  const { tickLine, axisTitle, axisPanelTitle, tickLabel } = axesStyles.get(axisSpec.id) ?? sharedAxesStyles;
  const horizontal = isHorizontalAxis(axisSpec.position);
  const maxLabelBoxGirth = horizontal ? maxLabelBboxHeight : maxLabelBboxWidth;
  const allLayersGirth = getAllAxisLayersGirth(axisSpec.timeAxisLayerCount, maxLabelBoxGirth, multilayerTimeAxis);
  const hasPanelTitle = isVerticalAxis(axisSpec.position) ? smSpec?.splitVertically : smSpec?.splitHorizontally;
  const panelTitleDimension = hasPanelTitle ? getTitleDimension(axisPanelTitle) : 0;
  const titleDimension = axisSpec.title ? getTitleDimension(axisTitle) : 0;
  const tickDimension = shouldShowTicks(tickLine, axisSpec.hide) ? tickLine.size + tickLine.padding : 0;
  const labelPaddingSum = tickLabel.visible ? innerPad(tickLabel.padding) + outerPad(tickLabel.padding) : 0;
  const axisDimension = labelPaddingSum + tickDimension + titleDimension + panelTitleDimension;
  const maxAxisGirth = axisDimension + (tickLabel.visible ? allLayersGirth : 0);
  // gives space to longer labels: if vertical use half of the label height, if horizontal, use half of the max label (not ideal)
  // don't overflow when the multiTimeAxis layer is used.
  const maxLabelBoxHalfLength = isVerticalAxis(axisSpec.position)
    ? maxLabelBboxHeight / 2
    : multilayerTimeAxis
      ? 0
      : maxLabelBboxWidth / 2;
  return horizontal
    ? {
        top: axisSpec.position === Position.Top ? maxAxisGirth + chartMargins.top : 0,
        bottom: axisSpec.position === Position.Bottom ? maxAxisGirth + chartMargins.bottom : 0,
        left: maxLabelBoxHalfLength,
        right: maxLabelBoxHalfLength,
      }
    : {
        top: maxLabelBoxHalfLength,
        bottom: maxLabelBoxHalfLength,
        left: axisSpec.position === Position.Left ? maxAxisGirth + chartMargins.left : 0,
        right: axisSpec.position === Position.Right ? maxAxisGirth + chartMargins.right : 0,
      };
};

/** @internal */
export function getAxesDimensions(
  theme: Theme,
  axisDimensions: AxesTicksDimensions,
  axesStyles: Map<AxisId, AxisStyle | null>,
  axisSpecs: AxisSpec[],
  smSpec: SmallMultiplesSpec | null,
  xScaleType: ScaleType,
  rotation: Rotation,
): PerSideDistance & { margin: { left: number } } {
  const sizes = [...axisDimensions].reduce(
    (acc, [id, tickLabelBounds]) => {
      const axisSpec = getSpecsById<AxisSpec>(axisSpecs, id);
      if (tickLabelBounds.isHidden || !axisSpec) return acc;
      const multilayerTimeAxis = isMultilayerTimeAxis(axisSpec, xScaleType, rotation);
      // TODO use first and last labels
      const { top, bottom, left, right } = getAxisSizeForLabel(
        axisSpec,
        theme,
        axesStyles,
        tickLabelBounds,
        smSpec,
        multilayerTimeAxis,
      );
      if (isVerticalAxis(axisSpec.position)) {
        acc.axisLabelOverflow.top = Math.max(acc.axisLabelOverflow.top, top);
        acc.axisLabelOverflow.bottom = Math.max(acc.axisLabelOverflow.bottom, bottom);
        acc.axisMainSize.left += left;
        acc.axisMainSize.right += right;
      } else {
        // find the max half label size to accommodate the left/right labels
        acc.axisMainSize.top += top;
        acc.axisMainSize.bottom += bottom;
        acc.axisLabelOverflow.left = Math.max(acc.axisLabelOverflow.left, left);
        acc.axisLabelOverflow.right = Math.max(acc.axisLabelOverflow.right, right);
      }
      return acc;
    },
    {
      axisMainSize: { left: 0, right: 0, top: 0, bottom: 0 },
      axisLabelOverflow: { left: 0, right: 0, top: 0, bottom: 0 },
    },
  );

  const left = Math.max(sizes.axisLabelOverflow.left + theme.chartMargins.left, sizes.axisMainSize.left);
  const right = Math.max(sizes.axisLabelOverflow.right + theme.chartMargins.right, sizes.axisMainSize.right);
  const top = Math.max(sizes.axisLabelOverflow.top + theme.chartMargins.top, sizes.axisMainSize.top);
  const bottom = Math.max(sizes.axisLabelOverflow.bottom + theme.chartMargins.bottom, sizes.axisMainSize.bottom);
  return { left, right, top, bottom, margin: { left: left - sizes.axisMainSize.left } };
}
