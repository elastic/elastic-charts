/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';

import {
  AnnotationTooltipFormatter,
  Axis,
  BarSeries,
  Chart,
  ScaleType,
  RectAnnotation,
  Settings,
} from '@elastic/charts';
import { CustomAnnotationTooltip } from '@elastic/charts/src/chart_types/xy_chart/annotations/types';
import { Position } from '@elastic/charts/src/utils/common';

import { useBaseTheme } from '../../../use_base_theme';
import { customKnobs } from '../../utils/knobs';

export const Example = () => {
  const boundary = customKnobs.enum.boundary();
  const placement = customKnobs.enum.placement('Tooltip placement');
  const fallbackPlacements = customKnobs.enum.fallbackPlacements();
  const rotation = customKnobs.enum.rotation();
  const showCustomTooltip = boolean('custom tooltip', false);
  const showCustomDetails = boolean('custom tooltip details', false);
  const details = select(
    'details value',
    {
      foo: 'foo',
      undefined,
    },
    'foo',
  );

  const dataValues = [
    {
      coordinates: {
        x0: 0,
        x1: 1,
        y0: 0,
        y1: 7,
      },
      details,
    },
  ];

  const customTooltip: CustomAnnotationTooltip | undefined = showCustomTooltip
    ? ({ details }) => (
        <div style={{ backgroundColor: 'blue', color: 'white', padding: 10 }}>
          <h2>custom tooltip</h2>
          <p>{details}</p>
        </div>
      )
    : undefined;
  const customTooltipDetails: AnnotationTooltipFormatter | undefined = showCustomDetails
    ? (details) => (
        <div>
          <h2>custom Details</h2>
          <p>{details}</p>
        </div>
      )
    : undefined;

  return (
    <Chart>
      <Settings rotation={rotation} baseTheme={useBaseTheme()} />
      <RectAnnotation
        dataValues={dataValues}
        id="rect"
        boundary={boundary}
        placement={placement}
        fallbackPlacements={fallbackPlacements}
        customTooltip={customTooltip}
        customTooltipDetails={customTooltipDetails}
      />
      <Axis id="bottom" position={Position.Bottom} title="x-domain axis" />
      <Axis id="left" title="y-domain axis" position={Position.Left} />
      <BarSeries
        id="bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 7 },
          { x: 3, y: 6 },
        ]}
      />
    </Chart>
  );
};
