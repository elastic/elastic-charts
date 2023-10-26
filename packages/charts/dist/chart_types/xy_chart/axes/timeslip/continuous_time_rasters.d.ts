/** @public */
export type BinUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond' | 'one';
/** @public */
export declare const unitIntervalWidth: Record<BinUnit, number>;
/**
 * Left closed, right open interval on (connected subset of) on a partially ordered set
 * Poset covers real numbers, integers, time, ordinals incl. ordered categories, trees, DAGs
 * Valid but useless for fully unordered categorical (nominal) values.
 * It's simply called Interval because we don't currently model other interval types eg. closed.
 * @public
 */
export interface Interval {
    /**
     * Lower bound of interval (included)
     */
    minimum: number;
    /**
     * Upper bound of interval (excluded)
     */
    supremum: number;
    /**
     * Upper bound of interval to stick text label
     */
    labelSupremum: number;
}
//# sourceMappingURL=continuous_time_rasters.d.ts.map