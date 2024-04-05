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
    ['click-to-exclude', 'click-to-include', 'click-to-include-only-on-hide'],
    'click-to-exclude',
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

* \`click-to-exclude\`: on click toggle the series visibility (visible -> non visible -> visible)
* \`click-to-include\`: on click focus on the series (visible -> focus on clicked series -> unfocus from clicked series) - the only way to get back all series is to use the "CTRL + click" feature
* \`click-to-include-only-on-hide\`: on click focus on the series if visible, restore it back if non-visible (visible -> focus on clicked series -> unfocus from clicked series -> visible all series)
  `,
};
