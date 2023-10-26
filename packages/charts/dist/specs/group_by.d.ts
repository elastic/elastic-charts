import { ComponentProps } from 'react';
import { BaseDatum, Spec } from '.';
import { Predicate } from '../common/predicate';
import { SFProps } from '../state/spec_factory';
/** @public */
export type GroupByAccessor<D extends BaseDatum = any> = (spec: Spec, datum: D) => string | number;
/** @alpha */
export type GroupBySort = Predicate;
/**
 * Title formatter that handles any value returned from the GroupByAccessor
 * @public
 */
export type GroupByFormatter<D extends BaseDatum = any> = (value: ReturnType<GroupByAccessor<D>>) => string;
/** @alpha */
export interface GroupBySpec<D extends BaseDatum = any> extends Spec {
    /**
     * Function to return a unique value __by__ which to group the data
     */
    by: GroupByAccessor<D>;
    /**
     * Sort predicate used to sort grouped data
     */
    sort: GroupBySort;
    /**
     * Formatter used on all `by` values.
     *
     * Only for displayed values, not used in sorting or other internal computations.
     */
    format?: GroupByFormatter<D>;
}
declare const buildProps: import("../state/spec_factory").BuildProps<GroupBySpec<any>, "chartType" | "specType", never, "format", "id" | "by" | "sort">;
/**
 * Add GroupBy spec to chart
 * @public
 */
export declare const GroupBy: <D extends BaseDatum = any>(props: SFProps<GroupBySpec<D>, "chartType" | "specType", never, "format", "id" | "by" | "sort">) => null;
/** @public */
export type GroupByProps = ComponentProps<typeof GroupBy>;
export {};
//# sourceMappingURL=group_by.d.ts.map