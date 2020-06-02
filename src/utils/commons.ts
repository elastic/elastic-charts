/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { $Values } from 'utility-types';
import { v1 as uuidV1 } from 'uuid';

import { PrimitiveValue } from '../chart_types/partition_chart/layout/utils/group_by_rollup';

/**
 * Color varients that are unique to `@elastic/charts`. These go beyond the standard
 * static color allocations.
 */
export const ColorVariant = Object.freeze({
  /**
   * Uses series color. Rather than setting a static color, this will use the
   * default series color for a given series.
   */
  Series: '__use__series__color__' as const,
  /**
   * Uses empty color, similar to transparent.
   */
  None: '__use__empty__color__' as const,
});
export type ColorVariant = $Values<typeof ColorVariant>;

export type Datum = any; // unknown;
export type Rotation = 0 | 90 | -90 | 180;
export type Rendering = 'canvas' | 'svg';
export type Color = string;
export type StrokeStyle = Color; // now narrower than string | CanvasGradient | CanvasPattern

export const Position = Object.freeze({
  Top: 'top' as const,
  Bottom: 'bottom' as const,
  Left: 'left' as const,
  Right: 'right' as const,
});
export type Position = $Values<typeof Position>;

/** @internal */
export function identity<T>(value: T): T {
  return value;
}

/** @internal */
export function compareByValueAsc(a: number | string, b: number | string): number {
  return a > b ? 1 : -1;
}

/**
 * Return the minimum value between val1 and val2. The value is bounded from below by lowerLimit
 * @param val1 a numeric value
 * @param val2 a numeric value
 * @param lowerLimit the lower limit
 * @internal
 */
export function minValueWithLowerLimit(val1: number, val2: number, lowerLimit: number) {
  return Math.max(Math.min(val1, val2), lowerLimit);
}

/**
 * Return the maximum value between val1 and val2. The value is bounded from above by upperLimit
 * @param val1 a numeric value
 * @param val2 a numeric value
 * @param upperLimit the upper limit
 * @internal
 */
export function maxValueWithUpperLimit(val1: number, val2: number, upperLimit: number) {
  return Math.min(Math.max(val1, val2), upperLimit);
}

/**
 * Returns color given any color variant
 *
 * @internal
 */
export function getColorFromVariant(seriesColor: Color, color?: Color | ColorVariant): Color {
  if (color === ColorVariant.Series) {
    return seriesColor;
  }

  if (color === ColorVariant.None) {
    return 'transparent';
  }

  return color || seriesColor;
}

/**
 * This function returns a function to generate ids.
 * This can be used to generate unique, but predictable ids to pair labels
 * with their inputs. It takes an optional prefix as a parameter. If you don't
 * specify it, it generates a random id prefix. If you specify a custom prefix
 * it should begin with an letter to be HTML4 compliant.
 * @internal
 */
export function htmlIdGenerator(idPrefix?: string) {
  const prefix = idPrefix || `i${uuidV1()}`;
  return (suffix?: string) => `${prefix}_${suffix || uuidV1()}`;
}

/**
 * Replaces all properties on any type as optional, includes nested types
 *
 * example:
 * ```ts
 * interface Person {
 *  name: string;
 *  age?: number;
 *  spouse: Person;
 *  children: Person[];
 * }
 * type PartialPerson = RecursivePartial<Person>;
 * // results in
 * interface PartialPerson {
 *  name?: string;
 *  age?: number;
 *  spouse?: RecursivePartial<Person>;
 *  children?: RecursivePartial<Person>[]
 * }
 * ```
 */
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends NonAny[] // checks for nested any[]
    ? T[P]
    : T[P] extends ReadonlyArray<NonAny> // checks for nested ReadonlyArray<any>
    ? T[P]
    : T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends ReadonlyArray<infer U> // eslint-disable-line @typescript-eslint/array-type
    ? ReadonlyArray<RecursivePartial<U>> // eslint-disable-line @typescript-eslint/array-type
    : T[P] extends Set<infer V> // checks for Sets
    ? Set<RecursivePartial<V>>
    : T[P] extends Map<infer K, infer V> // checks for Maps
    ? Map<K, RecursivePartial<V>>
    : T[P] extends NonAny // checks for primative values
    ? T[P]
    : RecursivePartial<T[P]>; // recurse for all non-array and non-primative values
};
type NonAny = number | boolean | string | symbol | null;

export interface MergeOptions {
  /**
   * Includes all available keys of every provided partial at a given level.
   * This is opposite to normal behavoir, which only uses keys from the base
   * object to merge values.
   *
   * @defaultValue false
   */
  mergeOptionalPartialValues?: boolean;
  /**
   * Merges Maps same as objects. By default this is disabled and Maps are replaced on the base
   * with a defined Map on any partial.
   *
   * @defaultValue false
   */
  mergeMaps?: boolean;
}

/** @internal */
export function getPartialValue<T>(base: T, partial?: RecursivePartial<T>, partials: RecursivePartial<T>[] = []): T {
  const partialWithValue = partial !== undefined ? partial : partials.find((v) => v !== undefined);
  return partialWithValue !== undefined ? (partialWithValue as T) : base;
}

