/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getExtra } from './utils';
import type { LegendItem, LegendItemExtraValues } from '../../common/legend';
import { LegendValue } from '../../common/legend';

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
