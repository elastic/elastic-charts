/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { BinUnit } from '../../../../xy_chart/axes/timeslip/continuous_time_rasters';

/** @internal */
const LOCALE_TRANSLATIONS = {
  bar: 'bar',
  year: ['year', 'years'],
  month: ['month', 'months'],
  week: ['week', 'weeks'],
  day: ['day', 'days'],
  hour: ['hour', 'hours'],
  minute: ['minute', 'minutes'],
  second: ['second', 'seconds'],
  millisecond: ['millisecond', 'milliseconds'],
  one: ['', ''],
};

/** @internal */
export function renderTimeUnitAnnotation(
  ctx: CanvasRenderingContext2D,
  config: {
    monospacedFontShorthand: string;
    subduedFontColor: string;
    defaultFontColor: string;
    a11y: { contrast: 'low' | 'medium' | 'high' };
  },
  binUnitCount: number,
  binUnit: BinUnit,
  chartTopFontSize: number,
  yOffset: number,
  unitBarMaxWidthPixels: number,
) {
  const unitBarY = yOffset - chartTopFontSize * 1.7;

  ctx.save();
  ctx.textBaseline = 'bottom';
  ctx.textAlign = 'left';
  ctx.font = config.monospacedFontShorthand;
  ctx.fillStyle = config.a11y.contrast === 'low' ? config.subduedFontColor : config.defaultFontColor;
  ctx.fillText(
    `1 ${LOCALE_TRANSLATIONS.bar} = ${binUnitCount} ${LOCALE_TRANSLATIONS[binUnit][binUnitCount === 1 ? 0 : 1]}`,
    0,
    yOffset,
  );
  ctx.fillRect(0, unitBarY, unitBarMaxWidthPixels, 1);
  ctx.fillRect(0, unitBarY - 3, 1, 7);
  ctx.fillRect(unitBarMaxWidthPixels - 1, unitBarY - 3, 1, 7);
  ctx.restore();
}
