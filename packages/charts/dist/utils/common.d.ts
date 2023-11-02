import { $Values } from 'utility-types';
import { AdditiveNumber } from './accessor';
import { PrimitiveValue } from '../chart_types/partition_chart/layout/utils/group_by_rollup';
import { Color } from '../common/colors';
import { BaseDatum } from '../specs';
/** @public */
export declare const Position: Readonly<{
    Top: "top";
    Bottom: "bottom";
    Left: "left";
    Right: "right";
}>;
/** @public */
export type Position = $Values<typeof Position>;
/** @public */
export declare const LayoutDirection: Readonly<{
    Horizontal: "horizontal";
    Vertical: "vertical";
}>;
/** @public */
export type LayoutDirection = $Values<typeof LayoutDirection>;
/**
 * Color variants that are unique to `@elastic/charts`. These go beyond the standard
 * static color allocations.
 * @public
 */
export declare const ColorVariant: Readonly<{
    /**
     * Uses series color. Rather than setting a static color, this will use the
     * default series color for a given series.
     */
    Series: "__use__series__color__";
    /**
     * Uses empty color, similar to transparent.
     */
    None: "__use__empty__color__";
    /**
     * Computes best color based on background contrast
     */
    Adaptive: "__use__adaptive__color__";
}>;
/** @public */
export type ColorVariant = $Values<typeof ColorVariant>;
/** @public */
export declare const HorizontalAlignment: Readonly<{
    Center: "center";
    Right: "right";
    Left: "left";
    /**
     * Aligns to near side of axis depending on position
     *
     * Examples:
     * - Left Axis, `Near` will push the label to the `Right`, _near_ the axis
     * - Right Axis, `Near` will push the axis labels to the `Left`
     * - Top/Bottom Axes, `Near` will default to `Center`
     */
    Near: "near";
    /**
     * Aligns to far side of axis depending on position
     *
     * Examples:
     * - Left Axis, `Far` will push the label to the `Left`, _far_ from the axis
     * - Right Axis, `Far` will push the axis labels to the `Right`
     * - Top/Bottom Axes, `Far` will default to `Center`
     */
    Far: "far";
}>;
/**
 * Horizontal text alignment
 * @public
 */
export type HorizontalAlignment = $Values<typeof HorizontalAlignment>;
/** @public */
export declare const VerticalAlignment: Readonly<{
    Middle: "middle";
    Top: "top";
    Bottom: "bottom";
    /**
     * Aligns to near side of axis depending on position
     *
     * Examples:
     * - Top Axis, `Near` will push the label to the `Right`, _near_ the axis
     * - Bottom Axis, `Near` will push the axis labels to the `Left`
     * - Left/Right Axes, `Near` will default to `Middle`
     */
    Near: "near";
    /**
     * Aligns to far side of axis depending on position
     *
     * Examples:
     * - Top Axis, `Far` will push the label to the `Top`, _far_ from the axis
     * - Bottom Axis, `Far` will push the axis labels to the `Bottom`
     * - Left/Right Axes, `Far` will default to `Middle`
     */
    Far: "far";
}>;
/**
 * Vertical text alignment
 * @public
 */
export type VerticalAlignment = $Values<typeof VerticalAlignment>;
/** @public */
export type Datum = any;
/** @public */
export type Rotation = 0 | 90 | -90 | 180;
/** @public */
export type Rendering = 'canvas' | 'svg';
/** @public */
export type StrokeStyle = Color;
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
    [P in keyof T]?: T[P] extends NonAny[] ? T[P] : T[P] extends ReadonlyArray<NonAny> ? T[P] : T[P] extends (infer U)[] ? RecursivePartial<U>[] : T[P] extends ReadonlyArray<infer U> ? ReadonlyArray<RecursivePartial<U>> : T[P] extends Set<infer V> ? Set<RecursivePartial<V>> : T[P] extends Map<infer K, infer V> ? Map<K, RecursivePartial<V>> : T[P] extends NonAny ? T[P] : IsUnknown<T[P], 1, 0> extends 1 ? T[P] : RecursivePartial<T[P]>;
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
/** @public */
export type ValueFormatter = (value: number) => string;
/** @public */
export type ValueAccessor<D extends BaseDatum = Datum> = (d: D) => AdditiveNumber;
/** @public */
export type LabelAccessor<T = PrimitiveValue> = (value: T) => string;
/** @public */
export type ShowAccessor = (value: PrimitiveValue) => boolean;
/**
 * Return an object which keys are values of an object and the value is the
 * static one provided
 * @public
 */
export declare function toEntries<T extends Record<string, string>, S>(array: T[], accessor: keyof T, staticValue: S): Record<string, S>;
//# sourceMappingURL=common.d.ts.map