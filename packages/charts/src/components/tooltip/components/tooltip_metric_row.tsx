/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ReactNode } from 'react';
import React, { memo } from 'react';

type TooltipMetricRowProps = {
  label: string;
  metric: ReactNode;
};

/** @public */
export const TooltipMetricRow = memo(({ label, metric }: TooltipMetricRowProps) => {
  return (
    <div className="echTooltip__metricRow">
      {label}
      <b>{metric}</b>
    </div>
  );
});
