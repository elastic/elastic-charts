/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { text } from '@storybook/addon-knobs';
import numeral from 'numeral';
import React from 'react';

import { AreaSeries, Axis, Chart, CurveType, Position, ScaleType, Settings } from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';
import { SB_SOURCE_PANEL } from '../utils/storybook';

export const Example = () => {
  const tickFormatBottom = text('tickFormat bottom', '0.0000');
  const labelFormatBottom = text('labelFormat bottom', '0.0');
  const tickFormatLeft = text('tickFormat left', '$ 0,0[.]00');
  const labelFormatLeft = text('labelFormat left', '$ 0,0');
  const start = KIBANA_METRICS.metrics.kibana_os_load[0].data[0][0];
  const data = KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(0, 20).map((d) => [(d[0] - start) / 30000, d[1]]);

  return (
    <Chart>
      <Settings baseTheme={useBaseTheme()} />
      <Axis
        id="bottom"
        title="Weight"
        position={Position.Bottom}
        tickFormat={(d) => numeral(d).format(tickFormatBottom)}
        labelFormat={(d) => numeral(d).format(labelFormatBottom)}
      />
      <Axis
        id="left"
        title="Price"
        position={Position.Left}
        tickFormat={(d) => numeral(d).format(tickFormatLeft)}
        labelFormat={(d) => numeral(d).format(labelFormatLeft)}
      />

      <AreaSeries
        id="areas"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data}
        curve={CurveType.CURVE_MONOTONE_X}
      />
    </Chart>
  );
};

Example.parameters = {
  options: { selectedPanel: SB_SOURCE_PANEL },
  docs: {
    description: {
      story: `You can apply different formatter between tick values in the tooltip and legend by using
      different values for \`tickFormat\` and \`labelFormat\`.

Use a [numeraljs](http://numeraljs.com/) format with the knobs to see the difference`,
    },
  },
};