/**
 * Returns all top-level keys from one or more objects
 * @param object - first object to get keys
 * @param objects
 * @internal
 */
export function getAllKeys(object: any, objects: any[] = []): string[] {
  const initalKeys = object instanceof Map ? [...object.keys()] : Object.keys(object);

  return objects.reduce((keys: any[], obj) => {
    if (obj && typeof obj === 'object') {
      const newKeys = obj instanceof Map ? obj.keys() : Object.keys(obj);
      keys.push(...newKeys);
    }

    return keys;
  }, initalKeys);
}

/** @internal */
export function isArrayOrSet(value: any): boolean {
  return Array.isArray(value) || value instanceof Set;
}

/** @internal */
export function hasPartialObjectToMerge<T>(
  base: T,
  partial?: RecursivePartial<T>,
  additionalPartials: RecursivePartial<T>[] = [],
): boolean {
  if (isArrayOrSet(base)) {
    return false;
  }

  if (typeof base === 'object' && base !== null) {
    if (typeof partial === 'object' && !isArrayOrSet(partial) && partial !== null) {
      return true;
    }

    return additionalPartials.some((p) => typeof p === 'object' && !Array.isArray(p));
  }

  return false;
}

/** @internal */
export function shallowClone(value: any) {
  if (Array.isArray(value)) {
    return [...value];
  }

  if (value instanceof Set) {
    return new Set([...value]);
  }

  if (typeof value === 'object' && value !== null) {
    if (value instanceof Map) {
      return new Map(value.entries());
    }

    return { ...value };
  }

  return value;
}

/**
 * Merges values of a partial structure with a base structure.
 *
 * @note No nested array merging
 *
 * @param base structure to be duplicated, must have all props of `partial`
 * @param partial structure to override values from base
 *
 * @returns new base structure with updated partial values
 */
export function mergePartial<T>(
  base: T,
  partial?: RecursivePartial<T>,
  options: MergeOptions = {},
  additionalPartials: RecursivePartial<T>[] = [],
): T {
  const baseClone = shallowClone(base);

  if (hasPartialObjectToMerge(base, partial, additionalPartials)) {
    const mapCondition = !(baseClone instanceof Map) || options.mergeMaps;
    if (partial !== undefined && options.mergeOptionalPartialValues && mapCondition) {
      getAllKeys(partial, additionalPartials).forEach((key) => {
        if (baseClone instanceof Map) {
          if (!baseClone.has(key)) {
            baseClone.set(
              key,
              (partial as any).get(key) !== undefined
                ? (partial as any).get(key)
                : additionalPartials.find((v: any) => v.get(key) !== undefined) || new Map().get(key),
            );
          }
        } else if (!(key in baseClone)) {
          baseClone[key] = (partial as any)[key] !== undefined
            ? (partial as any)[key]
            : (additionalPartials.find((v: any) => v[key] !== undefined) || ({} as any))[key];
        }
      });
    }

    if (baseClone instanceof Map) {
      if (options.mergeMaps) {
        return [...baseClone.keys()].reduce((newBase: Map<any, any>, key) => {
          const partialValue = partial && (partial as any).get(key);
          const partialValues = additionalPartials.map((v) =>
            typeof v === 'object' && v instanceof Map ? v.get(key) : undefined,
          );
          const baseValue = (base as any).get(key);

          newBase.set(key, mergePartial(baseValue, partialValue, options, partialValues));

          return newBase;
        }, baseClone as any);
      }

      if (partial !== undefined) {
        return partial as any;
      }

      const additional = additionalPartials.find((p: any) => p !== undefined);
      if (additional) {
        return additional as any;
      }

      return baseClone as any;
    }

    return Object.keys(base).reduce((newBase, key) => {
      const partialValue = partial && (partial as any)[key];
      const partialValues = additionalPartials.map((v) => (typeof v === 'object' ? (v as any)[key] : undefined));
      const baseValue = (base as any)[key];

      newBase[key] = mergePartial(baseValue, partialValue, options, partialValues);

      return newBase;
    }, baseClone);
  }

  return getPartialValue<T>(baseClone, partial, additionalPartials);
}

/** @internal */
export function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((element) => typeof element === 'number');
}

/** @internal */
export function getUniqueValues<T>(fullArray: T[], uniqueProperty: keyof T): T[] {
  return fullArray.reduce<{
    filtered: T[];
    uniqueValues: Set<T[keyof T]>;
  }>(
    (acc, currentValue) => {
      const uniqueValue = currentValue[uniqueProperty];
      if (acc.uniqueValues.has(uniqueValue)) {
        return acc;
      }
      acc.uniqueValues.add(uniqueValue);
      acc.filtered.push(currentValue);
      return acc;
    },
    {
      filtered: [],
      uniqueValues: new Set(),
    },
  ).filtered;
}

export type ValueFormatter = (value: number) => string;
export type ValueAccessor = (d: Datum) => number;
export type LabelAccessor = (value: PrimitiveValue) => string;
export type ShowAccessor = (value: PrimitiveValue) => boolean;
