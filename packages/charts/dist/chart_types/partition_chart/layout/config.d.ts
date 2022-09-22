import { ShapeTreeNode } from './types/viewmodel_types';
/** @public */
export declare const MODEL_KEY = "parent";
/** @public */
export declare function percentValueGetter(node: ShapeTreeNode): number;
/** @public */
export declare function ratioValueGetter(node: ShapeTreeNode): number;
/** @public */
export declare const VALUE_GETTERS: Readonly<{
    readonly percent: typeof percentValueGetter;
    readonly ratio: typeof ratioValueGetter;
}>;
/** @public */
export declare type ValueGetterName = keyof typeof VALUE_GETTERS;
/** @public */
export declare function defaultPartitionValueFormatter(d: number): string;
//# sourceMappingURL=config.d.ts.map