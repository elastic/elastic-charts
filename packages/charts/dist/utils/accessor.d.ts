import { BaseDatum } from '../chart_types/specs';
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
export declare type BinaryAccessorFn<D extends BaseDatum = any, Return = any> = (datum: D, index: number) => Return;
/**
 * An accessor function
 * @public
 */
export declare type AccessorFn<D extends BaseDatum = any, Return = any> = UnaryAccessorFn<D, Return>;
/**
 * An indexed accessor function
 * @public
 */
export declare type IndexedAccessorFn<D extends BaseDatum = any, Return = any> = UnaryAccessorFn<D, Return> | BinaryAccessorFn<D, Return>;
/**
 * A key accessor string
 * @public
 */
export declare type AccessorObjectKey = string;
/**
 * An index accessor number
 * @public
 */
export declare type AccessorArrayIndex = number;
/**
 * Need to check for array to exclude array prototype keys.
 *
 * TODO: tighten keyof types by removing string fallback. This will make it harder to satisfy the
 * types for complex data values.
 *
 * Note: ignores symbols as keys
 * @public
 */
export declare type DatumKey<D extends BaseDatum> = D extends any[] ? number : Exclude<keyof D, symbol> | string;
/**
 * A datum accessor in form of object key accessor string/number
 * @public
 */
export declare type Accessor<D extends BaseDatum = never> = DatumKey<D> | AccessorObjectKey | AccessorArrayIndex;
/**
 * Accessor format for _banded_ series as postfix string or accessor function
 * @public
 */
export declare type AccessorFormat = string | ((value: string) => string);
/**
 * Additive numbers: numbers whose semantics are conducive to addition; eg. counts and sums are additive, but averages aren't
 * @public
 */
export declare type AdditiveNumber = number;
//# sourceMappingURL=accessor.d.ts.map