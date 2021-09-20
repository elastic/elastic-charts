/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, ScaleType, Settings } from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  //   const customTheme: PartialTheme = {
  //     // ...theme,
  //     barSeriesStyle: {
  //       displayValue: {
  //         // ...theme.barSeriesStyle.displayValue,
  //         offsetX: 4,
  //         offsetY: 0,
  //         alignment: {
  //           vertical: 'middle',
  //         },
  //       },
  //     },
  //   };

  const data = [
    {
      authorAssociation: 'Team Member',
      vizType: 'Data Table',
      issueType: 'Bug',
      count: 24000,
    },
    {
      authorAssociation: 'Team Member',
      vizType: 'Heatmap',
      issueType: 'Bug',
      count: 12000,
    },
    {
      authorAssociation: 'Team Member',
      vizType: 'Markdown',
      issueType: 'Bug',
      count: 6000,
    },
    {
      authorAssociation: 'Team Member',
      vizType: 'MetricVis',
      issueType: 'Bug',
      count: 16000,
    },
    {
      authorAssociation: 'Team Member',
      vizType: 'Pie Chart',
      issueType: 'Bug',
      count: 7000,
    },
    {
      authorAssociation: 'Team Member',
      vizType: 'Tagcloud',
      issueType: 'Bug',
      count: 19000,
    },
    {
      authorAssociation: 'Team Member',
      vizType: 'TSVB',
      issueType: 'Bug',
      count: 86000,
    },
    {
      authorAssociation: 'Team Member',
      vizType: 'Timelion',
      issueType: 'Bug',
      count: 58000,
    },
    {
      authorAssociation: 'Team Member',
      vizType: 'Vega vis',
      issueType: 'Bug',
      count: 11000,
    },
    {
      authorAssociation: 'Team Member',
      vizType: 'Point Series',
      issueType: 'Bug',
      count: 1000,
    },
    {
      authorAssociation: 'Team Member',
      vizType: 'Inspector',
      issueType: 'Bug',
      count: 15000,
    },
  ];
  return (
    <Chart>
      <Settings
        theme={[useBaseTheme()]}
        rotation={select(
          'Rotation degree',
          {
            '0 deg(default)': 0,
            '90 deg': 90,
            '-90 deg': -90,
            '180 deg': 180,
          },
          0,
        )}
      />
      <BarSeries
        id="issues"
        name="Issues"
        data={data}
        xAccessor="vizType"
        yAccessors={['count']}
        xScaleType={ScaleType.Ordinal}
        displayValueSettings={{ showValueLabel: true }}
      />
      <Axis id="bottom-axis" position="bottom" />
      <Axis id="left-axis" position="left" tickFormat={(d: string) => `${Math.round(Number(d) / 1000)}k`} />
    </Chart>
  );
};
