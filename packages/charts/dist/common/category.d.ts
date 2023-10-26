/**
 * A string key is used to uniquely identify categories
 *
 * todo: broaden it; some options:
 *   - allow other values of `PrimitiveValue` type (now: string | number | null) but should add Symbol
 *   - allow a descriptor object, eg. `{ key: PrimitiveValue, label: string }`
 *   - allow an accessor that operates on the key, and maps it to a label
 */
/** @public */
export type CategoryKey = string;
/** @public */
export type CategoryLabel = string;
//# sourceMappingURL=category.d.ts.map