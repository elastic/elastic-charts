/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, color, number, select } from '@storybook/addon-knobs';
import React from 'react';

import {
  AnnotationDomainType,
  Axis,
  Chart,
  LineAnnotation,
  LineAnnotationDatum,
  RectAnnotation,
  ScaleType,
  Settings,
} from '@elastic/charts';
import { Icon } from '@elastic/charts/src/components/icons/icon';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';
import { Position } from '@elastic/charts/src/utils/common';

import { useBaseTheme } from '../../../use_base_theme';
import { getChartRotationKnob, getXYSeriesKnob } from '../../utils/knobs';

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
        x1: 8,
      },
      details: 'annotation 3',
    },
  ];
  const lineData = dataValues.flatMap<LineAnnotationDatum>(({ coordinates: { x0, x1 } }) => [
    { dataValue: x0, details: 'start' },
    { dataValue: x1, details: 'end' },
  ]);
  const zIndex = number('annotation zIndex', 0);
  const style = {
    strokeWidth: number('rect border stroke width', 1),
    stroke: color('rect border stroke color', '#e5e5e5'),
    fill: color('fill color', '#e5e5e5'),
    opacity: number('annotation opacity', 0.5, {
      range: true,
      min: 0,
      max: 1,
      step: 0.1,
    }),
    fadeOut: boolean('fade out on hover', true),
  };

  const hasCustomTooltip = boolean('has custom tooltip render', false);

  const customTooltip = ({ details }: { details?: string }) => (
    <div>
      <Icon type="alert" />
      {details}
    </div>
  );

  const isLeft = boolean('y-domain axis is Position.Left', true);
  const yAxisTitle = isLeft ? 'y-domain axis (left)' : 'y-domain axis (right)';
  const yAxisPosition = isLeft ? Position.Left : Position.Right;

  const isBottom = boolean('x-domain axis is Position.Bottom', true);
  const xAxisTitle = isBottom ? 'x-domain axis (botttom)' : 'x-domain axis (top)';
  const xAxisPosition = isBottom ? Position.Bottom : Position.Top;
  const hideTooltips = boolean('hide tooltips', false);
  const showLineAnnotations = boolean('showLineAnnotations', true);
  const minAnnoCount = lineData.length;
  const annotationCount = number('annotation count', minAnnoCount, { min: minAnnoCount, max: 100 });
  randomArray.slice(0, annotationCount - minAnnoCount).forEach((dataValue) => {
    lineData.push({ dataValue, details: `Autogen value: ${dataValue}` });
  });

  return (
    <Chart>
      <Settings debug={debug} rotation={rotation} baseTheme={useBaseTheme()} />
      <RectAnnotation
        dataValues={dataValues}
        id="rect"
        style={style}
        customTooltip={hasCustomTooltip ? customTooltip : undefined}
        zIndex={zIndex}
        hideTooltips={hideTooltips}
      />
      {showLineAnnotations && (
        <LineAnnotation
          id="annotation_1"
          domainType={AnnotationDomainType.XDomain}
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
