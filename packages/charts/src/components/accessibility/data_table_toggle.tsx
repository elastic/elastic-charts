/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { ChartType } from '../../chart_types';

interface DataTableToggleProps {
  chartType: ChartType | null;
  chartId: string;
}

/** @internal */
export function DataTableToggle({ chartType, chartId }: DataTableToggleProps) {
  // Only show toggle for XY charts (other chart types already have their own data table implementations)
  if (chartType !== ChartType.XYAxis) return null;

  const buttonId = `${chartId}__data-table-toggle`;

  const handleToggle = () => {
    // TODO: Implement data table toggle functionality in future phase
    // For now, this is just the button structure required by A11Y template
  };

  return (
    <div>
      <button id={buttonId} tabIndex={-1} aria-expanded="false" onClick={handleToggle} type="button">
        View as data table
      </button>
    </div>
  );
}
