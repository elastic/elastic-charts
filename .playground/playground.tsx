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

import { Chart, Fit, Axis, LineSeries, CurveType, Position, ScaleType } from '../src';
import browserData from './browser_data';
import overallData from './overall_data';

export function Playground() {
  const [showOverall, setShowOverall] = React.useState(true);
  const [showBrowser, setShowBrowser] = React.useState(true);
  const [showFit, setShowFit] = React.useState(false);
  return (
    <div className="testing">
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label htmlFor="showOverall">showOverall</label>
      <input
        checked={showOverall}
        onChange={({ target }) => setShowOverall(target.checked)}
        type="checkbox"
        id="showOverall"
      />
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label htmlFor="showOverall">showBrowser</label>
      <input
        checked={showBrowser}
        onChange={({ target }) => setShowBrowser(target.checked)}
        type="checkbox"
        id="showBrowser"
      />
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label htmlFor="showFit">showFit</label>
      <input checked={showFit} onChange={({ target }) => setShowFit(target.checked)} type="checkbox" id="showFit" />
      <Chart className="chart" size={{ height: 500 }}>
        <Axis id="bottom" position={Position.Bottom} />
        <Axis id="left" position="left" />

        {showOverall && (
          <LineSeries
            id="PagesPercentage"
            name="overall"
            xScaleType={ScaleType.Linear}
            yScaleType={ScaleType.Linear}
            data={overallData?.pageLoadDistribution ?? []}
            curve={CurveType.CURVE_MONOTONE_X}
            // lineSeriesStyle={{ point: { visible: false } }}
          />
        )}

        {showBrowser && (
          <>
            {browserData?.map(({ data: seriesData, name }) => (
              <LineSeries
                id={name}
                key={name}
                name={name}
                xScaleType={ScaleType.Linear}
                yScaleType={ScaleType.Linear}
                data={seriesData ?? []}
                curve={CurveType.CURVE_MONOTONE_X}
                stackAccessors={showFit ? [0] : undefined}
                fit={showFit ? Fit.Linear : undefined}
                // lineSeriesStyle={{ point: { visible: false } }}
              />
            ))}
          </>
        )}
      </Chart>
    </div>
  );
}
