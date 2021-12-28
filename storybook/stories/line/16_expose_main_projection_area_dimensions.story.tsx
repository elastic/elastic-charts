/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';
import React, { useState } from 'react';

import {
  Axis,
  Chart,
  LineSeries,
  niceTimeFormatByDay,
  Position,
  ScaleType,
  Settings,
  timeFormatter,
} from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { useBaseTheme } from '../../use_base_theme';

const dateFormatter = timeFormatter(niceTimeFormatByDay(1));

interface Dimensions {
  height: number;
  left: number;
  top: number;
  width: number;
}

// MainProjectionAreaDimensions

export const Example = ({
  onInternalMainProjectionAreaDimensionsChange,
}: {
  onInternalMainProjectionAreaDimensionsChange: (d: Dimensions) => void;
}) => {
  const legendEnabled = boolean('enable legend', false);
  const axisEnabled = boolean('enable y axis', true);

  const [dimensions, setDimensions] = useState({ left: 0, width: 0 });

  const onInternalMainProjectionAreaDimensionsHandler = (d: Dimensions) => {
    onInternalMainProjectionAreaDimensionsChange(d);
    setDimensions(d);
  };

  return (
    <>
      <div
        style={{
          marginLeft: `${dimensions.left}px`,
          width: `${dimensions.width}px`,
          height: '30px',
          backgroundColor: 'darkgray',
          color: 'white',
        }}
      >
        left: {dimensions.left}, width: {dimensions.width}
      </div>
      <Chart onInternalMainProjectionAreaDimensionsChange={onInternalMainProjectionAreaDimensionsHandler}>
        <Settings
          showLegend={legendEnabled}
          xDomain={{
            min: NaN,
            max: 2,
          }}
          baseTheme={useBaseTheme()}
        />
        <Axis id="bottom" position={Position.Bottom} showOverlappingTicks tickFormat={dateFormatter} />
        {axisEnabled && (
          <Axis
            id="left"
            title={KIBANA_METRICS.metrics.kibana_os_load[0].metric.title}
            position={Position.Left}
            tickFormat={(d) => `${Number(d).toFixed(2)}%`}
          />
        )}
        <LineSeries
          id="lines"
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(0, 5)}
        />
      </Chart>
    </>
  );
};

Example.argTypes = {
  onInternalMainProjectionAreaDimensionsChange: { action: 'onInternalMainProjectionAreaDimensionsChange' },
};
