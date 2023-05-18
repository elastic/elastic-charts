/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { ComponentType, isValidElement, ReactNode } from 'react';
import { $Values, isPrimitive } from 'utility-types';
import { v1 as uuidv1 } from 'uuid';

import { AdditiveNumber } from './accessor';
import { Point } from './point';
import { PrimitiveValue } from '../chart_types/partition_chart/layout/utils/group_by_rollup';
import { Color, Colors } from '../common/colors';
import { Degrees, Radian } from '../common/geometry';
import { BaseDatum } from '../specs';

/** @public */
export const Position = Object.freeze({
  Top: 'top' as const,
  Bottom: 'bottom' as const,
  Left: 'left' as const,
  Right: 'right' as const,
});
/** @public */
export type Position = $Values<typeof Position>;

/** @public */
export const LayoutDirection = Object.freeze({
  Horizontal: 'horizontal' as const,
  Vertical: 'vertical' as const,
});
/** @public */
export type LayoutDirection = $Values<typeof LayoutDirection>;

/**
 * Color variants that are unique to `@elastic/charts`. These go beyond the standard
 * static color allocations.
 * @public
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
  /**
   * Computes best color based on background contrast
   */
  Adaptive: '__use__adaptive__color__' as const,
});
/** @public */
export type ColorVariant = $Values<typeof ColorVariant>;

/** @public */
export const HorizontalAlignment = Object.freeze({
  Center: 'center' as const,
  Right: Position.Right,
  Left: Position.Left,
  /**
   * Aligns to near side of axis depending on position
   *
   * Examples:
   * - Left Axis, `Near` will push the label to the `Right`, _near_ the axis
   * - Right Axis, `Near` will push the axis labels to the `Left`
   * - Top/Bottom Axes, `Near` will default to `Center`
   */
  Near: 'near' as const,
  /**
   * Aligns to far side of axis depending on position
   *
   * Examples:
   * - Left Axis, `Far` will push the label to the `Left`, _far_ from the axis
   * - Right Axis, `Far` will push the axis labels to the `Right`
   * - Top/Bottom Axes, `Far` will default to `Center`
   */
  Far: 'far' as const,
});

/**
 * Horizontal text alignment
 * @public
 */
export type HorizontalAlignment = $Values<typeof HorizontalAlignment>;

/** @public */
export const VerticalAlignment = Object.freeze({
  Middle: 'middle' as const,
  Top: Position.Top,
  Bottom: Position.Bottom,
  /**
   * Aligns to near side of axis depending on position
   *
   * Examples:
   * - Top Axis, `Near` will push the label to the `Right`, _near_ the axis
   * - Bottom Axis, `Near` will push the axis labels to the `Left`
   * - Left/Right Axes, `Near` will default to `Middle`
   */
  Near: 'near' as const,
  /**
   * Aligns to far side of axis depending on position
   *
   * Examples:
   * - Top Axis, `Far` will push the label to the `Top`, _far_ from the axis
   * - Bottom Axis, `Far` will push the axis labels to the `Bottom`
   * - Left/Right Axes, `Far` will default to `Middle`
   */
  Far: 'far' as const,
});

/**
 * Vertical text alignment
 * @public
 */
export type VerticalAlignment = $Values<typeof VerticalAlignment>;

/** @public */
export type Datum = any; // unknown;
/** @public */
export type Rotation = 0 | 90 | -90 | 180;
/** @public */
export type Rendering = 'canvas' | 'svg';
/** @public */
export type StrokeStyle = Color; // now narrower than string | CanvasGradient | CanvasPattern

/** @internal */
export function compareByValueAsc(a: number | string, b: number | string): number {
  return a > b ? 1 : a < b ? -1 : 0;
}

/** @internal */
export function clamp(value: number, lowerBound: number, upperBound: number): number {
  return Math.min(Math.max(value, lowerBound), upperBound);
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
    return Colors.Transparent.keyword;
  }

  return color || seriesColor;
}

