/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LegendItemExtraValues, LegendItem, LegendItemValue } from '../../common/legend';

/** @internal */
export function getExtra(
  extraValues: Map<string, LegendItemExtraValues>,
  item: LegendItem,
  totalItems: number,
): LegendItemValue | undefined {
  const { seriesIdentifiers, values, childId, path } = item;
  // don't show extra if the legend item is associated with multiple series
  if (extraValues.size === 0 || seriesIdentifiers.length > 1 || !seriesIdentifiers[0]) {
    return values.length > 0 ? { label: `${values[0]?.label ?? ''}`, value: values[0]?.value ?? null } : undefined;
  }
  const [{ key }] = seriesIdentifiers;
  const extraValueKey = path.map(({ index }) => index).join('__');
  const itemExtraValues = extraValues.has(extraValueKey) ? extraValues.get(extraValueKey) : extraValues.get(key);
  const actionExtra = childId !== undefined ? itemExtraValues?.get(childId) : undefined;
  return actionExtra
    ? actionExtra
    : extraValues.size === totalItems && values.length > 0
      ? { label: `${values[0]?.label ?? ''}`, value: values[0]?.value ?? null }
      : undefined;
}
