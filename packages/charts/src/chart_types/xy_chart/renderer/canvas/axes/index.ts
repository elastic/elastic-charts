/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { withContext } from '../../../../../renderers/canvas';
import { Position } from '../../../../../utils/common';
import { Dimensions, Size } from '../../../../../utils/dimensions';
import { AxisId } from '../../../../../utils/ids';
import { Point } from '../../../../../utils/point';
import { AxisStyle } from '../../../../../utils/themes/theme';
import { PerPanelAxisGeoms } from '../../../state/selectors/compute_per_panel_axes_geoms';
import { getSpecsById } from '../../../state/utils/spec';
import { isHorizontalAxis } from '../../../utils/axis_type_utils';
import { AxisTick, AxisViewModel, shouldShowTicks } from '../../../utils/axis_utils';
import { AxisSpec } from '../../../utils/specs';
import { renderDebugRect } from '../utils/debug';
import { renderTitle } from './global_title';
import { renderLine } from './line';
import { renderPanelTitle } from './panel_title';
import { renderTick } from './tick';
import { renderTickLabel } from './tick_label';

/** @internal */
export interface AxisProps {
  panelTitle?: string | undefined;
  secondary?: boolean;
  panelAnchor: Point;
  axisStyle: AxisStyle;
  axisSpec: AxisSpec;
  size: Size;
  anchorPoint: Point;
  dimension: AxisViewModel;
  ticks: AxisTick[];
  debug: boolean;
  renderingArea: Dimensions;
}

/** @internal */
export interface AxesProps {
  axesSpecs: AxisSpec[];
  perPanelAxisGeoms: PerPanelAxisGeoms[];
  axesStyles: Map<string, AxisStyle | null>;
  sharedAxesStyle: AxisStyle;
  debug: boolean;
  renderingArea: Dimensions;
}

/** @internal */
export function renderAxes(ctx: CanvasRenderingContext2D, props: AxesProps) {
  const { axesSpecs, perPanelAxisGeoms, axesStyles, sharedAxesStyle, debug, renderingArea } = props;
  const seenAxesTitleIds = new Set<AxisId>();

  perPanelAxisGeoms.forEach(({ axesGeoms, panelAnchor }) => {
    axesGeoms.forEach((geometry) => {
      const {
        axis: { panelTitle, id, position, secondary },
        anchorPoint,
        size,
        dimension,
        visibleTicks: ticks,
        parentSize,
      } = geometry;
      const axisSpec = getSpecsById<AxisSpec>(axesSpecs, id);

      if (!axisSpec || !dimension || !position || axisSpec.hide) {
        return;
      }

      const axisStyle = axesStyles.get(axisSpec.id) ?? sharedAxesStyle;

      if (!seenAxesTitleIds.has(id)) {
        seenAxesTitleIds.add(id);
        renderTitle(ctx, { size: parentSize, debug, panelTitle, anchorPoint, dimension, axisStyle, axisSpec });
      }

      renderAxis(ctx, {
        panelTitle,
        secondary,
        panelAnchor,
        axisSpec,
        anchorPoint,
        size,
        dimension,
        ticks,
        axisStyle,
        debug,
        renderingArea,
      });
    });
  });
}

function renderAxis(ctx: CanvasRenderingContext2D, props: AxisProps) {
  const { ticks, size, anchorPoint, debug, axisStyle, axisSpec, panelAnchor, secondary } = props;
  const showTicks = shouldShowTicks(axisStyle.tickLine, axisSpec.hide);
  const { position } = axisSpec;
  const isHorizontal = isHorizontalAxis(position);
  const x = isHorizontal
    ? anchorPoint.x + panelAnchor.x
    : anchorPoint.x + (position === Position.Right ? -1 : 1) * panelAnchor.x;
  const y = isHorizontal
    ? anchorPoint.y + (position === Position.Top ? 1 : -1) * panelAnchor.y
    : anchorPoint.y + panelAnchor.y;

  withContext(ctx, (ctx) => {
    ctx.translate(x, y);

    if (debug && !secondary) {
      renderDebugRect(ctx, { x: 0, y: 0, ...size });
    }

    renderLine(ctx, props); // render the axis line

    // TODO: compute axis dimensions per panels
    // For now just rendering axis line
    if (secondary) return;

    if (showTicks) {
      ticks.forEach((tick) => renderTick(ctx, tick, props));
    }

    if (axisStyle.tickLabel.visible) {
      ticks.forEach((tick) => renderTickLabel(ctx, tick, showTicks, props));
    }

    const { panelTitle, dimension } = props;
    renderPanelTitle(ctx, { panelTitle, axisSpec, axisStyle, size, dimension, debug });
  });
}
