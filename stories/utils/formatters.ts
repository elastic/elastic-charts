/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import numeral from 'numeral';

import { LogBase } from '../../packages/charts/src/scales/scale_continuous';

const superStringMap: Record<string, string> = {
  0: '⁰',
  1: '¹',
  2: '²',
  3: '³',
  4: '⁴',
  5: '⁵',
  6: '⁶',
  7: '⁷',
  8: '⁸',
  9: '⁹',
};

export const getSuperScriptNumber = (n: number) =>
  `${n >= 0 ? '' : '⁻'}${Math.abs(n)
    .toString()
    .split('')
    .map((c) => superStringMap[c])
    .join('')}`;

export const logBaseMap = {
  [LogBase.Common]: 10,
  [LogBase.Binary]: 2,
  [LogBase.Natural]: Math.E,
};

export const logFormatter = (base: LogBase = LogBase.Common) => (n: number): string => {
  if (n === 0) return '0';
  const sign = n < 0 ? '-' : '';
  const nAbs = Math.abs(n);
  const exp = Math.log(nAbs) / Math.log(logBaseMap[base]) + Number.EPSILON;
  const roundedExp = Math.floor(exp);
  const constant = numeral(nAbs / Math.pow(logBaseMap[base], roundedExp)).format('0[.]00');
  const baseLabel = base === LogBase.Natural ? 'e' : logBaseMap[base];
  const expString = getSuperScriptNumber(roundedExp);
  return `${sign}${constant} x ${baseLabel}${expString}`;
};
