/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { TooltipWrapper, CustomTooltip, TooltipTable } from '@elastic/charts';

import { tableMultipleX } from './data';
import { TooltipShowcase } from './tooltip_showcase';

export const Example = () => {
  const columns = [
    { header: 'X Value', accessor: 'x' },
    { header: 'Y Value', accessor: 'y' },
    { header: 'Z Value', accessor: 'z' },
  ];
  const MyTooltip: CustomTooltip = ({ values, backgroundColor }) => {
    return (
      <TooltipWrapper>
        <TooltipTable items={values} columns={columns} backgroundColor={backgroundColor} />
      </TooltipWrapper>
    );
  };
  return <TooltipShowcase info={tableMultipleX} settings={{ customTooltip: MyTooltip }} />;
};
