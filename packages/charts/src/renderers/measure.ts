/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Ctx2d } from './painter';

/**
 * What text measurement needs of a 2D context.
 * @internal
 */
export type MeasureContext = Pick<Ctx2d, 'save' | 'restore' | 'measureText' | 'font' | 'textBaseline'>;

let measureContext: MeasureContext | undefined;

/**
 * The one place that decides what measures text: the layout code, the legend and metric sizing and
 * the SVG backend all ask here, so they agree with each other whatever answers.
 * In a browser it is one shared offscreen canvas context, so every renderer measures text exactly
 * like canvas draws it. `null` where no canvas is available (jsdom, server).
 * @internal
 */
export function getMeasureContext(): MeasureContext | null {
  if (measureContext) return measureContext;
  const ctx = typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');
  if (ctx) measureContext = ctx;
  return ctx ?? null;
}
