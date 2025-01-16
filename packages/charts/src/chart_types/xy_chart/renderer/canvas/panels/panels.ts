/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { renderTitle } from './title';
import { Colors } from '../../../../../common/colors';
import { withContext } from '../../../../../renderers/canvas';
import { renderRect } from '../../../../../renderers/canvas/primitives/rect';
import { renderDebugRect } from '../../../../../renderers/canvas/utils/debug';
import { PanelGeoms } from '../../../../../state/selectors/compute_panels';
import { Position } from '../../../../../utils/common';
import { AxisId } from '../../../../../utils/ids';
import { Point } from '../../../../../utils/point';
import { getSpecsById } from '../../../state/utils/spec';
import { AxisSpec } from '../../../utils/specs';
import { AxesProps, AxisProps, renderAxis } from '../axes';

/** @internal */
export function renderGridPanels(ctx: CanvasRenderingContext2D, { x: chartX, y: chartY }: Point, panels: PanelGeoms) {
  panels.forEach(({ width, height, panelAnchor: { x: panelX, y: panelY } }) =>
    withContext(ctx, () =>
      renderRect(
        ctx,
        { x: chartX + panelX, y: chartY + panelY, width, height },
        { color: Colors.Transparent.rgba },
        { color: Colors.Black.rgba, width: 1 },
      ),
    ),
  );
}

function renderPanel(ctx: CanvasRenderingContext2D, props: AxisProps, locale: string) {
  const { size, anchorPoint, debug, axisStyle, axisSpec, panelAnchor, secondary, scaleType } = props;
  const { position } = axisSpec;
  const x = anchorPoint.x + (position === Position.Right ? -1 : 1) * panelAnchor.x;
  const y = anchorPoint.y + (position === Position.Bottom ? -1 : 1) * panelAnchor.y;

  withContext(ctx, () => {
    ctx.translate(x, y);
    if (debug && !secondary) renderDebugRect(ctx, { x: 0, y: 0, ...size });
    renderAxis(ctx, props); // TODO: compute axis dimensions per panel, For now, just render the axis line
    if (!secondary) {
      const { panelTitle, dimension } = props;
      renderTitle(
        ctx,
        true,
        { panelTitle, axisSpec, axisStyle, size, scaleType, dimension, debug, anchorPoint: { x: 0, y: 0 } },
        locale,
      ); // TODO: should we use the axisSpec/Style for the title of small multiple or use their own style?
    }
  });
}

/** @internal */
export function renderPanelSubstrates(ctx: CanvasRenderingContext2D, props: AxesProps, locale: string) {
  const { axesSpecs, perPanelAxisGeoms, axesStyles, sharedAxesStyle, debug, renderingArea } = props;
  const seenAxesTitleIds = new Set<AxisId>();

  perPanelAxisGeoms.forEach(({ axesGeoms, panelAnchor }) => {
    axesGeoms.forEach((geometry) => {
      const {
        axis: { panelTitle, id, position, secondary, scaleType },
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
        renderTitle(
          ctx,
          false,
          { size: parentSize, debug, panelTitle, anchorPoint, dimension, axisStyle, axisSpec, scaleType },
          locale,
        );
      }

      const layerGirth = dimension.maxLabelBboxHeight;

      renderPanel(
        ctx,
        {
          panelTitle,
          secondary,
          panelAnchor,
          axisSpec,
          anchorPoint,
          size,
          dimension,
          ticks,
          scaleType,
          axisStyle,
          debug,
          renderingArea,
          layerGirth,
        },
        locale,
      );
    });
  });
}
