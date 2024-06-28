/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number, select, text } from '@storybook/addon-knobs';
import React from 'react';

import {
  Axis,
  BarSeries,
  Chart,
  Position,
  ScaleType,
  Settings,
  LegendLabelOptions,
  LegendValue,
} from '@elastic/charts';
import * as TestDatasets from '@elastic/charts/src/utils/data_samples/test_dataset';

import { getLegendSizeKnob } from './legend_size_knob';
import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { getColorPicker } from '../utils/components/get_color_picker';
import { getLegendAction } from '../utils/components/get_legend_action';
import { customKnobs } from '../utils/knobs';

const getLabelOptionKnobs = (): LegendLabelOptions => {
  const group = 'Label options';

  return {
    maxLines: number('max label lines', 1, { min: 0, step: 1 }, group),
  };
};

const defaultDataset = {
  xAccessor: 'x',
  yAccessors: ['y1', 'y2'],
  splitSeriesAccessors: ['g1', 'g2'],
  data: TestDatasets.BARCHART_2Y2G,
};

const datasets: Record<'defaultDataset' | 'shortCopyDataset' | 'longCopyDataset', any> = {
  defaultDataset,
  shortCopyDataset: {
    xAccessor: 'x',
    yAccessors: ['y'],
    splitSeriesAccessors: ['g'],
    data: TestDatasets.SHORT_NAMES_BARCHART,
  },
  longCopyDataset: {
    ...defaultDataset,
    data: TestDatasets.LONG_NAMES_BARCHART_2Y2G,
  },
};

export const Example: ChartsStory = (_, { title, description }) => {
  const hideActions = boolean('Hide legend action', false, 'Legend');
  const showLegendExtra = !boolean('Hide legend extra', false, 'Legend');
  const showColorPicker = !boolean('Hide color picker', true, 'Legend');
  const legendPosition = customKnobs.enum.position('Legend position', undefined, { group: 'Legend' });
  const euiPopoverPosition = customKnobs.enum.euiPopoverPosition(undefined, undefined, { group: 'Legend' });
  const legendTitle = text('Legend title', '', 'Legend');

  const legendValues = customKnobs.multiSelect(
    'Legend Value',
    LegendValue,
    [LegendValue.Median, LegendValue.Min, LegendValue.Max],
    'multi-select',
    'Legend',
  );
  const labelOptions = getLabelOptionKnobs();
  const numberFormattingPrecision = number('Number formatting precision', 2, { min: 0, step: 1 }, 'Legend');

  const datasetSelect = select(
    'Dataset',
    {
      default: 'defaultDataset',
      'short copy': 'shortCopyDataset',
      'long copy': 'longCopyDataset',
    },
    'defaultDataset',
    'Legend',
  );

  const stacked = boolean('stacked', false);

  return (
    <Chart title={title} description={description}>
      <Settings
        legendTitle={legendTitle}
        showLegend
        theme={{ legend: { labelOptions } }}
        baseTheme={useBaseTheme()}
        legendPosition={legendPosition}
        legendAction={hideActions ? undefined : getLegendAction(euiPopoverPosition)}
        legendColorPicker={showColorPicker ? getColorPicker(euiPopoverPosition) : undefined}
        legendSize={getLegendSizeKnob()}
        legendValues={showLegendExtra ? legendValues : []}
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis
        id="left2"
        title="Left axis"
        position={Position.Left}
        tickFormat={(d) => Number(d).toFixed(numberFormattingPrecision)}
      />

      <BarSeries
        id="bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        stackAccessors={stacked ? [''] : []}
        {...datasets[datasetSelect]}
      />
    </Chart>
  );
};

Example.parameters = {
  resize: true,
  markdown: 'This story shows a bar chart with different legend values to test.',
};
