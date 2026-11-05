/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { RefObject } from 'react';

/** @internal */
export type BackwardRef = () => React.RefObject<HTMLDivElement>;

/**
 * The element a chart draws on: a `<canvas>` or, with `renderer="svg"`, an `<svg>`.
 * @internal
 */
export type StageElement = HTMLCanvasElement | SVGSVGElement;

/**
 * Returns a JSX element with the chart rendered (legend excluded)
 * @param containerRef
 * @param forwardStageRef
 * @internal
 */
export type ChartRenderer = (containerRef: BackwardRef, forwardStageRef: RefObject<StageElement>) => JSX.Element | null;
