/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Dimensions, Size } from '../../../../../utils/dimensions';
import { Point } from '../../../../../utils/point';
import { AxisStyle } from '../../../../../utils/themes/theme';
import { PerPanelAxisGeoms } from '../../../state/selectors/compute_per_panel_axes_geoms';
import { AxisTick, TickLabelBounds, shouldShowTicks } from '../../../utils/axis_utils';
import { AxisSpec } from '../../../utils/specs';
import { renderAxisLine } from './line';
import { renderTick } from './tick';
import { renderTickLabel } from './tick_label';

/** @internal */
export interface AxisProps {
  panelTitle?: string;
  secondary?: boolean;
  panelAnchor: Point;
  axisStyle: AxisStyle; // todo rename to just style (it's in Axis... already)
  axisSpec: AxisSpec; // todo rename to just spec (it's in Axis... already)
  size: Size;
  anchorPoint: Point;
  dimension: TickLabelBounds;
  ticks: AxisTick[];
  debug: boolean;
  renderingArea: Dimensions;
  layerGirth: number;
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
export function renderAxis(ctx: CanvasRenderingContext2D, props: AxisProps) {
  const { ticks, axisStyle, axisSpec, secondary, layerGirth } = props;
  const showTicks = shouldShowTicks(axisStyle.tickLine, axisSpec.hide);

  renderAxisLine(ctx, props); // render the axis line
  if (!secondary && showTicks) ticks.forEach((tick) => renderTick(ctx, tick, props));
  if (!secondary && axisStyle.tickLabel.visible)
    ticks.forEach((tick) => renderTickLabel(ctx, tick, showTicks, props, layerGirth ?? 0));
}
