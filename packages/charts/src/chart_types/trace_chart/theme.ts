/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Theme } from '../../utils/themes/theme';
import type { TraceStyle } from './render/types';

/**
 * Resolves trace-chart style values from the chart's global `Theme`. Reads `theme.trace` directly —
 * all sizing, color, and font values are now overridable via the standard `PartialTheme` mechanism.
 * @internal
 */
export function buildTraceStyle(theme: Theme): TraceStyle {
  return theme.trace;
}

export type { TraceStyle };
