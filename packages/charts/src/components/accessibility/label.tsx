/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { GoalChartLabels } from '../../chart_types/goal_chart/state/selectors/get_goal_chart_data';
import type { A11ySettings } from '../../state/selectors/get_accessibility_config';

interface ScreenReaderLabelProps {
  goalChartLabels?: GoalChartLabels;
}

/** @internal */
export function ScreenReaderLabel({
  label,
  labelHeadingLevel,
  labelId,
  goalChartLabels,
}: A11ySettings & ScreenReaderLabelProps) {
  const Heading = labelHeadingLevel;

  if (!label && !goalChartLabels?.majorLabel && !goalChartLabels?.minorLabel) return null;

  let unifiedLabel = '';
  if (!label && goalChartLabels?.majorLabel) {
    unifiedLabel = goalChartLabels?.majorLabel;
  } else if (label && !goalChartLabels?.majorLabel) {
    unifiedLabel = label;
  } else if (label && goalChartLabels?.majorLabel && label !== goalChartLabels?.majorLabel) {
    unifiedLabel = `${label}; Chart visible label: ${goalChartLabels?.majorLabel}`;
  }

  return (
    <>
      {unifiedLabel && <Heading id={labelId}>{unifiedLabel}</Heading>}
      {goalChartLabels?.minorLabel && <p>{goalChartLabels?.minorLabel}</p>}
    </>
  );
}
