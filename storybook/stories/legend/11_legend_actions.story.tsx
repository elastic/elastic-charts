/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings, LegendLabelOptions } from '@elastic/charts';
import * as TestDatasets from '@elastic/charts/src/utils/data_samples/test_dataset';

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

export const Example = () => {
  const hideActions = boolean('Hide legend action', false, 'Legend');
  const showLegendExtra = !boolean('Hide legend extra', false, 'Legend');
  const showColorPicker = !boolean('Hide color picker', true, 'Legend');
  const legendPosition = customKnobs.enum.position('Legend position', undefined, { group: 'Legend' });
  const euiPopoverPosition = customKnobs.enum.euiPopoverPosition(undefined, undefined, { group: 'Legend' });
  const labelOptions = getLabelOptionKnobs();

  return (
    <Chart>
      <Settings
        showLegend
        theme={{ legend: { labelOptions } }}
        baseTheme={useBaseTheme()}
        showLegendExtra={showLegendExtra}
        legendPosition={legendPosition}
        legendAction={hideActions ? undefined : getLegendAction(euiPopoverPosition)}
        legendColorPicker={showColorPicker ? getColorPicker(euiPopoverPosition) : undefined}
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
        data={TestDatasets.BARCHART_2Y2G}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown:
    'The `legendAction` action prop allows you to pass a render function/component that will render next to the legend item.\n\n __Note:__ the context menu, color picker and popover are supplied by [eui](https://elastic.github.io/eui/#).',
};
