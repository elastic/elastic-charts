/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { shuffle } from 'lodash';
import moment from 'moment';

import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

const logLevels = ['debug', 'info', 'notice', 'warn', 'error', 'crit', 'alert', 'emerg', 'other'] as const;
export type LogLevel = (typeof logLevels)[number];
interface LogDataRow {
  timestamp: number;
  logLevel: LogLevel;
  count: number;
}

const rng = getRandomNumberGenerator();

function getData(): LogDataRow[] {
  const start = moment(1684144800000);
  const end = start.clone().add(15, 'minutes');
  const data: LogDataRow[] = [];

  while (start.isBefore(end)) {
    start.add(1, 'minute');

    logLevels.forEach((logLevel) => {
      data.push({ timestamp: start.valueOf(), logLevel, count: rng(0, 10, 0) });
    });
  }

  return shuffle(data);
}

export const sampleLogLevelData = {
  levels: logLevels,
  data: getData(),
};
