/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { BaseDatum } from '../chart_types/specs';

/**
 * Accessor function
 * @param datum - the datum
 * @public
 */
export interface UnaryAccessorFn<D extends BaseDatum = any, Return = any> {
  /**
   * Name used as accessor field name in place of function reference
   */
  fieldName?: string;
  (datum: D): Return;
}

/**
 * Accessor function
 * @param datum - the datum
 * @param index - the index in the array
 * @public
 */
export type BinaryAccessorFn<D extends BaseDatum = any, Return = any> = (datum: D, index: number) => Return;

/**
 * An accessor function
 * @public
 */
export type AccessorFn<D extends BaseDatum = any, Return = any> = UnaryAccessorFn<D, Return>;

/**
 * An indexed accessor function
 * @public
 */
export type IndexedAccessorFn<D extends BaseDatum = any, Return = any> =
  | UnaryAccessorFn<D, Return>
  | BinaryAccessorFn<D, Return>;

/**
 * A key accessor string
 * @public
 */
export type AccessorObjectKey = string;

/**
 * An index accessor number
 * @public
 */
export type AccessorArrayIndex = number;

/**
 * Need to check for array to exclude array prototype keys.
 *
 * TODO: tighten keyof types by removing string fallback. This will make it harder to satisfy the
 * types for complex data values.
 *
 * Note: ignores symbols as keys
 * @public
 */
export type DatumKey<D extends BaseDatum> = D extends any[] ? number : Exclude<keyof D, symbol> | string;

/**
 * A datum accessor in form of object key accessor string/number
 * @public
 */
export type Accessor<D extends BaseDatum = never> = DatumKey<D> | AccessorObjectKey | AccessorArrayIndex;

/**
 * Accessor format for _banded_ series as postfix string or accessor function
 * @public
 */
export type AccessorFormat = string | ((value: string) => string);

/**
 * Return an accessor function using the accessor passed as argument
 * @param accessor the spec accessor
 * @internal
 */
export function getAccessorFn<D extends BaseDatum>(accessor: Accessor<D>): AccessorFn<D> {
  return (datum: D) =>
    typeof datum === 'object' && datum !== null ? datum[accessor as keyof typeof datum] : undefined;
}

/**
 * Return the accessor label given as `AccessorFormat`
 * @internal
 */
export function getAccessorFormatLabel(accessor: AccessorFormat, label: string): string {
  if (typeof accessor === 'string') {
    return `${label}${accessor}`;
  }

  return accessor(label);
}

/**
 * Helper function to get accessor value from string, number or function
 * @internal
 */
export function getAccessorValue<D extends BaseDatum>(datum: D, accessor: Accessor<D> | AccessorFn<D>) {
  if (typeof accessor === 'function') {
    return accessor(datum);
  }

  try {
    // @ts-ignore - could throw error if not proper key accessed
    return datum[accessor];
  } catch {
    return undefined;
  }
}

/**
 * Additive numbers: numbers whose semantics are conducive to addition; eg. counts and sums are additive, but averages aren't
 * @public
 */
export type AdditiveNumber = number;
