/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { memo } from 'react';

import { TooltipValue, TooltipValueFormatter } from '../../../specs';
import { renderComplexChildren } from '../../../utils/common';
import { PropsOrChildrenWithProps } from '../types';

type TooltipHeaderProps = PropsOrChildrenWithProps<{
  header: TooltipValue | null;
  formatter?: TooltipValueFormatter;
}>;

/** @public */
export const TooltipHeader = memo((props: TooltipHeaderProps) => {
  if ('children' in props) {
    return <div className="echTooltip__header">{renderComplexChildren(props.children)}</div>;
  }
  const { header, formatter } = props;
  if (!header || !header.isVisible) return null;

  const formattedValue = formatter ? formatter(header) : header.formattedValue;
  if (!formattedValue) return null;
  return <div className="echTooltip__header">{formattedValue}</div>;
});
