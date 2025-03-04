/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select } from '@storybook/addon-knobs';
import { DateTime } from 'luxon';
import React from 'react';

import { Axis, Chart, LineSeries, Position, ScaleType, Settings } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const today = Date.now();
const UTC_DATE = DateTime.fromISO('2019-01-01T00:00:00.000Z').toMillis();
const UTC_PLUS8_DATE = DateTime.fromISO('2019-01-01T00:00:00.000+08:00', {
  setZone: true,
}).toMillis();
const UTC_MINUS8_DATE = DateTime.fromISO('2019-01-01T00:00:00.000-08:00', {
  setZone: true,
}).toMillis();
const DAY_INCREMENT_1 = 1000 * 60 * 60 * 24;
const UTC_DATASET = new Array(10).fill(0).map((d, i) => [UTC_DATE + DAY_INCREMENT_1 * i, i % 5]);
const CURRENT_TIMEZONE_DATASET = new Array(10).fill(0).map((d, i) => [today + DAY_INCREMENT_1 * i, i % 5]);
const OTHER_PLUS8_TIMEZONE_DATASET = new Array(10).fill(0).map((d, i) => [UTC_PLUS8_DATE + DAY_INCREMENT_1 * i, i % 5]);
const OTHER_MINUS8_TIMEZONE_DATASET = new Array(10)
  .fill(0)
  .map((d, i) => [UTC_MINUS8_DATE + DAY_INCREMENT_1 * i, i % 5]);

export const Example: ChartsStory = (_, { title, description }) => {
  const timezones = {
    utc: 'utc',
    local: 'local',
    utcplus8: 'utc+8',
    utcminus8: 'utc-8',
  };
  const datasetSelected = select('dataset', timezones, 'utc');
  const tooltipSelected = select('tooltip', timezones, 'utc');

  let data;
  switch (datasetSelected) {
    case 'local':
      data = CURRENT_TIMEZONE_DATASET;
      break;
    case 'utc+8':
      data = OTHER_PLUS8_TIMEZONE_DATASET;
      break;
    case 'utc-8':
      data = OTHER_MINUS8_TIMEZONE_DATASET;
      break;
    case 'utc':
    default:
      data = UTC_DATASET;
      break;
  }
  let tooltipFn: (d: number) => string;
  switch (tooltipSelected) {
    case 'local':
      tooltipFn = (d: number) => DateTime.fromMillis(d).toFormat('yyyy-MM-dd HH:mm:ss');
      break;
    case 'utc+8':
      tooltipFn = (d: number) => DateTime.fromMillis(d, { zone: 'utc+8' }).toFormat('yyyy-MM-dd HH:mm:ss');
      break;
    case 'utc-8':
      tooltipFn = (d: number) => DateTime.fromMillis(d, { zone: 'utc-8' }).toFormat('yyyy-MM-dd HH:mm:ss');
      break;
    default:
    case 'utc':
      tooltipFn = (d: number) => DateTime.fromMillis(d).toUTC().toFormat('yyyy-MM-dd HH:mm:ss');
      break;
  }
  return (
    <Chart title={title} description={description}>
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="time" position={Position.Bottom} tickFormat={tooltipFn} />
      <Axis id="y" position={Position.Left} />
      <LineSeries
        id="lines"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        timeZone={tooltipSelected}
        xAccessor={0}
        yAccessors={[1]}
        data={data}
      />
    </Chart>
  );
};