/** @internal */
export const degToRad = (angle: Degrees): Radian => (angle / 180) * Math.PI;

/** @internal */
export const radToDeg = (radian: Radian): Degrees => (radian * 180) / Math.PI;

/**
 * This function returns a function to generate ids.
 * This can be used to generate unique, but predictable ids to pair labels
 * with their inputs. It takes an optional prefix as a parameter. If you don't
 * specify it, it generates a random id prefix. If you specify a custom prefix
 * it should begin with an letter to be HTML4 compliant.
 * @internal
 */
export function htmlIdGenerator(idPrefix?: string) {
  const prefix = idPrefix || `i${uuidv1()}`;
  return (suffix?: string) => `${prefix}_${suffix || uuidv1()}`;
}

/**
 * Helper function to identify never type for conditionals
 * See https://github.com/microsoft/TypeScript/issues/31751#issuecomment-498526919
 * @internal
 */
export type ExtendsNever<T, Y, N> = [T] extends [never] ? Y : N;

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
 * @public
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
    : T[P] extends NonAny // checks for primitive values
    ? T[P]
    : IsUnknown<T[P], 1, 0> extends 1
    ? T[P]
    : RecursivePartial<T[P]>; // recurse for all non-array and non-primitive values
};

/**
 * return True if T is `any`, otherwise return False
 * @public
 */
export type IsAny<T, True, False = never> = True | False extends (T extends never ? True : False) ? True : False;

/**
 * return True if T is `unknown`, otherwise return False
 * @public
 */
export type IsUnknown<T, True, False = never> = unknown extends T ? IsAny<T, False, True> : False;

/** @public */
export type NonAny = number | boolean | string | symbol | null;

/** @public */
export interface MergeOptions {
  /**
   * Includes all available keys of every provided partial at a given level.
   * This is opposite to normal behavior, which only uses keys from the base
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
export function getAllKeys(object?: any, objects: any[] = []): Set<any> {
  return new Set(
    [object, ...objects].filter(Boolean).reduce((keys: any[], obj) => {
      if (obj && typeof obj === 'object') {
        const newKeys = obj ? (obj instanceof Map ? obj.keys() : Object.keys(obj)) : [];
        keys.push(...newKeys);
      }

      return keys;
    }, []),
  );
}

/** @internal */
export function isArrayOrSet<T>(value: any): value is Array<T> | Set<T> {
  return Array.isArray(value) || value instanceof Set;
}

/** @internal */
export function isNil(value: any): value is null | undefined {
  return value === null || value === undefined;
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
    return new Set(value);
  }

  if (typeof value === 'object' && value !== null) {
    if (value instanceof Map) {
      return new Map(value.entries());
    }

    return { ...value };
  }

  return value;
}

function isReactNode(el: any): el is ReactNode {
  return isNil(el) || isPrimitive(el) || isValidElement(el);
}

function isReactComponent<P extends Record<string, any>>(el: any): el is ComponentType<P> {
  return !isReactNode(el);
}

/**
 * Renders simple react node or react component with props
 * @internal
 */
export function renderWithProps<P extends Record<string, any>>(El: ReactNode | ComponentType<P>, props: P): ReactNode {
  return isReactComponent<P>(El) ? React.createElement(El, props) : El;
}

/**
 * Aligns component children to the correct output type
 * @internal */
export function renderComplexChildren(children: ReactNode): JSX.Element {
  return (() => <>{children}</>)();
}

