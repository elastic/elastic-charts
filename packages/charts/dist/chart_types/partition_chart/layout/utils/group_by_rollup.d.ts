import { CategoryKey } from '../../../../common/category';
import { LegendPath } from '../../../../state/actions/legend';
/** @public */
export declare const AGGREGATE_KEY = "value";
/** @public */
export declare const STATISTICS_KEY = "statistics";
/** @public */
export declare const DEPTH_KEY = "depth";
/** @public */
export declare const CHILDREN_KEY = "children";
/** @public */
export declare const INPUT_KEY = "inputIndex";
/** @public */
export declare const PARENT_KEY = "parent";
/** @public */
export declare const SORT_INDEX_KEY = "sortIndex";
/** @public */
export declare const PATH_KEY = "path";
/** @public */
export interface Statistics {
    globalAggregate: number;
}
/** @public */
export interface NodeDescriptor {
    [AGGREGATE_KEY]: number;
    [DEPTH_KEY]: number;
    [STATISTICS_KEY]: Statistics;
    [INPUT_KEY]?: Array<number>;
}
/** @public */
export type ArrayEntry = [Key, ArrayNode];
/** @public */
export type HierarchyOfArrays = Array<ArrayEntry>;
/** @public */
export interface ArrayNode extends NodeDescriptor {
    [CHILDREN_KEY]: HierarchyOfArrays;
    [PARENT_KEY]: ArrayNode;
    [SORT_INDEX_KEY]: number;
    [PATH_KEY]: LegendPath;
}
/**
 * Used in the first position of a `LegendPath` array, which indicates the stringified value of the `groupBy` value
 * in case of small multiples, but has no applicable `groupBy` for singleton (non-small-multiples) charts
 * @public
 */
export declare const NULL_SMALL_MULTIPLES_KEY: Key;
/**
 * Indicates that a node is the root of a specific partition chart, eg. the root of a single pie chart, or one pie
 * chart in a small multiples setting. Used in the second position of a `LegendPath` array
 * @public
 */
export declare const HIERARCHY_ROOT_KEY: Key;
/**
 * A primitive JavaScript value, possibly further restricted
 * @public
 */
export type PrimitiveValue = string | number | null;
/** @public */
export type Key = CategoryKey;
/** @public */
export type Sorter = (a: number, b: number) => number;
/**
 * Binary predicate function used for `[].sort`ing partitions represented as ArrayEntries
 * @public
 */
export type NodeSorter = (a: ArrayEntry, b: ArrayEntry) => number;
/** @public */
export declare const entryKey: ([key]: ArrayEntry) => string;
/** @public */
export declare const entryValue: ([, value]: ArrayEntry) => ArrayNode;
/** @public */
export declare function depthAccessor(n: ArrayEntry): number;
/** @public */
export declare function aggregateAccessor(n: ArrayEntry): number;
/** @public */
export declare function parentAccessor(n: ArrayEntry): ArrayNode;
/** @public */
export declare function childrenAccessor(n: ArrayEntry): HierarchyOfArrays;
/** @public */
export declare function sortIndexAccessor(n: ArrayEntry): number;
/** @public */
export declare function pathAccessor(n: ArrayEntry): LegendPath;
/** @public */
export declare function getNodeName(node: ArrayNode): string;
//# sourceMappingURL=group_by_rollup.d.ts.map