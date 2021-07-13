/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @internal */
export const getMockCanvasContext2D = (): CanvasRenderingContext2D => {
  const ctx = document.createElement('canvas').getContext('2d');
  if (ctx) return ctx;

  throw new Error('Unable to create mock context');
};

/** @internal */
export const getMockCanvas = (): HTMLCanvasElement => {
  return document.createElement('canvas');
};
