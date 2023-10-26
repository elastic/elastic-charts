import { CategoryKey } from '../../common/category';
/** @public */
export type LegendPathElement = {
    index: number;
    value: CategoryKey;
};
/**
 * This is an array that defines a path for chart types characterized by hierarchical breakdown of the data, currently
 * partition charts. With partition charts,
 *   - element index 0 is the `groupBy` breakdown: a panel `index` number, and a stringified category `value`
 *      - if the chart is a singleton, ie. there's no trellising, it's `{index: 0, value: NULL_SMALL_MULTIPLES_KEY}`
 *   - element index 1 represents the singular root of a specific pie etc. chart `{index: 0, value: HIERARCHY_ROOT_KEY}`
 *   - element index 2 represents the primary breakdown categories within a pie/treemap/etc.
 *   - element index 3 the next level breakdown, if any (eg. a ring around the pie, ie. sunburst)
 *   etc.
 * @public
 */
export type LegendPath = LegendPathElement[];
//# sourceMappingURL=legend.d.ts.map