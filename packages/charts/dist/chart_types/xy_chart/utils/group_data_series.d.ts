/** @public */
export type GroupByKeyFn<T> = (data: T) => string;
/** @public */
export type GroupKeysOrKeyFn<T> = Array<keyof T> | GroupByKeyFn<T>;
//# sourceMappingURL=group_data_series.d.ts.map