/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { memo } from 'react';

import { BaseDatum } from '../../../chart_types/specs';
import { TooltipHeaderFormatter } from '../../../specs/tooltip';
import { PointerValue } from '../../../state/types';
import { Datum, renderComplexChildren } from '../../../utils/common';
import { PropsOrChildrenWithProps } from '../types';

/** @public */
export type TooltipHeaderProps<D extends BaseDatum = Datum> = PropsOrChildrenWithProps<{
  header?: PointerValue<D> | null;
  formatter?: TooltipHeaderFormatter<D>;
}>;

const TooltipHeaderInner = <D extends BaseDatum = Datum>(props: TooltipHeaderProps<D>) => {
  if ('children' in props) {
    return <div className="echTooltipHeader">{renderComplexChildren(props.children)}</div>;
  }

  const { header, formatter } = props;

  if (!header) return null;

  const formattedValue = formatter ? formatter(header) : header.formattedValue;

  if (!formattedValue) return null;

  return <div className="echTooltipHeader">{formattedValue}</div>;
};

/** @public */
export const TooltipHeader = memo(TooltipHeaderInner) as typeof TooltipHeaderInner;
