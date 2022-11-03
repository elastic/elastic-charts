/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @internal */
export const mix = (start: number, end: number, a: number) => start * (1 - a) + end * a; // like the glsl function
/** @internal */
export const clamp = (n: number, lo: number, hi: number) => (n < lo ? lo : n > hi ? hi : n);
/** @internal */
export const unitClamp = (n: number) => (n <= 0 ? 0 : n >= 1 ? 1 : n);
