import { ShapeTreeNode } from './types/viewmodel_types';
import { AGGREGATE_KEY, STATISTICS_KEY } from './utils/group_by_rollup';
/** @public */
export declare const MODEL_KEY = "parent";
/** @public */
export declare function percentValueGetter(node: {
    [AGGREGATE_KEY]: number;
    [MODEL_KEY]: {
        [STATISTICS_KEY]: {
            globalAggregate: number;
        };
    };
}): number;
/** @public */
export declare function ratioValueGetter(node: ShapeTreeNode): number;
/** @public */
export declare const VALUE_GETTERS: Readonly<{
    readonly percent: typeof percentValueGetter;
    readonly ratio: typeof ratioValueGetter;
}>;
/** @public */
export type ValueGetterName = keyof typeof VALUE_GETTERS;
/** @public */
export declare function defaultPartitionValueFormatter(d: number): string;
//# sourceMappingURL=config.d.ts.map