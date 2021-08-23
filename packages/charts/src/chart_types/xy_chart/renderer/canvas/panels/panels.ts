/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { stringToRGB } from '../../../../../common/color_library_wrappers';
import { withContext } from '../../../../../renderers/canvas';
import { Position } from '../../../../../utils/common';
import { AxisId } from '../../../../../utils/ids';
import { Point } from '../../../../../utils/point';
import { PanelGeoms } from '../../../state/selectors/compute_panels';
import { getSpecsById } from '../../../state/utils/spec';
import { AxisSpec } from '../../../utils/specs';
import { AxesProps, AxisProps, renderAxis } from '../axes';
import { renderRect } from '../primitives/rect';
import { renderDebugRect } from '../utils/debug';
import { renderPanelTitle, renderTitle } from './title';

/** @internal */
export function renderGridPanels(ctx: CanvasRenderingContext2D, { x: chartX, y: chartY }: Point, panels: PanelGeoms) {
  panels.forEach(({ width, height, panelAnchor: { x: panelX, y: panelY } }) =>
    withContext(ctx, () =>
      renderRect(
        ctx,
        { x: chartX + panelX, y: chartY + panelY, width, height },
        { color: stringToRGB('rgba(0,0,0,0)') },
        { color: stringToRGB('rgb(0,0,0)'), width: 1 },
      ),
    ),
  );
}

function renderPanel(ctx: CanvasRenderingContext2D, props: AxisProps) {
  const { size, anchorPoint, debug, axisStyle, axisSpec, panelAnchor, secondary } = props;
  const { position } = axisSpec;
  const x = anchorPoint.x + (position === Position.Right ? -1 : 1) * panelAnchor.x;
  const y = anchorPoint.y + (position === Position.Bottom ? -1 : 1) * panelAnchor.y;

  withContext(ctx, () => {
    ctx.translate(x, y);
    if (debug && !secondary) renderDebugRect(ctx, { x: 0, y: 0, ...size });
    renderAxis(ctx, props); // For now, just render the axis line TODO: compute axis dimensions per panels
    if (!secondary) {
      const { panelTitle, dimension } = props;
      renderPanelTitle(ctx, { panelTitle, axisSpec, axisStyle, size, dimension, debug }); // fixme axisSpec/Style?
    }
  });
}

/** @internal */
export function renderPanelSubstrates(ctx: CanvasRenderingContext2D, props: AxesProps) {
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

      renderPanel(ctx, {
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
