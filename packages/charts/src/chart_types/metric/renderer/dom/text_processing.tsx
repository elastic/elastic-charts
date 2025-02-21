/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { isFiniteNumber } from '../../../../utils/common';
import type { MetricStyle } from '../../../../utils/themes/theme';
import type { MetricDatum } from '../../specs';
import { isMetricWNumber, isMetricWNumberArrayValues } from '../../specs';

/** @internal */
export interface TextParts {
  emphasis: 'small' | 'normal';
  text: string;
}

/** @internal */

export function getTextParts(datum: MetricDatum, style: MetricStyle): TextParts[] {
  const values = Array.isArray(datum.value) ? datum.value : [datum.value];
  const valueFormatter =
    isMetricWNumber(datum) || isMetricWNumberArrayValues(datum) ? datum.valueFormatter : (v: number) => `${v}`;
  const textParts = values.reduce<TextParts[]>((acc, value, i, { length }) => {
    const parts: TextParts[] =
      typeof value === 'number'
        ? isFiniteNumber(value)
          ? splitNumericSuffixPrefix(valueFormatter(value))
          : [{ emphasis: 'normal', text: style.nonFiniteText }]
        : [{ emphasis: 'normal', text: value }];

    if (i < length - 1) {
      parts.push({ emphasis: 'normal', text: ', ' });
    }
    return [...acc, ...parts];
  }, []);

  if (!Array.isArray(datum.value)) return textParts;

  return [{ emphasis: 'normal', text: '[' }, ...textParts, { emphasis: 'normal', text: ']' }];
}

function splitNumericSuffixPrefix(text: string): TextParts[] {
  return text
    .split('')
    .reduce<{ emphasis: 'normal' | 'small'; textParts: string[] }[]>((acc, curr) => {
      const emphasis = curr === '.' || curr === ',' || isFiniteNumber(Number.parseInt(curr)) ? 'normal' : 'small';
      if (acc.length > 0 && acc.at(-1)?.emphasis === emphasis) {
        acc.at(-1)?.textParts.push(curr);
      } else {
        acc.push({ emphasis, textParts: [curr] });
      }
      return acc;
    }, [])
    .map(({ emphasis, textParts }) => ({
      emphasis,
      text: textParts.join(''),
    }));
}
