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
import { Dimensions, Size } from '../../../../../utils/dimensions';
import { Point } from '../../../../../utils/point';
import { AxisStyle } from '../../../../../utils/themes/theme';
import { PerPanelAxisGeoms } from '../../../state/selectors/compute_per_panel_axes_geoms';
import { getSpecsById } from '../../../state/utils/spec';
import { isVerticalAxis } from '../../../utils/axis_type_utils';
import { AxisGeometry, AxisTick, AxisTicksDimensions, shouldShowTicks } from '../../../utils/axis_utils';
import { AxisSpec } from '../../../utils/specs';
import { renderDebugRect } from '../utils/debug';
import { renderTitle } from './global_title';
import { renderLine } from './line';
import { renderPanelTitle } from './panel_title';
import { renderTick } from './tick';
import { renderTickLabel } from './tick_label';

/** @internal */
export interface AxisProps {
  title?: string;
  secondary?: boolean;
  panelAnchor: Point;
  axisStyle: AxisStyle;
  axisSpec: AxisSpec;
  size: Size;
  anchorPoint: Point;
  dimension: AxisTicksDimensions;
  ticks: AxisTick[];
  debug: boolean;
  renderingArea: Dimensions;
}

/** @internal */
export interface AxesProps {
  axesSpecs: AxisSpec[];
  perPanelAxisGeoms: PerPanelAxisGeoms[];
  axesGeoms: AxisGeometry[];
  axesStyles: Map<string, AxisStyle | null>;
  sharedAxesStyle: AxisStyle;
  debug: boolean;
  renderingArea: Dimensions;
}

/** @internal */
export function renderAxes(ctx: CanvasRenderingContext2D, props: AxesProps) {
  const { axesSpecs, perPanelAxisGeoms, axesStyles, sharedAxesStyle, debug, renderingArea } = props;

  renderGlobalTitles(ctx, props);

  perPanelAxisGeoms.forEach(({ axesGeoms, panelAnchor }) => {
    withContext(ctx, (ctx) => {
      axesGeoms.forEach((geometry) => {
        const {
          axis: { title, id, position, secondary },
          anchorPoint,
          size,
          dimension,
          visibleTicks: ticks,
        } = geometry;
        const axisSpec = getSpecsById<AxisSpec>(axesSpecs, id);

        if (!axisSpec || !dimension || !position || axisSpec.hide) {
          return;
        }

        const axisStyle = axesStyles.get(axisSpec.id) ?? sharedAxesStyle;

        renderAxis(ctx, {
          title,
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
  });
}

function renderGlobalTitles(ctx: CanvasRenderingContext2D, props: AxesProps) {
  withContext(ctx, (ctx) => {
    props.axesGeoms.forEach(({ anchorPoint, parentSize, dimension, axis: { id, position } }) => {
      const axisSpec = getSpecsById<AxisSpec>(props.axesSpecs, id);

      if (!axisSpec || !position || axisSpec.hide) {
        return;
      }

      const axisStyle = props.axesStyles.get(axisSpec.id) ?? props.sharedAxesStyle;

      renderTitle(ctx, {
        ...props,
        title: axisSpec.title,
        size: parentSize,
        anchorPoint,
        dimension,
        axisStyle,
        axisSpec,
      });
    });
  });
}

function renderAxis(ctx: CanvasRenderingContext2D, props: AxisProps) {
  withContext(ctx, (ctx) => {
    const { ticks, size, anchorPoint, debug, axisStyle, axisSpec, panelAnchor, secondary } = props;
    const showTicks = shouldShowTicks(axisStyle.tickLine, axisSpec.hide);
    const isVertical = isVerticalAxis(axisSpec.position);
    const translate = {
      y: isVertical ? anchorPoint.y + panelAnchor.y : anchorPoint.y,
      x: isVertical ? anchorPoint.x : anchorPoint.x + panelAnchor.x,
    };

    ctx.translate(translate.x, translate.y);
    if (debug) {
      renderDebugRect(ctx, {
        x: 0,
        y: 0,
        ...size,
      });
    }

    withContext(ctx, (ctx) => {
      renderLine(ctx, props);
    });

    // TODO: compute axis dimensions per panels
    // For now just rendering axis line
    if (secondary) return;

    if (showTicks) {
      withContext(ctx, (ctx) => {
        ticks.forEach((tick) => {
          renderTick(ctx, tick, props);
        });
      });
    }

    if (axisStyle.tickLabel.visible) {
      withContext(ctx, (ctx) => {
        ticks
          .filter((tick) => tick.label !== null)
          .forEach((tick) => {
            renderTickLabel(ctx, tick, showTicks, props);
          });
      });
    }

    withContext(ctx, (ctx) => {
      renderPanelTitle(ctx, props);
    });
  });
}
