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

import React from 'react';

import { Chart, Goal } from '../../packages/charts/src';
import { BandFillColorAccessorInput } from '../../packages/charts/src/chart_types/goal_chart/specs';
import { GoalSubtype } from '../../packages/charts/src/chart_types/goal_chart/specs/constants';
import { Color } from '../../packages/charts/src/utils/common';

const subtype = GoalSubtype.Goal;

export const Example = () => {
  const bandsWithSemantics = ['freezing', 'chilly', 'brisk'];
  const bands = [200, 250, 300];

  const opacityMap: { [k: string]: number } = {
    '200': 0.2,
    '250': 0.12,
    '300': 0.05,
  };

  const colorMap: { [k: number]: Color } = bands.reduce<{ [k: number]: Color }>((acc, band) => {
    const defaultValue = opacityMap[band];
    acc[band] = `rgba(0, 0, 0, ${defaultValue.toFixed(2)})`;
    return acc;
  }, {});

  const semanticBandFillColor = (x: number): Color => colorMap[x];

  return (
    <Chart className="story-chart">
      <Goal
        id="spec_1"
        subtype={subtype}
        base={0}
        target={260}
        actual={170}
        // doesn't mess with canvas_renderers.ts
        bands={bands}
        ticks={[0, 50, 100, 150, 200, 250, 300]}
        tickValueFormatter={({ value }: BandFillColorAccessorInput) => String(value)}
        bandFillColor={({ value }: BandFillColorAccessorInput) => semanticBandFillColor(value)}
        labelMajor="Revenue 2020 YTD  "
        labelMinor="(thousand USD)  "
        centralMajor="170"
        centralMinor=""
        config={{ angleStart: Math.PI, angleEnd: 0 }}
        bandLabels={bandsWithSemantics}
      />
    </Chart>
  );
};
