/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @internal */
export function renderChartTitle(ctx, config, chartWidth, cartesianTop, aggregationFunctionName) {
  ctx.save();
  const titleFontSize = 32; // todo move to config
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.font = `normal normal 200 ${titleFontSize}px Inter, Helvetica, Arial, sans-serif`; // todo move to config
  ctx.fillStyle = config.subduedFontColor;
  ctx.fillText(config.queryConfig.metricFieldName, chartWidth / 2, cartesianTop / 2 - titleFontSize * 0.5);
  ctx.fillText(aggregationFunctionName, chartWidth / 2, cartesianTop / 2 + titleFontSize * 0.5);
  ctx.restore();
}
