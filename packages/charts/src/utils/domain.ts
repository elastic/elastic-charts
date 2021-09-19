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
import { AccessorFn } from './accessor';

/** @public */
export type OrdinalDomain = (number | string)[];
/** @public */
export type ContinuousDomain = [min: number, max: number];
/** @public */
export type Range = [min: number, max: number];

/**
 * Returns padded domain given constrain
 * @internal */
export function constrainPadding(
  start: number,
  end: number,
  newStart: number,
  newEnd: number,
  constrain: boolean = true,
): [number, number] {
  if (constrain) {
    if (start < end) {
      return [start >= 0 && newStart < 0 ? 0 : newStart, end <= 0 && newEnd > 0 ? 0 : newEnd];
    }

    return [end >= 0 && newEnd < 0 ? 0 : newEnd, start <= 0 && newStart > 0 ? 0 : newStart];
  }

  return [newStart, newEnd];
}

/** @internal */
export function computeOrdinalDataDomain(
  data: any[],
  accessor: AccessorFn,
  sorted?: boolean,
  removeNull?: boolean,
): string[] | number[] {
  // TODO: Check for empty data before computing domain
  if (data.length === 0) {
    return [0];
  }

  const domain = data.map(accessor).filter((d) => (removeNull ? d !== null : true));
  const uniqueValues = [...new Set(domain)];
  return sorted ? uniqueValues.sort((a, b) => `${a}`.localeCompare(`${b}`)) : uniqueValues;
}

function getPaddedDomain(start: number, end: number, domainOptions?: YDomainRange): [number, number] {
  if (!domainOptions || !domainOptions.padding || domainOptions.paddingUnit === DomainPaddingUnit.Pixel) {
    return [start, end];
  }

  const { padding, paddingUnit = DomainPaddingUnit.Domain } = domainOptions;
  const absPadding = Math.abs(padding);
  const computedPadding = paddingUnit === DomainPaddingUnit.Domain ? absPadding : absPadding * Math.abs(end - start);

  if (computedPadding === 0) {
    return [start, end];
  }

  const newStart = start - computedPadding;
  const newEnd = end + computedPadding;

  return constrainPadding(start, end, newStart, newEnd, domainOptions.constrainPadding);
}

/** @internal */
export function computeDomainExtent(
  domain: [number, number] | [undefined, undefined],
  domainOptions?: YDomainRange,
): [number, number] {
  if (domain[0] === undefined) return [0, 0]; // if domain[1] is undefined, domain[0] is undefined too

  const inverted = domain[0] > domain[1];
  const paddedDomain = (([start, end]: Range): Range => {
    const [paddedStart, paddedEnd] = getPaddedDomain(start, end, domainOptions);
    if (paddedStart >= 0 && paddedEnd >= 0) return domainOptions?.fit ? [paddedStart, paddedEnd] : [0, paddedEnd];
    if (paddedStart < 0 && paddedEnd < 0) return domainOptions?.fit ? [paddedStart, paddedEnd] : [paddedStart, 0];
    return [paddedStart, paddedEnd];
  })(inverted ? [domain[1], domain[0]] : domain);

  return inverted ? [paddedDomain[1], paddedDomain[0]] : paddedDomain;
}

/**
 * Get Continuous domain from data. May alters domain to constrain to zero baseline.
 *
 * when `domainOptions` is null the domain will not be altered
 * @internal
 */
export function computeContinuousDataDomain(
  data: any[],
  accessor: (n: any) => number,
  scaleType: ScaleType,
  domainOptions?: YDomainRange | null,
): ContinuousDomain {
  const filteredData = domainOptions?.fit && scaleType === ScaleType.Log ? data.filter((d) => accessor(d) !== 0) : data;
  const range = extent<any, number>(filteredData, accessor);

  if (domainOptions === null) {
    return [range[0] ?? 0, range[1] ?? 0];
  }

  return computeDomainExtent(range, domainOptions);
}
