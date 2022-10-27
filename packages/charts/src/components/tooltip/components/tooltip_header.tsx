/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { memo } from 'react';

import { SeriesIdentifier } from '../../../common/series_id';
import { BaseDatum, TooltipValue, TooltipValueFormatter } from '../../../specs';
import { Datum, renderComplexChildren } from '../../../utils/common';
import { PropsOrChildrenWithProps } from '../types';
import { TooltipDivider } from './tooltip_divider';

type TooltipHeaderProps<
  D extends BaseDatum = Datum,
  SI extends SeriesIdentifier = SeriesIdentifier,
> = PropsOrChildrenWithProps<{
  header: TooltipValue<D, SI> | null;
  formatter?: TooltipValueFormatter<D, SI>;
}>;

const TooltipHeaderInner = <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>(
  props: TooltipHeaderProps<D, SI>,
) => {
  if ('children' in props) {
    return (
      <>
        <div className="echTooltip__header">{renderComplexChildren(props.children)}</div>
        <TooltipDivider />
      </>
    );
  }
  const { header, formatter } = props;
  if (!header || !header.isVisible) return null;

  const formattedValue = formatter ? formatter(header) : header.formattedValue;
  if (!formattedValue) return null;
  return (
    <>
      <div className="echTooltip__header">{formattedValue}</div>
      <TooltipDivider />
    </>
  );
};

/** @public */
export const TooltipHeader = memo(TooltipHeaderInner) as typeof TooltipHeaderInner;
