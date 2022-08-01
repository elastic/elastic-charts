/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// @ts-noCheck

/** @internal */
export function renderTimeExtentAnnotation(
  ctx,
  config,
  localeOptions,
  timeDomainFrom,
  timeDomainTo,
  cartesianWidth,
  chartTopFontSize,
) {
  ctx.save();
  ctx.textBaseline = 'bottom';
  ctx.textAlign = 'right';
  ctx.font = config.monospacedFontShorthand;
  ctx.fillStyle = config.subduedFontColor;
  // todo switch to new Intl.DateTimeFormat for more performance https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
  ctx.fillText(
    `${new Date(timeDomainFrom * 1000).toLocaleString(config.locale, localeOptions)} — ${new Date(
      timeDomainTo * 1000,
    ).toLocaleString(config.locale, localeOptions)}`,
    cartesianWidth,
    -chartTopFontSize * 0.5,
  );
  ctx.restore();
}
