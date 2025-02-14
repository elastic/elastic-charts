/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { RefObject } from 'react';

import { BrushTool } from '../../../components/brush/brush';
import { Tooltip } from '../../../components/tooltip/tooltip';
import type { BackwardRef, ChartRenderer } from '../../../state/internal_chart_renderer';
import { Heatmap } from '../renderer/canvas/connected_component';
import { CursorBand } from '../renderer/dom/cursor_band';
import { HighlighterFromBrush } from '../renderer/dom/highlighter_brush';

/** @internal */
export const chartRenderer: ChartRenderer = (
  containerRef: BackwardRef,
  forwardStageRef: RefObject<HTMLCanvasElement>,
) => (
  <>
    <Tooltip getChartContainerRef={containerRef} />
    <Heatmap forwardStageRef={forwardStageRef} />
    <CursorBand />
    <BrushTool />
    <HighlighterFromBrush />
  </>
);
