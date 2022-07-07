/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { TooltipValueFormatter, TooltipSettings } from '../../../specs';
import { TooltipInfo } from '../types';
import { TooltipHeader } from './tooltip_header';
import { useTooltipContext } from './tooltip_provider';
import { TooltipTable, TooltipTableColumn } from './tooltip_table';
import { TooltipWrapper } from './tooltip_wrapper';

interface TooltipBodyProps {
  visible: boolean;
  info?: TooltipInfo;
  columns: TooltipTableColumn[];
  headerFormatter?: TooltipValueFormatter;
  settings?: TooltipSettings;
}

/** @internal */
export const TooltipBody = ({ info, visible, settings, headerFormatter, columns }: TooltipBodyProps) => {
  const { backgroundColor, dir } = useTooltipContext();
  if (!info || !visible) {
    return null;
  }

  if (typeof settings !== 'string' && settings?.customTooltip) {
    const CustomTooltip = settings.customTooltip;
    return <CustomTooltip {...info} headerFormatter={headerFormatter} backgroundColor={backgroundColor} dir={dir} />;
  }

  return (
    <TooltipWrapper>
      <TooltipHeader header={info.header} formatter={headerFormatter} />
      <TooltipTable columns={columns} items={info.values} backgroundColor={backgroundColor} />
    </TooltipWrapper>
  );
};
