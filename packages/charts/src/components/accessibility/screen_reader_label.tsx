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

  if (!label && !chartLabelData?.majorLabel && !chartLabelData?.minorLabel) return null;

  let unifiedLabel = '';
  if (!label && chartLabelData?.majorLabel) {
    unifiedLabel = chartLabelData.majorLabel;
  } else if (label && !chartLabelData?.majorLabel) {
    unifiedLabel = label;
  } else if (label && chartLabelData?.majorLabel && label !== chartLabelData.majorLabel) {
    unifiedLabel = `${label}; Chart visible label: ${chartLabelData.majorLabel}`;
  }

  return (
    <>
      {unifiedLabel && <Heading id={labelId}>{unifiedLabel}</Heading>}
      {chartLabelData?.minorLabel && <p>{chartLabelData.minorLabel}</p>}
    </>
  );
}
