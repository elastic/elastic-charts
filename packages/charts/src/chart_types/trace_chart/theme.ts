/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { TraceStyle } from './render/types';
import type { Theme } from '../../utils/themes/theme';

/**
 * Minimum lane height (px) applied in `'inline'` label mode. Inline mode stacks a span-name row
 * beneath the bar band (ADR 0020), so the gutter-tuned default lane height (24) leaves the bar band
 * too short. This floor keeps room for the bar plus the label row without every inline caller having
 * to bump `laneHeight` by hand. It is a floor, not a cap: an explicit taller `laneHeight` wins.
 */
const INLINE_MIN_LANE_HEIGHT = 40;

/**
 * Resolves trace-chart style values from the chart's global `Theme`. Reads `theme.trace` directly —
 * all sizing, color, and font values are overridable via the standard `PartialTheme` mechanism —
 * then derives one position-dependent default: in `'inline'` label mode the lane height is lifted to
 * at least {@link INLINE_MIN_LANE_HEIGHT} so the label row and bar band both fit (still overridable
 * upward). See ADR 0020.
 * @internal
 */
export function buildTraceStyle(theme: Theme): TraceStyle {
  const { trace } = theme;
  if (trace.labelPosition === 'inline' && trace.laneHeight < INLINE_MIN_LANE_HEIGHT) {
    return { ...trace, laneHeight: INLINE_MIN_LANE_HEIGHT };
  }
  return trace;
}

export { type TraceStyle } from './render/types';
