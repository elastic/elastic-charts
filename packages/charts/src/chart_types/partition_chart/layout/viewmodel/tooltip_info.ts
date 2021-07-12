/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { TooltipInfo } from '../../../../components/tooltip/types';
import { LabelAccessor, ValueFormatter } from '../../../../utils/common';
import { percentValueGetter, sumValueGetter } from '../config';
import { QuadViewModel, ValueGetter } from '../types/viewmodel_types';
import { valueGetterFunction } from './scenegraph';

/** @internal */
export const EMPTY_TOOLTIP = Object.freeze({
  header: null,
  values: [],
});

/** @internal */
export function getTooltipInfo(
  pickedShapes: QuadViewModel[],
  labelFormatters: (LabelAccessor | undefined)[],
  valueGetter: ValueGetter,
  valueFormatter: ValueFormatter,
  percentFormatter: ValueFormatter,
  id: string,
): TooltipInfo {
  if (!valueFormatter || !labelFormatters) {
    return EMPTY_TOOLTIP;
  }

  const tooltipInfo: TooltipInfo = {
    header: null,
    values: [],
  };

  const valueGetterFun = valueGetterFunction(valueGetter);
  const primaryValueGetterFun = valueGetterFun === percentValueGetter ? sumValueGetter : valueGetterFun;
  pickedShapes.forEach((shape) => {
    const formatter = labelFormatters[shape.depth - 1];
    const value = primaryValueGetterFun(shape);

    tooltipInfo.values.push({
      label: formatter ? formatter(shape.dataName) : shape.dataName,
      color: shape.fillColor,
      isHighlighted: false,
      isVisible: true,
      seriesIdentifier: {
        specId: id,
        key: id,
      },
      value,
      formattedValue: `${valueFormatter(value)} (${percentFormatter(percentValueGetter(shape))})`,
      valueAccessor: shape.depth,
      // the datum is omitted ATM due to the aggregated and nested nature of a partition section
    });
  });

  return tooltipInfo;
}
