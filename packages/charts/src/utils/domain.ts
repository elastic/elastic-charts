/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { extent } from 'd3-array';

import { ScaleType } from '../scales/constants';
import { DomainPaddingUnit, YDomainRange } from '../specs';

/** @public */
export type OrdinalDomain = (number | string)[];
/** @public */
export type ContinuousDomain = [min: number, max: number];
/** @public */
export type Range = [min: number, max: number];

function constrainPadding(
  start: number,
  end: number,
  newStart: number,
  newEnd: number,
  constrain: boolean = true,
): [number, number] {
  return constrain
    ? start < end
      ? [newStart >= 0 || start < 0 ? newStart : 0, newEnd <= 0 || end > 0 ? newEnd : 0]
      : [newEnd >= 0 || end < 0 ? newEnd : 0, newStart <= 0 || start > 0 ? newStart : 0]
    : [newStart, newEnd];
}

/** @internal */
export function computeOrdinalDataDomain<T>(data: T[], sorted: boolean, removeNull: boolean, locale: string): T[] {
  const uniqueValues = [...new Set(removeNull ? data.filter((d) => d !== null) : data)];
  return sorted ? uniqueValues.sort((a, b) => `${a}`.localeCompare(`${b}`, locale)) : uniqueValues;
}

function getPaddedDomain(start: number, end: number, domainOptions: YDomainRange): [number, number] {
  const { padding, paddingUnit = DomainPaddingUnit.Domain } = domainOptions;
  if (!padding || paddingUnit === DomainPaddingUnit.Pixel) return [start, end];
  const computedPadding = Math.abs(padding * (paddingUnit === DomainPaddingUnit.Domain ? 1 : end - start));
  return constrainPadding(start, end, start - computedPadding, end + computedPadding, domainOptions.constrainPadding);
}

/** @internal */
export function computeDomainExtent(
  domain: [number, number] | [undefined, undefined],
  domainOptions: YDomainRange,
): [number, number] {
  if (domain[0] === undefined) return [0, 0]; // if domain[1] is undefined, domain[0] is undefined too
  const inverted = domain[0] > domain[1];
  const paddedDomain = (([start, end]: Range): Range => {
    const [paddedStart, paddedEnd] = getPaddedDomain(start, end, domainOptions);
    if (paddedStart >= 0 && paddedEnd >= 0) return domainOptions.fit ? [paddedStart, paddedEnd] : [0, paddedEnd];
    if (paddedStart < 0 && paddedEnd < 0) return domainOptions.fit ? [paddedStart, paddedEnd] : [paddedStart, 0];
    return [paddedStart, paddedEnd];
  })(inverted ? [domain[1], domain[0]] : domain);

  return inverted ? [paddedDomain[1], paddedDomain[0]] : paddedDomain;
}

/**
 * Get continuous domain from data. May yield domain to constrain to zero baseline.
 * @internal
 */
export function computeContinuousDataDomain(
  data: number[],
  scaleType: ScaleType,
  domainOptions: YDomainRange | undefined,
): ContinuousDomain {
  // todo check for DRY violations: this may not be the only place for non-positives removal for the log scale
  const filteredData = domainOptions?.fit && scaleType === ScaleType.Log ? data.filter((d) => d !== 0) : data;
  const range = extent<number, number>(filteredData, (d) => d);
  return domainOptions === undefined ? [range[0] ?? 0, range[1] ?? 0] : computeDomainExtent(range, domainOptions);
}
