/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Ctx2d } from '../../../../../renderers/painter';

/** @internal */
export type LocaleOptions = Parameters<Date['toLocaleString']>[1];

/** @internal */
export function renderTimeExtentAnnotation(
  ctx: Ctx2d,
  config: { locale: string; monospacedFontShorthand: string; subduedFontColor: string },
  localeOptions: LocaleOptions,
  { domainFrom, domainTo }: { domainFrom: number; domainTo: number },
  cartesianWidth: number,
  yOffset: number,
) {
  ctx.save();
  ctx.textBaseline = 'bottom';
  ctx.textAlign = 'right';
  ctx.font = config.monospacedFontShorthand;
  ctx.fillStyle = config.subduedFontColor;
  // todo switch to new Intl.DateTimeFormat for more performance https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
  ctx.fillText(
    `${new Date(domainFrom * 1000).toLocaleString(config.locale, localeOptions)} — ${new Date(
      domainTo * 1000,
    ).toLocaleString(config.locale, localeOptions)}`,
    cartesianWidth,
    yOffset,
  );
  ctx.restore();
}
