/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LegendItemValues, LegendItem } from '../../common/legend';

/** @internal */
export function getValue(values: Map<string, LegendItemValues>, item: LegendItem, totalItems: number) {
  const { seriesIdentifiers, value, childId, path } = item;
  // don't show value if the legend item is associated with multiple series
  if (values.size === 0 || seriesIdentifiers.length > 1 || !seriesIdentifiers[0]) {
    return value.formatted;
  }
  const [{ key }] = seriesIdentifiers;
  const valueKey = path.map(({ index }) => index).join('__');
  const itemValues = values.has(valueKey) ? values.get(valueKey) : values.get(key);
  const actionValue = childId !== undefined ? itemValues?.get(childId) : null;
  return actionValue ? `${actionValue}` : values.size === totalItems ? value.formatted : '';
}
