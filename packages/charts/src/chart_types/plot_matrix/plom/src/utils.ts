/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Logger } from '../../../../utils/logger';

/** @internal */
export const keyFun = (d: { key: unknown }) => d.key;
/** @internal */
export const repeat = (d: unknown) => [d];
/** @internal */
export const descend = (d: unknown) => d;
/** @internal */
export const clamp = (x: number, min: number, max: number) => Math.min(Math.max(x, min), max);
/** @internal */
export const range = (n: number) => Array.from({ length: n }, (_, i) => i);

const DEGENERATE_DOMAIN_EXTENSION_RATIO = 0.1;
const DEG_LO = 1 - DEGENERATE_DOMAIN_EXTENSION_RATIO;
const DEG_HI = 1 + DEGENERATE_DOMAIN_EXTENSION_RATIO;

/** @internal */
export const getExtent = (values: number[]) => {
  const lo = values.reduce((p, n) => Math.min(p, n), Infinity);
  const hi = values.reduce((p, n) => Math.max(p, n), -Infinity);
  return lo < hi ? [lo, hi] : lo === hi ? (lo === 0 ? [-1, 1] : [lo * DEG_LO, hi * DEG_HI]) : [-1, 1];
};

/** @internal */
export const format = (formatter: any, strings: any[]) => (v: any, i: number) => {
  const text = strings[i];
  return text === null || text === undefined ? formatter(v) : text;
};

/** @internal */
export const getGLExtensions = (gl: WebGL2RenderingContext) => {
  // spectorLog(gl, 'activate extensions')
  const ext1 = gl.getExtension('EXT_color_buffer_float');
  if (!ext1) {
    throw new Error('This chart type currently needs WebGL2 with the EXT_color_buffer_float extension');
  }
  const ext2 = gl.getExtension('OES_texture_float_linear');
  if (!ext2) {
    throw new Error(
      'This chart type currently needs linear filtering of floating point textures with OES_texture_float_linear',
    );
  }
  const ext3 = gl.getExtension('KHR_parallel_shader_compile');
  if (!ext3) {
    Logger.warn('KHR_parallel_shader_compile unavailable; no cause for concern');
  }
};

/** @internal */
export const simulateContextLoss = (gl: WebGL2RenderingContext) => {
  // simulates a context loss at `lossTimeMs` and context recovery at `regainTimeMs` after that
  const lossTimeMs = 5000;
  const regainTimeMs = 0;
  const ext = gl.getExtension('WEBGL_lose_context');
  if (ext) {
    window.setTimeout(() => {
      Logger.warn('Context loss test triggered, the webgl rendering will freeze or disappear');
      ext.loseContext();
      window.setTimeout(() => ext.restoreContext(), regainTimeMs);
    }, lossTimeMs);
  }
};

/** @internal */
export const prop = (n: any) => (o: Array<unknown>) => o[n];
