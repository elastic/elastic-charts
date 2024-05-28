/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { LegendTableCell } from './legend_table_cell';
import { LegendTableRow } from './legend_table_row';
import { LegendValueComponent } from './legend_value';
import { LegendValue, legendValueTitlesMap } from '../../../common/legend';
import { LegendLabelOptions } from '../../../utils/themes/theme';
import { NonInteractiveLabel } from '../label';

/** @internal */
export interface LegendHeaderProps {
  legendValues: Array<LegendValue>;
  hasAction?: boolean;
}

/** @internal */
export const LegendTableHeader = ({
  hasAction,
  legendValues,
  legendTitle = '',
  isMostlyRTL,
  labelOptions,
}: {
  legendValues: LegendValue[];
  hasAction: boolean;
  legendTitle?: string;
  isMostlyRTL?: boolean;
  labelOptions: LegendLabelOptions;
}) => {
  return (
    <div role="rowgroup" className="echLegendTable__rowgroup echLegendTable__header">
      <LegendTableRow className="echLegendTable__item echLegendTable__item--vertical" dir={isMostlyRTL ? 'rtl' : 'ltr'}>
        <LegendTableCell className="echLegend__colorWrapper echLegendTable__colorCell"></LegendTableCell>
        <LegendTableCell>
          <NonInteractiveLabel label={legendTitle} options={labelOptions} />
        </LegendTableCell>
        {legendValues.map((l) => (
          <LegendTableCell key={l}>
            <LegendValueComponent label={legendValueTitlesMap[l]} />
          </LegendTableCell>
        ))}
        {hasAction && <LegendTableCell />}
      </LegendTableRow>
    </div>
  );
};
