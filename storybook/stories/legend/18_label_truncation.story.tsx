/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number, select } from '@storybook/addon-knobs';
import React from 'react';

import type { LegendLabelOptions, LegendPositionConfig } from '@elastic/charts';
import {
  Axis,
  BarSeries,
  Chart,
  Position,
  ScaleType,
  Settings,
  VerticalAlignment,
  HorizontalAlignment,
  LayoutDirection,
  LegendValue,
} from '@elastic/charts';

import { getLegendSizeKnob } from './legend_size_knob';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';
import { customKnobs } from '../utils/knobs';

// Long label test data to demonstrate truncation
const LONG_LABEL_DATA = [
  { x: 1, y: 10, g: 'enterprise-authentication-and-authorization-management-service' },
  { x: 2, y: 20, g: 'https://elastic-elastic-elastic.org/people/type:astronauts/name:aleksandr-laveykin/profile' },
  { x: 3, y: 15, g: 'very-long-service-name-that-needs-truncation-in-the-middle' },
  { x: 4, y: 8, g: 'user-session-management-service-v2-production-cluster' },
  { x: 5, y: 12, g: '/var/log/elasticsearch/cluster-production-east-1/audit.log' },
  {
    x: 6,
    y: 20,
    g:
      '200-character-length-label-and-it-is-very-long-includes-many-characters-like-service.name(s)-and-' +
      'host.name.etc-to-demonstrates-that-how-label-truncation-behaves-for-very-large-labels-END',
  },
  { x: 7, y: 19, g: '100-character-length-label-and-it-is-very-long-includes-many-characters-like-END' },
  {
    x: 8,
    y: 21,
    g:
      '300-character-length-label-and-it-is-very-long-includes-many-characters-like-service.name(s)-and-' +
      'host.name.etc-to-demonstrates-that-how-label-truncation-behaves-for-very-large-labels-and-even-' +
      'more-characters-to-exceed-the-300-character-limit-set-in-this-example-to-see-how-it-handles-' +
      'extremely-long-labels-in-the-legend-of-the-chart-component-END',
  },
  { x: 9, y: 18, g: 'short-name' },
];

const getLabelOptionKnobs = (): LegendLabelOptions => {
  const group = 'Label options';

  return {
    truncationPosition: select(
      'truncationPosition',
      {
        middle: 'middle',
        end: 'end',
      },
      'middle',
      group,
    ),
    maxLines: number('maxLines', 1, { min: 0, step: 1 }, group),
  };
};

export const Example: ChartsStory = (_, { title, description }) => {
  const labelOptions = getLabelOptionKnobs();

  // Legend options group knobs
  const legendPosition = customKnobs.enum.position('Legend position', Position.Right, { group: 'Legend options' });
  const legendSize = getLegendSizeKnob('Legend options');
  const showLegendExtra = boolean('Show legend values', false, 'Legend options');

  // Inside chart positioning
  const floating = boolean('Inside chart (floating)', false, 'Legend options');
  const floatingColumns = number('Floating columns', 1, { min: 1, max: 4, range: true, step: 1 }, 'Legend options');

  const vAlign = select(
    'Vertical alignment',
    {
      Top: VerticalAlignment.Top,
      Bottom: VerticalAlignment.Bottom,
    },
    VerticalAlignment.Bottom,
    'Legend options',
  );

  const hAlign = select(
    'Horizontal alignment',
    {
      Left: HorizontalAlignment.Left,
      Right: HorizontalAlignment.Right,
    },
    HorizontalAlignment.Right,
    'Legend options',
  );

  const direction = select(
    'Direction',
    {
      Vertical: LayoutDirection.Vertical,
      Horizontal: LayoutDirection.Horizontal,
    },
    LayoutDirection.Vertical,
    'Legend options',
  );

  // Legend width control for demonstrating truncation
  const legendWidth = number('Legend width (vertical)', 200, { min: 50, max: 400, step: 10 }, 'Legend options');

  const legendPositionConfig: LegendPositionConfig = {
    vAlign,
    hAlign,
    direction,
    floating,
    floatingColumns,
  };

  return (
    <Chart title={title} description={description}>
      <Settings
        showLegend
        legendPosition={floating ? legendPositionConfig : legendPosition}
        legendSize={legendSize}
        legendValues={showLegendExtra ? [LegendValue.CurrentAndLastValue] : []}
        theme={{
          legend: {
            verticalWidth: legendWidth,
            labelOptions,
          },
        }}
        baseTheme={useBaseTheme()}
      />
      <Axis id="bottom" position={Position.Bottom} title="X Axis" />
      <Axis id="left" position={Position.Left} title="Y Axis" />
      <BarSeries
        id="bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['g']}
        data={LONG_LABEL_DATA}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown: `
This story demonstrates the legend label truncation options.

### Truncation Positions

- **\`middle\`** (default): Truncates text in the middle, preserving both the beginning and end of the label.
  - Example: \`enterprise-authentication-and-authorization-management-service\` → \`enterprise-au…nt-service\`

- **\`end\`**: CSS truncation at the end of the text.
  - Example: \`enterprise-authentication-and-authorization-management-service\` → \`enterprise-authentication-an…\`

### Usage

\`\`\`tsx
<Settings
  showLegend
  theme={{
    legend: {
      labelOptions: {
        maxLines: 1,
        truncationPosition: 'middle', // or 'end'
      },
    },
  }}
/>
\`\`\`
  `,
};
