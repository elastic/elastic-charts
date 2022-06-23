/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { TooltipValueFormatter, TooltipSettings } from '../../../specs';
import { hasMostlyRTLItems } from '../../../utils/common';
import { TooltipInfo } from '../types';
import { TooltipHeader } from './tooltip_header';
import { TooltipList } from './tooltip_list';
import { TooltipWrapper } from './tooltip_wrapper';

interface TooltipBodyProps {
  visible: boolean;
  info?: TooltipInfo;
  headerFormatter?: TooltipValueFormatter;
  settings?: TooltipSettings;
  backgroundColor: string;
}

/** @internal */
export const TooltipBody = ({ info, visible, settings, headerFormatter, backgroundColor }: TooltipBodyProps) => {
  if (!info || !visible) {
    return null;
  }

  const isMostlyRTL = hasMostlyRTLItems([...info.values.map(({ label }) => label), info.header?.label ?? '']);

  if (typeof settings !== 'string' && settings?.customTooltip) {
    const CustomTooltip = settings.customTooltip;
    return (
      <CustomTooltip
        {...info}
        headerFormatter={headerFormatter}
        backgroundColor={backgroundColor}
        dir={isMostlyRTL ? 'rtl' : 'ltr'}
      />
    );
  }

  return (
    <TooltipWrapper className="echTooltip" dir={isMostlyRTL ? 'rtl' : 'ltr'}>
      <TooltipHeader header={info.header} formatter={headerFormatter}></TooltipHeader>
      <TooltipList items={info.values} backgroundColor={backgroundColor}></TooltipList>
    </TooltipWrapper>
  );
};
