import { GroupKeysOrKeyFn } from '../../chart_types/xy_chart/utils/group_data_series';
/**
 * The function computes the participation ratio of a value in the total sum of its membership group.
 * It returns a shallow copy of the input array where each object is augmented with the computed ratio.
 *
 * @remarks
 * The ratio is computed using absolute values.
 * Product A made a profit of $200, and product B has a loss of $300. In total, the company lost $100 ($200 – $300).
 * Product A has a weight of: abs(200) / ( abs(200) + abs(-300) ) * 100% = 40%
 * Product B has a weight of: abs(-300) / ( abs(200) + abs(-300) ) * 100% = 60%
 * Product A and product B have respectively a weight of 40% and 60% in the formation of the overall total loss of $100.
 *
 * We don't compute the ratio for non-finite values. In this case, we return the original non-finite value.
 *
 * If the sum of the group values is 0, each ratio is considered 0.
 *
 * @public
 * @param data - an array of objects
 * @param groupAccessors - an array of accessor keys or a fn to describe an unique id for each group
 * @param valueGetterSetters - an array of getter and setter functions for the metric and ratio values
 */
export declare function computeRatioByGroups<T extends Record<string, unknown>>(data: T[], groupAccessors: GroupKeysOrKeyFn<T>, valueGetterSetters: Array<[(datum: T) => unknown, (datum: T, value: number) => T]>): T[];
//# sourceMappingURL=data_processing.d.ts.map