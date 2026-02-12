/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { LegendItemExtraValues, LegendItem, LegendItemValue } from '../../common/legend';
import { LegendValue } from '../../common/legend';

const findCurrentValue = (values: LegendItemValue[]) =>
  values.find((v) => v.type === LegendValue.CurrentAndLastValue || v.type === LegendValue.Value);

/** @internal */
export function getExtra(
  extraValues: Map<string, LegendItemExtraValues>,
  item: LegendItem,
  totalItems: number,
): LegendItemValue | undefined {
  const { seriesIdentifiers, values, childId, path } = item;
  const maxLabel = values?.[0]?.maxLabel ?? '';
  // don't show extra if the legend item is associated with multiple series
  if (extraValues.size === 0 || seriesIdentifiers.length > 1 || !seriesIdentifiers[0]) {
    return findCurrentValue(values);
  }
  const [{ key }] = seriesIdentifiers;
  const extraValueKey = path.map(({ index }) => index).join('__');
  const itemExtraValues = extraValues.has(extraValueKey) ? extraValues.get(extraValueKey) : extraValues.get(key);
  const actionExtra = childId !== undefined ? itemExtraValues?.get(childId) : undefined;
  return actionExtra
    ? { ...actionExtra, maxLabel }
    : extraValues.size === totalItems
      ? findCurrentValue(values)
      : undefined;
}

/** @internal */
export const prepareLegendValues = (
  item: LegendItem,
  legendValues: LegendValue[],
  totalItems: number,
  extraValues: Map<string, LegendItemExtraValues>,
) => {
  return legendValues.map((legendValue) => {
    if (legendValue === LegendValue.Value || legendValue === LegendValue.CurrentAndLastValue) {
      return getExtra(extraValues, item, totalItems);
    }
    return item.values.find(({ type }) => type === legendValue);
  });
};
