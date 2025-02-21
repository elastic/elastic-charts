/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number } from '@storybook/addon-knobs';
import React from 'react';

import type { AnnotationTooltipFormatter, LineAnnotationDatum } from '@elastic/charts';
import { Axis, BarSeries, Chart, ScaleType, Settings, LineAnnotation, AnnotationDomainType } from '@elastic/charts';
import type { CustomAnnotationTooltip } from '@elastic/charts/src/chart_types/xy_chart/annotations/types';
import { Icon } from '@elastic/charts/src/components/icons/icon';
import { Position } from '@elastic/charts/src/utils/common';

import type { ChartsStory } from '../../../types';
import { useBaseTheme } from '../../../use_base_theme';
import { customKnobs } from '../../utils/knobs';

function generateAnnotationData(values: any[]): LineAnnotationDatum[] {
  return values.map((value, index) => ({ dataValue: value, details: `detail-${index}` }));
}

export const Example: ChartsStory = (_, { title, description }) => {
  const rotation = customKnobs.enum.rotation();
  const boundary = customKnobs.enum.boundary();
  const placement = customKnobs.enum.placement('Tooltip placement');
  const fallbackPlacements = customKnobs.enum.fallbackPlacements();
  const offset = number('tooltip offset', 10);
  const showCustomTooltip = boolean('custom tooltip', false);
  const showCustomDetails = boolean('custom tooltip details', false);

  const dataValues = generateAnnotationData(customKnobs.array('annotation values', ['a', 'c']));

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
        </div>
      )
    : undefined;

  return (
    <Chart title={title} description={description}>
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