/**
 * Merges values of a partial structure with a base structure.
 *
 * @note No nested array merging
 *
 * @param base structure to be duplicated, must have all props of `partial`
 * @param partial structure to override values from base
 * @param options options to control merge behaviour
 * @param additionalPartials partials to be used before base and after partial
 *
 * @returns new base structure with updated partial values
 * @internal
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
    const partialKeys = getAllKeys(partial, additionalPartials);
    if (partialKeys.size > 0 && (options.mergeOptionalPartialValues ?? true) && mapCondition) {
      partialKeys.forEach((key) => {
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
          baseClone[key] =
            (partial as any)?.[key] !== undefined
              ? (partial as any)[key]
              : (additionalPartials.find((v: any) => v?.[key] !== undefined) ?? ({} as any))[key];
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

    return Object.keys(baseClone).reduce((newBase, key) => {
      const partialValue = partial && (partial as any)[key];
      const partialValues = additionalPartials.map((v) => (typeof v === 'object' ? (v as any)[key] : undefined));
      const baseValue = (base as any)[key];

      newBase[key] = mergePartial(baseValue, partialValue, options, partialValues);

      return newBase;
    }, baseClone);
  }

  return getPartialValue<T>(baseClone, partial, additionalPartials);
}

/** @public */
export type ValueFormatter = (value: number) => string;
/** @public */
export type ValueAccessor<D extends BaseDatum = Datum> = (d: D) => AdditiveNumber;
/** @public */
export type LabelAccessor<T = PrimitiveValue> = (value: T) => string;
/** @public */
export type ShowAccessor = (value: PrimitiveValue) => boolean;

/**
 * Returns planar distance bewtween two points
 * @internal
 */
export function getDistance(a: Point, b: Point): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

/** @internal */
export function stringifyNullsUndefined(value?: PrimitiveValue): string | number {
  if (value === undefined) {
    return 'undefined';
  }

  if (value === null) {
    return 'null';
  }

  return value;
}

/**
 * Determines if an array has all unique values
 *
 * examples:
 * ```ts
 * isUniqueArray([1, 2]) // => true
 * isUniqueArray([1, 1, 2]) // => false
 * isUniqueArray([{ n: 1 }, { n: 1 }, { n: 2 }], ({ n }) => n) // => false
 * ```
 *
 * @internal
 * @param  {B[]} arr
 * @param  {(d:B)=>T} extractor? extract the value from B
 */
export function isUniqueArray<B, T>(arr: B[], extractor?: (value: B) => T) {
  const values = new Set<B | T>();

  return (function isUniqueArrayFn() {
    return arr.every((v) => {
      const value = extractor ? extractor(v) : v;

      if (values.has(value)) {
        return false;
      }

      values.add(value);
      return true;
    });
  })();
}

/**
 * Returns true if _most_ chars in a string are rtl, exluding spaces and numbers
 * @internal
 */
export function isRTLString(s: string, ratio: number = 0.5) {
  const stripped = s.replaceAll(/[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]|\s|\d/gi, '');
  return stripped.length / s.replaceAll(/\s|\d/gi, '').length < ratio;
}

/** @internal */
export function hasMostlyRTLItems<T extends string>(items: T[], ratio: number = 0.5): boolean {
  const filteredItems = items.filter(Boolean);
  const rtlItemCount = filteredItems.filter((s) => isRTLString(s)).length;
  return rtlItemCount / filteredItems.length > ratio;
}

/**
 * Returns defined value type if not null nor undefined
 *
 * @internal
 */
