/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Ctx2d } from './painter';
import { createTableMeasureContext } from './table_measure';

/**
 * What text measurement needs of a 2D context.
 * @internal
 */
export type MeasureContext = Pick<Ctx2d, 'save' | 'restore' | 'measureText' | 'font' | 'textBaseline'>;

let measureContext: MeasureContext | undefined;

/**
 * The one place that decides what measures text: the layout code, the legend and metric sizing and
 * the SVG backend all ask here, so they agree with each other whatever answers.
 *
 * - In a browser it is an offscreen canvas context shared by everything measured in the current
 *   task, so every renderer measures text exactly like canvas draws it.
 * - Without a DOM, as on a server, it is a table of Inter's advance widths: no canvas is involved.
 * - `null` where a DOM exists but has no canvas support (jsdom).
 *
 * Do not keep the returned context beyond the current task: ask again instead.
 * @internal
 */
export function getMeasureContext(): MeasureContext | null {
  if (measureContext) return measureContext;
  if (typeof document === 'undefined') return (measureContext = createTableMeasureContext());
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return null;
  measureContext = ctx;
  // a browser keeps the shaped text of every string measured on a canvas for as long as the canvas
  // lives, so unique labels, such as heatmap cell values, would pile up for the life of the page
  queueMicrotask(() => {
    if (measureContext === ctx) measureContext = undefined;
  });
  return ctx;
}
