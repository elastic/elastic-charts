/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { ChartLabelData } from './types';
import type { A11ySettings } from '../../state/selectors/get_accessibility_config';

interface ScreenReaderLabelProps {
  chartLabelData?: ChartLabelData;
}

/** @internal */
export function ScreenReaderLabel({
  label,
  labelHeadingLevel,
  labelId,
  chartLabelData,
}: A11ySettings & ScreenReaderLabelProps) {
  const Heading = labelHeadingLevel;

  if (!label && !chartLabelData?.primaryLabel && !chartLabelData?.secondaryLabel) return null;

  let unifiedLabel = '';
  if (!label && chartLabelData?.primaryLabel) {
    unifiedLabel = chartLabelData.primaryLabel;
  } else if (label && !chartLabelData?.primaryLabel) {
    unifiedLabel = label;
  } else if (label && chartLabelData?.primaryLabel && label !== chartLabelData.primaryLabel) {
    unifiedLabel = `${label}; Chart visible label: ${chartLabelData.primaryLabel}`;
  }

  return (
    <>
      {unifiedLabel && <Heading id={labelId}>{unifiedLabel}</Heading>}
      {chartLabelData?.secondaryLabel && <p>{chartLabelData.secondaryLabel}</p>}
    </>
  );
}
