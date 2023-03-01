/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number, select } from '@storybook/addon-knobs';
import { range } from 'lodash';
import React from 'react';

import {
  Chart,
  Axis,
  LineSeries,
  Position,
  ScaleType,
  Settings,
  AreaSeries,
  YDomainBase,
  LogScaleOptions,
} from '@elastic/charts';

import { useBaseTheme } from '../../use_base_theme';
import { logFormatter } from '../utils/formatters';
import { customKnobs } from '../utils/knobs';

type LogKnobs = LogScaleOptions &
  Pick<YDomainBase, 'fit' | 'padding'> & {
    dataType: string;
    negative: boolean;
    scaleType: Extract<ScaleType, 'log' | 'linear'>;
  };

const getDataType = (group: string, defaultType = 'increasing') =>
  select(
    'Data type',
    {
      Increasing: 'increasing',
      Decreasing: 'decreasing',
      'Up Down': 'upDown',
      'Down Up': 'downUp',
    },
    defaultType,
    group,
  );

const getLogKnobs = (isXAxis = false) => {
  const group = isXAxis ? 'X - Axis' : 'Y - Axis';
  const useDefaultLimit = boolean('Use default limit', isXAxis, group);
  const limit = number('Log min limit', 1, { min: 0 }, group);
  const logNames = { Common: 'common', Binary: 'binary', Natural: 'natural' };
  const logBaseName = customKnobs.fromEnum('Log base', logNames, 'common' as any, {
    group,
    allowUndefined: true,
  }) as 'common' | 'binary' | 'natural';
  return {
    min: NaN,
    max: NaN,
    ...(!isXAxis && { fit: boolean('Fit domain', true, group) }),
    dataType: getDataType(group, isXAxis ? undefined : 'upDown'),
    negative: boolean('Use negative values', false, group),
    ...(!isXAxis && { logMinLimit: useDefaultLimit ? undefined : limit }),
    logBase: { common: 10, binary: 2, natural: Math.E }[logBaseName] ?? 10,
    scaleType: customKnobs.enum.scaleType('Scale Type', ScaleType.Log, { include: ['Linear', 'Log'], group }),
    ...(!isXAxis && { padding: number('Padding', 0, { min: 0 }, group) }),
  };
};

const getDataValue = (type: string, v: number, i: number, length: number) => {
  switch (type) {
    case 'increasing':
      return i - Math.round(length / 2);
    case 'decreasing':
      return -i + Math.round(length / 2);
    case 'upDown':
      return v;
    case 'downUp':
    default:
      return -v;
  }
};

const seriesMap = {
  line: LineSeries,
  area: AreaSeries,
};

const getSeriesType = () =>
  select<keyof typeof seriesMap>(
    'Series Type',
    {
      Line: 'line',
      Area: 'area',
    },
    'line',
  );

const getInitalData = (rows: number) => {
  const quart = Math.round(rows / 4);
  return [...range(quart, -quart, -1), ...range(-quart, quart + 1, 1)];
};

const getData = (rows: number, yLogKnobs: LogKnobs, xLogKnobs: LogKnobs) =>
  getInitalData(rows).map((v, i, { length }) => {
    const y0 = getDataValue(yLogKnobs.dataType, v, i, length);
    const x0 = getDataValue(xLogKnobs.dataType, v, i, length);
    return {
      y: Math.pow(yLogKnobs.logBase ?? 10, y0) * (yLogKnobs.negative ? -1 : 1),
      x: Math.pow(xLogKnobs.logBase ?? 10, x0) * (xLogKnobs.negative ? -1 : 1),
    };
  });

export const Example = () => {
  const rows = number('Rows in dataset', 11, { min: 5, step: 2, max: 21 });
  const yLogKnobs = getLogKnobs(false);
  const xLogKnobs = getLogKnobs(true);
  const data = getData(rows, yLogKnobs, xLogKnobs);
  const type = getSeriesType();
  const curve = customKnobs.enum.curve('Curve type');
  const Series = seriesMap[type];

  return (
    <Chart>
      <Settings xDomain={xLogKnobs} baseTheme={useBaseTheme()} />
      <Axis id="y" position={Position.Left} domain={yLogKnobs} tickFormat={logFormatter(yLogKnobs.logBase)} />
      <Axis
        id="x"
        tickFormat={logFormatter(xLogKnobs.logBase)}
        position={Position.Bottom}
        style={{ tickLabel: { rotation: -90 } }}
      />
      <Series
        id="series"
        curve={curve}
        xAccessor="x"
        yAccessors={['y']}
        yScaleType={yLogKnobs.scaleType}
        xScaleType={xLogKnobs.scaleType}
        areaSeriesStyle={{ point: { visible: true } }}
        data={data}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown: `With the \`domain.fit\` option enabled, Log scales will try to best fit the y axis data without setting a baseline to a hardcoded value, currently 1.
      If you provide a \`logMinLimit\` on the \`Axis.domain\` prop, the scale will be limited to that value.
      This is _not_ the same as min domain value, such that if all values are greater than \`logMinLimit\`,
      the domain min will be determined solely by the dataset.\n\nThe \`domain.logBase\` and \`xDomain.logBase\` options
      provide a way to set the base of the log to one of following:
      [\`10\`](https://en.wikipedia.org/wiki/Common_logarithm) (base 10),
      [\`2\`](https://en.wikipedia.org/wiki/Binary_logarithm) (base 2),
      [\`Math.E\`](https://en.wikipedia.org/wiki/Natural_logarithm) (base e), the default is \`Common\``,
};
