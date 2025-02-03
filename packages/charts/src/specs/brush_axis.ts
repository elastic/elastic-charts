/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { $Values } from 'utility-types';

/** @public */
export const BrushAxis = Object.freeze({
  X: 'x' as const,
  Y: 'y' as const,
  Both: 'both' as const,
});
/** @public */
export type BrushAxis = $Values<typeof BrushAxis>;
