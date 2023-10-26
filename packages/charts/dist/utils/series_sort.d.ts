import { SeriesIdentifier } from '../common/series_id';
/**
 * A compare function used to determine the order of the elements. It is expected to return
 * a negative value if first argument is less than second argument, zero if they're equal and a positive
 * value otherwise.
 * @public
 */
export type SeriesCompareFn = (siA: SeriesIdentifier, siB: SeriesIdentifier) => number;
//# sourceMappingURL=series_sort.d.ts.map