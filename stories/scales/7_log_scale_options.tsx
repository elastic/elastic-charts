/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { boolean, number, select } from '@storybook/addon-knobs';
import { range } from 'lodash';
import numeral from 'numeral';
import React from 'react';

import { Chart, Axis, LineSeries, Position, ScaleType, Settings, SettingsSpecProps } from '../../src';
import { LogBase } from '../../src/scales/scale_continuous';
import { getKnobsFromEnum } from '../utils/knobs';
import { SB_SOURCE_PANEL } from '../utils/storybook';

type LogKnobs = Pick<SettingsSpecProps, 'yLogBase' | 'yLogMinLimit' | 'xLogBase' | 'xLogMinLimit'> & {
  xDataType: string;
  yDataType: string;
  xNegative: boolean;
  yNegative: boolean;
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

const getScaleType = (type: ScaleType, group: string) =>
  getKnobsFromEnum('Scale Type', ScaleType, type, { group, include: ['linear', 'log'] }) as Extract<
    ScaleType,
    'log' | 'linear'
  >;

const getLogKnobs = (): LogKnobs => {
  const xGroup = 'X - Axis';
  const yGroup = 'Y - Axis';
  const yUseDefaultLimit = boolean('Use default limit', false, yGroup);
  const yLimit = number('Log min limit', 1, { min: 0 }, yGroup);
  const xUseDefaultLimit = boolean('Use default limit', false, xGroup);
  const xLimit = number('Log min limit', 1, { min: 0 }, xGroup);
  return {
    xDataType: getDataType(xGroup),
    yDataType: getDataType(yGroup, 'upDown'),
    xNegative: boolean('Use negative values', false, xGroup),
    yNegative: boolean('Use negative values', false, yGroup),
    yLogMinLimit: yUseDefaultLimit ? undefined : yLimit,
    xLogMinLimit: xUseDefaultLimit ? undefined : xLimit,
    yLogBase: getKnobsFromEnum('Log base', LogBase, LogBase.Common as LogBase, { group: yGroup }),
    xLogBase: getKnobsFromEnum('Log base', LogBase, LogBase.Common as LogBase, { group: xGroup }),
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

const logBaseMap = {
  [LogBase.Common]: 10,
  [LogBase.Binary]: 2,
  [LogBase.Natural]: Math.E,
};

const getInitalData = (rows: number) => {
  const quart = Math.round(rows / 4);
  return [...range(quart, -quart, -1), ...range(-quart, quart + 1, 1)];
};

const getData = (rows: number, { yLogBase, xLogBase, yDataType, xDataType, yNegative, xNegative }: LogKnobs) =>
  getInitalData(rows).map((v, i, { length }) => {
    const y0 = getDataValue(yDataType, v, i, length);
    const x0 = getDataValue(xDataType, v, i, length);
    return {
      y: Math.pow(logBaseMap[yLogBase ?? LogBase.Common], y0) * (yNegative ? -1 : 1),
      x: Math.pow(logBaseMap[xLogBase ?? LogBase.Common], x0) * (xNegative ? -1 : 1),
    };
  });

const formatter = (n: number) => numeral(n).format('0,00e+0');

export const Example = () => {
  const rows = number('Rows in dataset', 11, { min: 5, step: 2, max: 21 });
  const logOptions = getLogKnobs();
  const data = getData(rows, logOptions);

  return (
    <Chart className="story-chart">
      <Settings {...logOptions} />
      <Axis id="y" tickFormat={formatter} position={Position.Left} />
      <Axis id="x" tickFormat={formatter} position={Position.Bottom} style={{ tickLabel: { rotation: -90 } }} />
      <LineSeries
        id="line"
        yScaleType={getScaleType(ScaleType.Log, 'Y - Axis')}
        xScaleType={getScaleType(ScaleType.Log, 'X - Axis')}
        data={data}
      />
    </Chart>
  );
};

Example.story = {
  parameters: {
    options: { selectedPanel: SB_SOURCE_PANEL },
    info: {
      text: `Log scales will try to best fit the data without setting a baseline to a set value.
      If you provide a \`yLogMinLimit\` or \`xLogMinLimit\`, the scale will be limited to that value.
      This does _not_ replace the min domain value, such that if all values are greater than this limit,
      the domain min will be determined by the dataset.\n\nThe \`yLogBase\` and \`xLogBase\`
      provides a way to set the base of the log to one of following:
      [\`Common\`](https://en.wikipedia.org/wiki/Common_logarithm) (base 10),
      [\`Binary\`](https://en.wikipedia.org/wiki/Binary_logarithm) (base 2),
      [\`Natural\`](https://en.wikipedia.org/wiki/Natural_logarithm) (base e), the default is \`Common\``,
    },
  },
};
