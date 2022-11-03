/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { hasKey } from '../../../../../common/predicate';
import { BinUnit } from '../../../../xy_chart/axes/timeslip/continuous_time_rasters';
import { LOCALE_TRANSLATIONS } from '../../../../xy_chart/axes/timeslip/locale_translations';
import { DEFAULT_LOCALE } from '../../../../xy_chart/axes/timeslip/multilayer_ticks';

/** @internal */
export function renderTimeUnitAnnotation(
  ctx: CanvasRenderingContext2D,
  config: {
    locale: string;
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
  const locale: keyof typeof LOCALE_TRANSLATIONS = hasKey(LOCALE_TRANSLATIONS, config.locale)
    ? config.locale
    : DEFAULT_LOCALE;
  const unitBarY = yOffset - chartTopFontSize * 1.7;

  ctx.save();
  ctx.textBaseline = 'bottom';
  ctx.textAlign = 'left';
  ctx.font = config.monospacedFontShorthand;
  ctx.fillStyle = config.a11y.contrast === 'low' ? config.subduedFontColor : config.defaultFontColor;
  ctx.fillText(
    `1 ${LOCALE_TRANSLATIONS[locale].bar} = ${binUnitCount} ${
      LOCALE_TRANSLATIONS[locale][binUnit][binUnitCount === 1 ? 0 : 1]
    }`,
    0,
    yOffset,
  );
  ctx.fillRect(0, unitBarY, unitBarMaxWidthPixels, 1);
  ctx.fillRect(0, unitBarY - 3, 1, 7);
  ctx.fillRect(unitBarMaxWidthPixels - 1, unitBarY - 3, 1, 7);
  ctx.restore();
}
