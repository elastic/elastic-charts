/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import moment from 'moment-timezone';

/** @internal */
export function getMomentWithTz(date: number | Date, timeZone?: string) {
  if (timeZone === 'local' || !timeZone) {
    return moment(date);
  }
  if (timeZone.toLowerCase().startsWith('utc+') || timeZone.toLowerCase().startsWith('utc-')) {
    return moment(date).utcOffset(Number(timeZone.slice(3)));
  }
  return moment.tz(date, timeZone);
}