export function isDefined<T>(value?: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

/**
 * Returns defined value type if value from getter function is not null nor undefined
 *
 * **IMPORTANT**: You must provide an accurate typeCheck function that will filter out _EVERY_
 * item in the array that is not of type `T`. If not, the type check will override the
 * type as `T` which may be incorrect.
 *
 * @internal
 */
export function isDefinedFrom<T>(typeCheck: (value: RecursivePartial<T>) => boolean) {
  return (value?: RecursivePartial<T>): value is NonNullable<T> => {
    if (value === undefined) {
      return false;
    }

    try {
      return typeCheck(value);
    } catch {
      return false;
    }
  };
}

/**
 * Returns rounded number to given decimals
 *
 * @internal
 */
export const round = (value: number, fractionDigits = 0): number => {
  const precision = Math.pow(10, Math.max(fractionDigits, 0));
  const scaledValue = Math.floor(value * precision);

  return scaledValue / precision;
};

/**
 * Get number/percentage value from string
 *
 * i.e. `'90%'` with relative value of `100` returns `90`
 * @internal
 */
export function getPercentageValue<T>(ratio: string | number, relativeValue: number, defaultValue: T): number | T {
  if (typeof ratio === 'number') {
    return Math.abs(ratio);
  }

  const ratioStr = ratio.trim();

  if (/\d+%$/.test(ratioStr)) {
    const percentage = Math.abs(Number.parseInt(ratioStr.slice(0, -1), 10));
    return relativeValue * (percentage / 100);
  }
  const num = Number.parseFloat(ratioStr);
  return Number.isFinite(num) ? Math.abs(num) : defaultValue;
}

/**
 * Predicate function, eg. to be called with [].filter, to keep distinct values
 * @example [1, 2, 4, 2, 4, 0, 3, 2].filter(keepDistinct) ==> [1, 2, 4, 0, 3]
 * @internal
 */
export function keepDistinct<T>(d: T, i: number, a: T[]): boolean {
  return a.indexOf(d) === i;
}

/**
 * Return an object which keys are values of an object and the value is the
 * static one provided
 * @public
 */
export function toEntries<T extends Record<string, string>, S>(
  array: T[],
  accessor: keyof T,
  staticValue: S,
): Record<string, S> {
  return array.reduce<Record<string, S>>((acc, curr) => {
    acc[curr[accessor]] = staticValue;
    return acc;
  }, {});
}

/**
 * Safely format values with error handling
 * @internal
 */
export function safeFormat<V = any>(value: V, formatter?: (value: V) => string): string {
  if (formatter) {
    try {
      return formatter(value);
    } catch {
      // fallthrough
    }
  }

  return `${value}`;
}

/** @internal */
export const range = (from: number, to: number, step: number): number[] =>
  Array.from({ length: Math.abs(Math.round((to - from) / (step || 1))) }, (_, i) => from + i * step);

const oppositeAlignmentMap: Record<string, HorizontalAlignment | VerticalAlignment> = {
  [HorizontalAlignment.Left]: HorizontalAlignment.Right,
  [HorizontalAlignment.Right]: HorizontalAlignment.Left,
  [VerticalAlignment.Top]: VerticalAlignment.Bottom,
  [VerticalAlignment.Bottom]: VerticalAlignment.Top,
};

/** @internal */
export function getOppositeAlignment<A extends HorizontalAlignment | VerticalAlignment>(alignment: A): A {
  return (oppositeAlignmentMap[alignment] as A) ?? alignment;
}

/** @internal */
export function isFiniteNumber(value: unknown): value is number {
  return Number.isFinite(value);
}

/** @internal */
export function isNonNullablePrimitiveValue(value: unknown): value is NonNullable<PrimitiveValue> {
  return typeof value === 'string' || typeof value === 'number';
}

/**
 * Strips all undefined properties from object
 * @internal
 */
export function stripUndefined<R extends Record<string, unknown>>(source: R): R {
  return Object.keys(source).reduce((acc, key) => {
    const val = source[key];
    if (val !== undefined) {
      // @ts-ignore - building new R from {}
      acc[key] = val;
    }
    return acc;
  }, {} as R);
}

/**
 * Returns `Array.filter` callback for values between a min and max
 * @internal
 */
export const isBetween = (min: number, max: number, exclusive = false): ((n: number) => boolean) =>
  exclusive ? (n) => n < max && n > min : (n) => n <= max && n >= min;

/**
 * Returns `Array.reduce` callback to clamp values and remove duplicates
 * @internal
 */
export const clampAll = (
  min: number,
  max: number,
): [callbackfn: (acc: number[], value: number) => number[], initialAcc: number[]] => {
  const seen = new Set<number>();
  return [
    (acc: number[], n: number) => {
      const clampValue = clamp(n, min, max);
      if (!seen.has(clampValue)) acc.push(clampValue);
      seen.add(clampValue);
      return acc;
    },
    [],
  ];
};
