/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import {
  AnnotationTooltipFormatter,
  Axis,
  BarSeries,
  Chart,
  ScaleType,
  Settings,
  LineAnnotation,
  AnnotationDomainType,
  LineAnnotationDatum,
} from '@elastic/charts';
import { CustomAnnotationTooltip } from '@elastic/charts/src/chart_types/xy_chart/annotations/types';
import { Icon } from '@elastic/charts/src/components/icons/icon';
import { Position } from '@elastic/charts/src/utils/common';

import { useBaseTheme } from '../../../use_base_theme';
import {
  arrayKnobs,
  getBoundaryKnob,
  getChartRotationKnob,
  getFallbackPlacementsKnob,
  getPlacementKnob,
} from '../../utils/knobs';

function generateAnnotationData(values: any[]): LineAnnotationDatum[] {
  return values.map((value, index) => ({ dataValue: value, details: `detail-${index}` }));
}

export const Example = () => {
  const rotation = getChartRotationKnob();
  const boundary = getBoundaryKnob();
  const placement = getPlacementKnob('Tooltip placement');
  const fallbackPlacements = getFallbackPlacementsKnob();
  const offset = number('tooltip offset', 10);
  const showCustomTooltip = boolean('custom tooltip', false);
  const showCustomDetails = boolean('custom tooltip details', false);

  const dataValues = generateAnnotationData(arrayKnobs('annotation values', ['a', 'c']));

  const customTooltip: CustomAnnotationTooltip | undefined = showCustomTooltip
    ? ({ header, details }) => (
        <div style={{ backgroundColor: 'blue', color: 'white', padding: 10 }}>
          <h2>custom tooltip -{header}</h2>
          <p>{details}</p>
        </div>
      )
    : undefined;
  const customTooltipDetails: AnnotationTooltipFormatter | undefined = showCustomDetails
    ? (details) => (
        <div>
          <h2>custom Details</h2>
          <p>{details}</p>
          <ul>
            <li>annotation 1</li>
            <li>annotation 2</li>
            <li>annotation 3</li>
            <li>annotation 4</li>
          </ul>
        </div>
      )
    : undefined;

  return (
    <Chart>
      <Settings rotation={rotation} baseTheme={useBaseTheme()} />
      <LineAnnotation
        id="annotation_1"
        domainType={AnnotationDomainType.XDomain}
        offset={offset}
        dataValues={dataValues}
        boundary={boundary}
        placement={placement}
        fallbackPlacements={fallbackPlacements}
        customTooltip={customTooltip}
        customTooltipDetails={customTooltipDetails}
        marker={<Icon type="alert" />}
      />
      <Axis id="top" position={Position.Top} title="x-domain axis (top)" />
      <Axis id="bottom" position={Position.Bottom} title="x-domain axis (bottom)" />
      <Axis id="left" title="y-domain axis" position={Position.Left} />
      <BarSeries
        id="bars"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 'a', y: 2 },
          { x: 'b', y: 7 },
          { x: 'c', y: 3 },
          { x: 'd', y: 6 },
        ]}
      />
    </Chart>
  );
};
