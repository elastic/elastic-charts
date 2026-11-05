/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// Headless rendering lives in its own entry point (`@elastic/charts/dist/headless`) so browser
// bundles that import `@elastic/charts` do not pull in `react-dom/server`.
export { renderChart } from './render_chart';
export type { RenderChartOptions } from './render_chart';
export { collectSpecs } from './collect_specs';
export { SvgCanvas, measureHelveticaTextWidth } from './svg_canvas';
export type { SvgCanvasOptions, SvgFont, SvgOutputOptions, SvgTextWidthMeasure } from './svg_canvas';
export { createGlyphFont } from './glyph_font';
export type { GlyphFontData, GlyphFontFace } from './glyph_font';
