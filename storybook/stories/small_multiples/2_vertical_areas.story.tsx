/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import { DateTime } from 'luxon';
import React from 'react';

import {
  ScaleType,
  Position,
  Chart,
  Axis,
  GroupBy,
  SmallMultiples,
  Settings,
  AreaSeries,
  LIGHT_THEME,
  niceTimeFormatByDay,
  timeFormatter,
  BrushAxis,
} from '@elastic/charts';
import { SeededDataGenerator } from '@elastic/charts/src/mocks/utils';

import { useBaseTheme } from '../../use_base_theme';

const dg = new SeededDataGenerator();
const numOfDays = 60;
const data = dg.generateGroupedSeries(numOfDays, 6, 'metric ').map((d) => {
  return {
    ...d,
    x: DateTime.fromISO('2020-01-01T00:00:00Z').plus({ days: d.x }).toMillis(),
  };
});
const dataForLogScale = data.map((d) => ({ ...d, y: d.y - 3 }));

export const Example = () => {
  const showLegend = boolean('Show Legend', true);
  const onElementClick = action('onElementClick');
  const tickTimeFormatter = timeFormatter(niceTimeFormatByDay(numOfDays));
  const useLogScale = boolean('Use log scale (different data)', false);

  return (
    <Chart>
      <Settings
        baseTheme={useBaseTheme()}
        onElementClick={onElementClick}
        showLegend={showLegend}
        onBrushEnd={(d) => {
          if (d.x) {
            action('brushEventX')(tickTimeFormatter(d.x[0] ?? 0), tickTimeFormatter(d.x[1] ?? 0), d.y);
          }
        }}
        brushAxis={BrushAxis.X}
      />
      <Axis
        id="time"
        title="Timestamp"
        position={Position.Bottom}
        gridLine={{ visible: false }}
        tickFormat={tickTimeFormatter}
      />
      <Axis
        id="y"
        title="Metric"
        position={Position.Left}
        gridLine={{ visible: false }}
        tickFormat={(d) => d.toFixed(2)}
      />

      <GroupBy
        id="v_split"
        by={(spec, { g }) => {
          return g;
        }}
        sort="alphaDesc"
      />
      <SmallMultiples splitVertically="v_split" style={{ verticalPanelPadding: { outer: 0, inner: 0.3 } }} />
      <AreaSeries
        id="line"
        xScaleType={ScaleType.Time}
        yScaleType={useLogScale ? ScaleType.Log : ScaleType.Linear}
        timeZone="local"
        xAccessor="x"
        yAccessors={['y']}
        color={LIGHT_THEME.colors.vizColors[1]}
        data={useLogScale ? dataForLogScale : data}
      />
    </Chart>
  );
};
Example.parameters = {
  markdown: `The above chart shows an example of small multiples technique that splits our dataset into multiple
      sub-series vertically positioned one below the other.
      The configuration is obtained by defining a \`<GroupBy />\` operation component that define the property used to
      divide/group my dataset(via to the \`by\` props) and using the specified \`id\` of that operation inside the
      \`<SmallMultiples splitVertically="id_of_group_by_op" />\` component.

Each charts has the same vertical and horizontal axis scale.
`,
};
