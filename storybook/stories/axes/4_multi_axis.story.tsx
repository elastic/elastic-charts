/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, BarSeries, Chart, PartialTheme, Position, ScaleType, Settings } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

function createThemeAction(title: string, min: number, max: number, value: number) {
  return number(
    title,
    value,
    {
      range: true,
      min,
      max,
      step: 1,
    },
    'theme',
  );
}

function renderAxisWithOptions(position: Position, seriesGroup: string, show: boolean) {
  const axisTitle = `${position} axis (${seriesGroup})`;

  const showAxis = boolean(`show ${axisTitle} axis`, show, `${position} axes`);

  if (!showAxis) {
    return null;
  }

  const axisProps = {
    id: axisTitle,
    position,
    title: axisTitle,
    showOverlappingTicks: true,
  };

  return <Axis {...axisProps} />;
}

export const Example: ChartsStory = (_, { title, description }) => {
  const customTheme: PartialTheme = {
    chartMargins: {
      left: createThemeAction('margin left', 0, 50, 0),
      right: createThemeAction('margin right', 0, 50, 0),
      top: createThemeAction('margin top', 0, 50, 0),
      bottom: createThemeAction('margin bottom', 0, 50, 0),
    },
    chartPaddings: {
      left: createThemeAction('padding left', 0, 50, 0),
      right: createThemeAction('padding right', 0, 50, 0),
      top: createThemeAction('padding top', 0, 50, 0),
      bottom: createThemeAction('padding bottom', 0, 50, 0),
    },
  };
  const seriesGroup1 = 'group1';
  const seriesGroup2 = 'group2';
  return (
    <Chart title={title} description={description} size={[500, 300]}>
      <Settings showLegend={false} theme={customTheme} debug={boolean('debug', true)} baseTheme={useBaseTheme()} />
      {renderAxisWithOptions(Position.Top, seriesGroup1, false)}
      {renderAxisWithOptions(Position.Top, seriesGroup2, true)}
      {renderAxisWithOptions(Position.Left, seriesGroup1, false)}
      {renderAxisWithOptions(Position.Left, seriesGroup2, true)}
      {renderAxisWithOptions(Position.Bottom, seriesGroup1, false)}
      {renderAxisWithOptions(Position.Bottom, seriesGroup2, true)}
      {renderAxisWithOptions(Position.Right, seriesGroup1, false)}
      {renderAxisWithOptions(Position.Right, seriesGroup2, true)}
      <BarSeries
        id="barseries1"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 1 },
          { x: 1, y: 2 },
          { x: 2, y: 3 },
          { x: 3, y: 4 },
        ]}
      />
    </Chart>
  );
};
