/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import type { LegendLabelOptions } from '@elastic/charts';
import { Axis, BarSeries, Chart, Position, ScaleType, Settings, LegendValue } from '@elastic/charts';
import * as TestDatasets from '@elastic/charts/src/utils/data_samples/test_dataset';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { getLegendAction } from '../utils/components/get_legend_action';
import { customKnobs } from '../utils/knobs';

const getLabelOptionKnobs = (isLineLimit: boolean): LegendLabelOptions => {
  const group = 'Label options';

  return isLineLimit
    ? {
        maxLines: number('max label lines', 1, { min: 0, step: 1 }, group),
      }
    : {
        widthLimit: number('width limit', 250, { min: 0, step: 1 }, group),
      };
};

export const Example: ChartsStory = (_, { title, description }) => {
  const hideActions = boolean('Hide legend action', false, 'Legend');
  const showLegendExtra = !boolean('Hide legend extra', false, 'Legend');
  const legendPosition = customKnobs.enum.position('Legend position', 'bottom', { group: 'Legend' });
  const euiPopoverPosition = customKnobs.enum.euiPopoverPosition(undefined, undefined, { group: 'Legend' });
  const legendLayout = customKnobs.enum.layout('Legend Layout', 'list', { group: 'Legend' });
  const legendValues = customKnobs.multiSelect(
    'Legend Value',
    LegendValue,
    LegendValue.CurrentAndLastValue,
    'multi-select',
    'Legend',
  );
  const dataCount = number(
    'Number of items',
    TestDatasets.BARCHART_2Y2G.length,
    {
      min: 1,
      max: TestDatasets.BARCHART_2Y2G.length,
      step: 1,
    },
    'Data',
  );
  const isLineLimit = legendLayout !== 'list' || legendPosition === 'right' || legendPosition === 'left';
  const labelOptions = getLabelOptionKnobs(isLineLimit);

  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        theme={{ legend: { labelOptions } }}
        baseTheme={useBaseTheme()}
        legendValues={showLegendExtra ? legendValues : []}
        legendPosition={legendPosition}
        legendLayout={legendLayout}
        legendAction={hideActions ? undefined : getLegendAction(euiPopoverPosition)}
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

      <BarSeries
        id="bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y1', 'y2']}
        splitSeriesAccessors={['g1', 'g2']}
        data={TestDatasets.BARCHART_2Y2G_VARIED_LEGEND.slice(0, dataCount)}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown:
    'The `legendLayout` prop allows you to render the legend in a list or table view.\n\n` +' +
    '` __Note:__ When this prop is undefined, the layout is chosen automatically: by default a list view is used unless there is statistics or CurrentAndLastValue.',
};
