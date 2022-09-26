/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { hasKey } from '../../../../../common/predicate';
import { DEFAULT_LOCALE } from '../../../../xy_chart/axes/timeslip/multilayer_ticks';
import { BinUnit } from '../../../../xy_chart/axes/timeslip/rasters';
import { TIME_UNIT_TRANSLATIONS } from '../../../../xy_chart/axes/timeslip/time_unit_translations';

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
  unitBarMaxWidthPixels: number,
) {
  const locale: keyof typeof TIME_UNIT_TRANSLATIONS = hasKey(TIME_UNIT_TRANSLATIONS, config.locale)
    ? config.locale
    : DEFAULT_LOCALE;
  const unitBarY = -chartTopFontSize * 2.2;

  ctx.save();
  ctx.textBaseline = 'bottom';
  ctx.textAlign = 'left';
  ctx.font = config.monospacedFontShorthand;
  ctx.fillStyle = config.a11y.contrast === 'low' ? config.subduedFontColor : config.defaultFontColor;
  ctx.fillText(
    `1 ${TIME_UNIT_TRANSLATIONS[locale].bar} = ${binUnitCount} ${
      TIME_UNIT_TRANSLATIONS[locale][binUnit][binUnitCount === 1 ? 0 : 1]
    }`,
    0,
    -chartTopFontSize * 0.5,
  );
  ctx.fillRect(0, unitBarY, unitBarMaxWidthPixels, 1);
  ctx.fillRect(0, unitBarY - 3, 1, 7);
  ctx.fillRect(unitBarMaxWidthPixels - 1, unitBarY - 3, 1, 7);
  ctx.restore();
}
