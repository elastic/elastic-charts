/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { GlobalChartState } from '../state/chart_state';

/**
 * Draws one chart type from the initialized chart state onto `ctx`, in CSS pixels, inside the
 * chart's parent dimensions. The legend is drawn separately.
 * @internal
 */
export type HeadlessRenderer = (ctx: CanvasRenderingContext2D, state: GlobalChartState) => void;
