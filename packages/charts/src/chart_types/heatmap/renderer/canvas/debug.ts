/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { overrideOpacity } from '../../../../common/color_library_wrappers';
import { Colors } from '../../../../common/colors';
import { renderDebugRect } from '../../../../renderers/canvas/utils/debug';
import { Dimensions, PerSideDistance } from '../../../../utils/dimensions';

const renderDebugMargins = (ctx: CanvasRenderingContext2D, container: Dimensions, margins: PerSideDistance) => {
  const greenSemiTransparent = overrideOpacity(Colors.Green.rgba, 0.5);

  // left
  renderDebugRect(
    ctx,
    {
      x: container.left,
      y: container.top,
      width: margins.left,
      height: container.height,
    },
    0,
    { color: greenSemiTransparent },
  );
  // right
  renderDebugRect(
    ctx,
    {
      x: container.left + container.width - margins.right,
      y: container.top,
      width: margins.right,
      height: container.height,
    },
    0,
    { color: greenSemiTransparent },
  );
  // top
  renderDebugRect(
    ctx,
    {
      x: container.left,
      y: container.top,
      width: container.width,
      height: margins.top,
    },
    0,
    { color: greenSemiTransparent },
  );
  // bottom
  renderDebugRect(
    ctx,
    {
      x: container.left,
      y: container.top + container.height - margins.bottom,
      width: container.width,
      height: margins.bottom,
    },
    0,
    { color: greenSemiTransparent },
  );
};

const renderDebugPaddings = (
  ctx: CanvasRenderingContext2D,
  conatiner: Dimensions,
  chart: Dimensions,
  margins: PerSideDistance,
  paddings: PerSideDistance,
) => {
  const lightBlueSemiTransparent = overrideOpacity(Colors.LightBlue.rgba, 0.5);

  // left
  renderDebugRect(
    ctx,
    {
      x: chart.left - paddings.left,
      y: conatiner.top + paddings.top + margins.top,
      width: paddings.left,
      height: chart.height,
    },
    0,
    { color: lightBlueSemiTransparent },
  );
  // right
  renderDebugRect(
    ctx,
    {
      x: conatiner.left + conatiner.width - paddings.right - margins.right,
      y: conatiner.top + paddings.top + margins.top,
      width: paddings.right,
      height: chart.height,
    },
    0,
    { color: lightBlueSemiTransparent },
  );
  // top
  renderDebugRect(
    ctx,
    {
      x: chart.left,
      y: conatiner.top + margins.top,
      width: chart.width,
      height: paddings.top,
    },
    0,
    { color: lightBlueSemiTransparent },
  );
  // bottom
  renderDebugRect(
    ctx,
    {
      x: chart.left,
      y: conatiner.top + chart.height + margins.top + paddings.top,
      width: chart.width,
      height: paddings.bottom,
    },
    0,
    { color: lightBlueSemiTransparent },
  );
};

/** @internal */
export const renderHeatmapDebugElements = ({
  ctx,
  container,
  chart,
  margins,
  paddings,
}: {
  ctx: CanvasRenderingContext2D;
  container: Dimensions;
  chart: Dimensions;
  margins: PerSideDistance;
  paddings: PerSideDistance;
}) => {
  renderDebugMargins(ctx, container, margins);
  renderDebugPaddings(ctx, container, chart, margins, paddings);
  renderDebugRect(
    ctx,
    { x: chart.left, y: chart.top, width: chart.width, height: chart.height },
    0,
    { color: Colors.Transparent.rgba },
    { color: Colors.Red.rgba, width: 4, dash: [4, 4] },
  );
};
