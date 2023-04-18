/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, text, select } from '@storybook/addon-knobs';
import React from 'react';

import { AreaSeries, Chart, ScaleType, Settings } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const automatedSeries = boolean('Use the default generated series types of charts for screen readers', true);
  const customDescriptionForScreenReaders = text('add a description for screen readers', '');
  const customLabelForScreenReaders = text('add a label for screen readers', '');
  const headingLevelForScreenReaders = customLabelForScreenReaders
    ? select('heading level for label', { P: 'p', H1: 'h1', H2: 'h2', H3: 'h3', H4: 'h4', H5: 'h5', H6: 'h6' }, 'h2')
    : undefined;
  return (
    <Chart>
      <Settings
        baseTheme={useBaseTheme()}
        ariaDescription={customDescriptionForScreenReaders}
        ariaUseDefaultSummary={automatedSeries}
        ariaLabel={customLabelForScreenReaders}
        ariaLabelHeadingLevel={headingLevelForScreenReaders}
      />
      <AreaSeries
        id="area"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={KIBANA_METRICS.metrics.kibana_os_load.v1.data}
      />
    </Chart>
  );
};
