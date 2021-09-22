/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SmallMultiplesSpec } from '../../../specs';
import { Position } from '../../../utils/common';
import { innerPad, outerPad, PerSideDistance } from '../../../utils/dimensions';
import { AxisId } from '../../../utils/ids';
import { AxisStyle, Theme } from '../../../utils/themes/theme';
import { AxesTicksDimensions } from '../state/selectors/compute_axis_ticks_dimensions';
import { getSpecsById } from '../state/utils/spec';
import { isVerticalAxis } from '../utils/axis_type_utils';
import { getTitleDimension, shouldShowTicks } from '../utils/axis_utils';
import { AxisSpec } from '../utils/specs';

/** @internal */
export function getAxesDimensions(
  { axes: sharedAxesStyles, chartMargins }: Theme,
  axisDimensions: AxesTicksDimensions,
  axesStyles: Map<AxisId, AxisStyle | null>,
  axisSpecs: AxisSpec[],
  smSpec?: SmallMultiplesSpec,
): PerSideDistance & { margin: { left: number } } {
  const sizes = [...axisDimensions].reduce(
    (acc, [id, { maxLabelBboxWidth = 0, maxLabelBboxHeight = 0, isHidden }]) => {
      const axisSpec = getSpecsById<AxisSpec>(axisSpecs, id);
      if (isHidden || !axisSpec) return acc;
      const { tickLine, axisTitle, axisPanelTitle, tickLabel } = axesStyles.get(id) ?? sharedAxesStyles;
      const hasPanelTitle = isVerticalAxis(axisSpec.position) ? smSpec?.splitVertically : smSpec?.splitHorizontally;
      const panelTitleDimension = hasPanelTitle ? getTitleDimension(axisPanelTitle) : 0;
      const labelPaddingSum = tickLabel.visible ? innerPad(tickLabel.padding) + outerPad(tickLabel.padding) : 0;
      const titleDimension = axisSpec.title ? getTitleDimension(axisTitle) : 0;
      const tickDimension = shouldShowTicks(tickLine, axisSpec.hide) ? tickLine.size + tickLine.padding : 0;
      const axisDimension = labelPaddingSum + tickDimension + titleDimension + panelTitleDimension;
      // TODO use first and last labels
      if (isVerticalAxis(axisSpec.position)) {
        acc.axisLabelOverflow.top = Math.max(acc.axisLabelOverflow.top, maxLabelBboxHeight / 2);
        acc.axisLabelOverflow.bottom = Math.max(acc.axisLabelOverflow.bottom, maxLabelBboxHeight / 2);
        const maxAxisWidth = axisDimension + (tickLabel.visible ? maxLabelBboxWidth : 0);
        acc.axisMainSize.left += axisSpec.position === Position.Left ? maxAxisWidth + chartMargins.left : 0;
        acc.axisMainSize.right += axisSpec.position === Position.Right ? maxAxisWidth + chartMargins.right : 0;
      } else {
        // find the max half label size to accommodate the left/right labels
        acc.axisLabelOverflow.left = Math.max(acc.axisLabelOverflow.left, maxLabelBboxWidth / 2);
        acc.axisLabelOverflow.right = Math.max(acc.axisLabelOverflow.right, maxLabelBboxWidth / 2);
        const maxAxisHeight = axisDimension + (tickLabel.visible ? maxLabelBboxHeight : 0);
        acc.axisMainSize.top += axisSpec.position === Position.Top ? maxAxisHeight + chartMargins.top : 0;
        acc.axisMainSize.bottom += axisSpec.position === Position.Bottom ? maxAxisHeight + chartMargins.bottom : 0;
      }
      return acc;
    },
    {
      axisMainSize: { left: 0, right: 0, top: 0, bottom: 0 },
      axisLabelOverflow: { left: 0, right: 0, top: 0, bottom: 0 },
    },
  );

  const left = Math.max(sizes.axisLabelOverflow.left + chartMargins.left, sizes.axisMainSize.left);
  const right = Math.max(sizes.axisLabelOverflow.right + chartMargins.right, sizes.axisMainSize.right);
  const top = Math.max(sizes.axisLabelOverflow.top + chartMargins.top, sizes.axisMainSize.top);
  const bottom = Math.max(sizes.axisLabelOverflow.bottom + chartMargins.bottom, sizes.axisMainSize.bottom);
  return { left, right, top, bottom, margin: { left: left - sizes.axisMainSize.left } };
}
