/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// In preparation of nominal types in future TS versions
// https://github.com/microsoft/TypeScript/pull/33038
// eg. to avoid adding angles and coordinates and similar inconsistent number/number ops.
// could in theory be three-valued (in,on,out)
// It also serves as documentation.

import type { TimeMs } from './geometry';

/**
 * @public
 *
 * Pre-existing animation config to be refactored using new animation config
 */
export interface LegacyAnimationConfig {
  /** @alpha */
  animation: {
    duration: TimeMs;
  };
}
