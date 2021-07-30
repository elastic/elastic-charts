/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import {
  Chart,
  BarSeries,
  ScaleType,
  AreaSeries,
  Position,
  Settings,
  LineAnnotation,
  AnnotationDomainType,
  Axis,
  LineAnnotationDatum,
} from '@elastic/charts';
import { Icon } from '@elastic/charts/src/components/icons/icon';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { boolean } from '@storybook/addon-knobs';
import { arrayKnobs, getChartRotationKnob } from '../storybook/stories/utils/knobs';

export default {
  title: 'Introduction',
  includeStories: [],
};

export const Basic = () => {
  const toggleSpec = boolean('toggle bar spec', true);
  const data1 = [
    { x: 0, y: 2 },
    { x: 1, y: 7 },
    { x: 2, y: 3 },
    { x: 3, y: 6 },
  ];
  const data2 = data1.map((datum) => ({ ...datum, y: datum.y - 1 }));
  const data = toggleSpec ? data1 : data2;
  const specId = toggleSpec ? 'bars1' : 'bars2';
  return (
    <Chart>
      <BarSeries
        id={specId}
        name="Simple bar series"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={data}
      />
    </Chart>
  );
};
Basic.storyName = 'basic';

export const AreaBasic = () => {
  const toggleSpec = boolean('toggle area spec', true);
  const data1 = KIBANA_METRICS.metrics.kibana_os_load[0].data;
  const data2 = data1.map((datum) => [datum[0], datum[1] - 1]);
  const data = toggleSpec ? data1 : data2;
  const specId = toggleSpec ? 'areas1' : 'areas2';

  return (
    <Chart>
      <AreaSeries
        id={specId}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={data}
      />
    </Chart>
  );
};
AreaBasic.storyName = 'area basic';

function generateAnnotationData(values: any[]): LineAnnotationDatum[] {
  return values.map((value, index) => ({ dataValue: value, details: `detail-${index}` }));
}

export const lineBasicXDomainContinuous = () => {
  const data = arrayKnobs('data values', [2.5, 7.2]);
  const dataValues = generateAnnotationData(data);

  const style = {
    line: {
      strokeWidth: 3,
      stroke: '#f00',
      opacity: 1,
    },
    details: {
      fontSize: 12,
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fill: 'gray',
      padding: 0,
    },
  };

  const isBottom = boolean('x domain axis is bottom', true);
  const axisPosition = isBottom ? Position.Bottom : Position.Top;

  return (
    <Chart>
      <Settings showLegend debug={boolean('debug', false)} rotation={getChartRotationKnob()} />
      <LineAnnotation
        id="anno_1"
        domainType={AnnotationDomainType.XDomain}
        dataValues={dataValues}
        style={style}
        marker={<Icon type="alert" />}
      />
      <Axis id="horizontal" position={axisPosition} title="x-domain axis" />
      <Axis id="vertical" title="y-domain axis" position={Position.Left} />
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
lineBasicXDomainContinuous.storyName = '[line] basic xDomain continuous';

export const lineBasicXDomainOrdinal = () => {
  const dataValues = generateAnnotationData(arrayKnobs('annotation values', ['a', 'c']));

  return (
    <Chart>
      <Settings debug={boolean('debug', false)} rotation={getChartRotationKnob()} />
      <LineAnnotation
        id="anno_1"
        domainType={AnnotationDomainType.XDomain}
        dataValues={dataValues}
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
lineBasicXDomainOrdinal.storyName = '[line] basic xDomain ordinal';
