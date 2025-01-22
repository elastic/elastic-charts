/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { RgbaTuple } from '../../../../common/color_library_wrappers';
import { Colors } from '../../../../common/colors';
import { renderDebugRect } from '../../../../renderers/canvas/utils/debug';
import { Dimensions, PerSideDistance } from '../../../../utils/dimensions';

/** @internal */
export const renderMargins = (ctx: CanvasRenderingContext2D, container: Dimensions, margins: PerSideDistance) => {
  const greenSemiTransparent: RgbaTuple = [...(Colors.Green.rgba.slice(0, 3) as [number, number, number]), 0.5];

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

/** @internal */
export const renderPaddings = (
  ctx: CanvasRenderingContext2D,
  conatiner: Dimensions,
  chart: Dimensions,
  margins: PerSideDistance,
  paddings: PerSideDistance,
) => {
  const lightBlueSemiTransparent: RgbaTuple = [
    ...(Colors.LightBlue.rgba.slice(0, 3) as [number, number, number]),
    0.5,
  ] as RgbaTuple;

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
