/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export { renderChartToSVGString } from './server/render_chart_to_svg_string';
export type { RenderChartToSVGOptions } from './server/render_chart_to_svg_string';
export { registerFont } from './renderers/svg/font/registry';
export type { GenericFontFamily, RegisterFontOptions } from './renderers/svg/font/registry';
