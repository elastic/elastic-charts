/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import moment from 'moment-timezone';

import { getMomentWithTz } from './date_time';
import type { TickFormatter, TickFormatterOptions } from '../../chart_types/xy_chart/utils/specs';

/** @public */
export function timeFormatter(format: string): TickFormatter {
  return (value: number, options?: TickFormatterOptions): string =>
    getMomentWithTz(value, options && options.timeZone).format(format);
}

/** @public */
export function niceTimeFormatter(domain: [number, number]): TickFormatter {
  const minDate = moment(domain[0]);
  const maxDate = moment(domain[1]);
  const diff = maxDate.diff(minDate, 'days');
  const format = niceTimeFormatByDay(diff);
  return timeFormatter(format);
}

/** @public */
export function niceTimeFormatByDay(days: number) {
  if (days > 30) return 'YYYY-MM-DD';
  if (days > 7) return 'MMMM DD';
  if (days > 1) return 'MM-DD HH:mm';
  return 'HH:mm:ss';
}
