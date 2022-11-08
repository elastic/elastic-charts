/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @internal */
export const DEFAULT_CSS_CURSOR = undefined;
/** @internal */
export const TAU = 2 * Math.PI;
/** @internal */
export const RIGHT_ANGLE = TAU / 4;
/** @internal */
export const GOLDEN_RATIO = 1.618;

/** @public */
export const TOP = 'top' as const;
/** @public */
export const BOTTOM = 'bottom' as const;
/** @public */
export const LEFT = 'left' as const;
/** @public */
export const RIGHT = 'right' as const;
/** @public */
export const MIDDLE = 'middle' as const;
/** @public */
export const CENTER = 'center' as const;

/** @internal
 * Value used to describe the secondary button (usually the right button) on a `MouseEvent.button`
 */
export const SECONDARY_BUTTON = 2;
