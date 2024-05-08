/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, select } from '@storybook/addon-knobs';
import React, { useState, useEffect } from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '@elastic/charts';
import * as TestDatasets from '@elastic/charts/src/utils/data_samples/test_dataset';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

export const Example: ChartsStory = (_, { title, description }) => {
  const clickMode = select(
    'Legend click behaviour',
    [
      'original',
      'variant-1',
      'variant-2',
      'variant-3',
    ],
    'original',
  );
  const showLegend = boolean('Show legend', true);

  const [showAllLegendItems, setShowAllLegendItems] = useState<boolean>(false);
  useEffect(() => {
    // @ts-expect-error yeah yeah
    window.clickMode = clickMode;
    setShowAllLegendItems(true);
  }, [clickMode]);

  useEffect(() => {
    if (!showAllLegendItems) {
      setShowAllLegendItems(false);
    }
  }, [showAllLegendItems]);

  useEffect(() => {}, [clickMode]);
  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend={showLegend}
        showLegendExtra
        baseTheme={useBaseTheme()}
        showAllLegendItems={showAllLegendItems}
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
  markdown: `
**Available behaviours**  
---

* \`original\`: on click toggle the series visibility (visible -> non visible -> visible)
* \`variant-1\`: on click focus on the series if visible, restore back all other non-visible series on second click (use shift for the toggle behaviour)
* \`variant-2\`: on click focus on the series if visible, restore back all other non-visible series on second click (hidden series gets restored on click. SHIFT click toggles visibility)
* \`variant-3\`: focus mode when all series are visible, or toggle mode when some are hidden. SHIFT click always toggles.
  `,
};
