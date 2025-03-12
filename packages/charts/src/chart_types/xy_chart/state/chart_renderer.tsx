/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { RefObject } from 'react';
import React from 'react';

import { BrushTool } from '../../../components/brush/brush';
import { Tooltip } from '../../../components/tooltip/tooltip';
import type { BackwardRef, ChartRenderer } from '../../../state/internal_chart_renderer';
import { XYChart } from '../renderer/canvas/xy_chart';
import { Annotations } from '../renderer/dom/annotations';
import { CursorBand } from '../renderer/dom/cursor_band';
import { CursorCrossLine } from '../renderer/dom/cursor_crossline';
import { CursorLine } from '../renderer/dom/cursor_line';
import { Highlighter } from '../renderer/dom/highlighter';

/** @internal */
export const chartRenderer: ChartRenderer = (
  containerRef: BackwardRef,
  forwardStageRef: RefObject<HTMLCanvasElement>,
) => (
  <>
    <CursorBand />
    <XYChart forwardCanvasRef={forwardStageRef} />
    <CursorLine />
    <CursorCrossLine />
    <Tooltip getChartContainerRef={containerRef} />
    <Annotations getChartContainerRef={containerRef} chartAreaRef={forwardStageRef} />
    <Highlighter />
    <BrushTool />
  </>
);
