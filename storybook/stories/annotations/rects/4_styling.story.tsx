/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { array, boolean, color, number, select } from '@storybook/addon-knobs';
import React from 'react';

import {
  AnnotationAnimation,
  AnnotationDomainType,
  Axis,
  Chart,
  LineAnnotation,
  LineAnnotationDatum,
  RectAnnotation,
  RectAnnotationStyle,
  ScaleType,
  Settings,
} from '@elastic/charts';
import { Icon } from '@elastic/charts/src/components/icons/icon';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';
import { Position, RecursivePartial } from '@elastic/charts/src/utils/common';
import { TimeFunction } from '@elastic/charts/src/utils/time_functions';

import { useBaseTheme } from '../../../use_base_theme';
import { getChartRotationKnob, getKnobsFromEnum, getXYSeriesKnob } from '../../utils/knobs';

const rng = getRandomNumberGenerator();
const randomArray = new Array(100).fill(0).map(() => rng(0, 10, 2));

export const Example = () => {
  const debug = boolean('debug', false);
  const [SeriesType] = getXYSeriesKnob(undefined, 'line');
  const xScaleType = select(
    'Scale type',
    {
      Linear: ScaleType.Linear,
      Ordinal: ScaleType.Ordinal,
    },
    ScaleType.Linear,
  );
  const rotation = getChartRotationKnob();
  const dataValues = [
    {
      coordinates: {
        x0: 0,
        x1: 0.25,
      },
      details: 'annotation 1',
    },
    {
      coordinates: {
        x0: -0.1,
        x1: 0,
      },
      details: 'annotation 2',
    },
    {
      coordinates: {
        x0: 2,
        x1: 3,
      },
      details: 'annotation 3',
    },
    {
      coordinates: {
        x0: 8,
        x1: 9,
      },
      details: 'annotation 3',
    },
  ];
  const lineData = dataValues.flatMap<LineAnnotationDatum>(({ coordinates: { x0, x1 } }) => [
    { dataValue: x0, details: 'start' },
    { dataValue: x1, details: 'end' },
  ]);
  const zIndex = number('annotation zIndex', 0, {}, 'Styles');
  const rectStyle: RecursivePartial<RectAnnotationStyle> = {
    strokeWidth: number('rect border stroke width', 1, {}, 'Styles'),
    stroke: color('rect border stroke color', '#e5e5e5', 'Styles'),
    fill: color('fill color', '#e5e5e5', 'Styles'),
    opacity: number(
      'annotation opacity',
      0.5,
      {
        range: true,
        min: 0,
        max: 1,
        step: 0.1,
      },
      'Styles',
    ),
  };

  const hasCustomTooltip = boolean('has custom tooltip render', false, 'Styles');

  const customTooltip = ({ details }: { details?: string }) => (
    <div>
      <Icon type="alert" />
      {details}
    </div>
  );

  const isLeft = boolean('y-domain axis is Position.Left', true, 'Styles');
  const yAxisTitle = isLeft ? 'y-domain axis (left)' : 'y-domain axis (right)';
  const yAxisPosition = isLeft ? Position.Left : Position.Right;

  const isBottom = boolean('x-domain axis is Position.Bottom', true, 'Styles');
  const xAxisTitle = isBottom ? 'x-domain axis (botttom)' : 'x-domain axis (top)';
  const xAxisPosition = isBottom ? Position.Bottom : Position.Top;
  const hideTooltips = boolean('hide tooltips', false, 'Styles');
  const showLineAnnotations = boolean('showLineAnnotations', true, 'Styles');
  const minAnnoCount = lineData.length;
  const annotationCount = number('annotation count', minAnnoCount, { min: minAnnoCount, max: 100 }, 'Styles');
  randomArray.slice(0, annotationCount - minAnnoCount).forEach((dataValue) => {
    lineData.push({ dataValue, details: `Autogen value: ${dataValue}` });
  });

  const animations: Partial<AnnotationAnimation> = {
    enabled: boolean('enabled', true, 'Animations'),
    delay: number('delay (ms)', 300, { min: 0, max: 10000, step: 50 }, 'Animations'),
    duration: number('duration (ms)', 300, { min: 0, max: 10000, step: 50 }, 'Animations'),
    timeFunction: getKnobsFromEnum('time function', TimeFunction, 'linear', { group: 'Animations' }),
    snapValues: array('snap values', ['1'], undefined, 'Animations').map(Number),
  };

  return (
    <Chart>
      <Settings debug={debug} rotation={rotation} baseTheme={useBaseTheme()} />
      <RectAnnotation
        dataValues={dataValues}
        id="rect"
        style={{ ...rectStyle, animations }}
        customTooltip={hasCustomTooltip ? customTooltip : undefined}
        zIndex={zIndex}
        hideTooltips={hideTooltips}
      />
      {showLineAnnotations && (
        <LineAnnotation
          id="annotation_1"
          domainType={AnnotationDomainType.XDomain}
          style={{ animations }}
          dataValues={lineData}
          marker={<Icon type="alert" />}
        />
      )}
      <Axis id="bottom" position={xAxisPosition} title={xAxisTitle} />
      <Axis id="left" title={yAxisTitle} position={yAxisPosition} />
      <SeriesType
        id="series"
        xScaleType={xScaleType}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 3 },
          { x: 2, y: 10 },
          { x: 3, y: 3 },
          { x: 4, y: 6 },
          { x: 5, y: 12 },
          { x: 6, y: 2 },
          { x: 7, y: 1 },
          { x: 8, y: 8 },
          { x: 9, y: 11 },
          { x: 10, y: 7 },
        ]}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown: `Animations styles set via \`RectAnnotationStyle.animations\` or \`LineAnnotationStyle.animations\` are only read on intial
render. Changes to these options, excluding \`enabled\`, will not be reflected on rerenders.
`,
};
