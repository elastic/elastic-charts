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
 * under the License. */

import React from 'react';
import {
  Chart,
  ScaleType,
  Settings,
  RectAnnotation,
  LineAnnotation,
  TooltipType,
  BarSeries,
  LineSeries,
  Axis,
  Position,
} from '../src';

// const data = [
//   { x: 0, min: 0, max: 1 },
//   { x: 10, min: 0, max: 2 },
//   // { x: 2, min: 0, max: 3 },
// ];

const data = new Array(10).fill(0).map((d, i) => {
  return {
    x: i,
    y: Math.random() * 10,
  };
});

// data = [
//   { x: 0, y: 4 },
//   { x: 1, y: 1 },
//   { x: 10, y: 3 },
//   // { x: 3, y: 2 },
// ];
interface State {
  showRectAnnotation: boolean;
  showLineXAnnotation: boolean;
  showLineYAnnotation: boolean;
  totalBars: number;
  useLinearBar: boolean;
  useOrdinalBar: boolean;
  useHistogramBar: boolean;
  totalLines: number;
  useLinearLine: boolean;
  useOrdinalLine: boolean;
}
export class Playground extends React.Component<{}, State> {
  state: State = {
    showRectAnnotation: true,
    showLineXAnnotation: true,
    showLineYAnnotation: false,
    totalBars: 1,
    totalLines: 1,
    useLinearBar: false,
    useOrdinalBar: false,
    useHistogramBar: true,
    useLinearLine: false,
    useOrdinalLine: false,
  };
  handleInputChange = (stateParam: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedValue = stateParam === 'totalBars' || stateParam === 'totalLines' ? Number(event.target.value) : 1;
    this.setState((prevState: State) => {
      return {
        ...prevState,
        [stateParam]: stateParam === 'totalBars' || stateParam === 'totalLines' ? updatedValue : !prevState[stateParam],
      };
    });
  };
  render() {
    const keys: Array<keyof State> = [
      'showRectAnnotation',
      'showLineXAnnotation',
      'showLineYAnnotation',
      'useLinearBar',
      'useOrdinalBar',
      'useHistogramBar',
      'useLinearLine',
      'useOrdinalLine',
      'totalBars',
      'totalLines',
    ];
    return (
      <>
        <div>
          <form>
            {keys.map((key) => {
              return (
                <label key={key}>
                  {key}
                  {key === 'totalBars' || key === 'totalLines' ? (
                    <input type="number" value={this.state[key]} onChange={this.handleInputChange(key)} />
                  ) : (
                    <input type="checkbox" checked={this.state[key]} onChange={this.handleInputChange(key)} />
                  )}
                </label>
              );
            })}
          </form>
        </div>
        <div className="chart">
          <Chart>
            <Settings
              tooltip={TooltipType.None}
              rotation={0}
              theme={{
                lineSeriesStyle: {
                  point: {
                    visible: true,
                    fill: 'transparent',
                  },
                },
                barSeriesStyle: {
                  rect: {
                    opacity: 0.5,
                  },
                },
                scales: { barsPadding: 0, histogramPadding: 0 },
                chartPaddings: { bottom: 0, left: 0, top: 0, right: 0 },
                chartMargins: { bottom: 0, left: 0, top: 0, right: 0 },
              }}
            />
            <Axis id="y" position={Position.Left} />
            <Axis id="x" position={Position.Bottom} />
            {this.state.showRectAnnotation && (
              <RectAnnotation
                id="annotation"
                dataValues={[
                  // { coordinates: { x0: 1, x1: null, y0: null, y1: null } },
                  // { coordinates: { x0: null, x1: 1, y0: null, y1: null } },
                  { coordinates: { x0: null, x1: null, y0: 1, y1: null } },
                  // { coordinates: { x0: null, x1: null, y0: null, y1: 1 } },
                ]}
                style={{
                  fill: 'red',
                  opacity: 0.25,
                }}
              />
            )}
            {this.state.showLineYAnnotation && (
              <LineAnnotation
                id="lineany"
                dataValues={[
                  { dataValue: 2, details: 'foo' },
                  // {
                  //   dataValue: -0.5,
                  //   details: 'aaa',
                  //   header: 'aaa',
                  // },
                ]}
                domainType="yDomain"
                marker={<div style={{ width: 10, height: 10, background: 'red' }}></div>}
              />
            )}
            {this.state.showLineXAnnotation && (
              <LineAnnotation
                id="lineanx"
                dataValues={[
                  {
                    dataValue: 9.5,
                    details: 'aaa',
                    header: 'aaa',
                  },
                ]}
                domainType="xDomain"
                marker={<div style={{ width: 10, height: 10, background: 'rgba(255, 0, 0, 0.3)' }}></div>}
              />
            )}
            {this.state.useLinearBar &&
              new Array(this.state.totalBars)
                .fill(0)
                .map((d, i) => (
                  <BarSeries
                    key={`linearBar${i}`}
                    id={`linearBar${i}`}
                    xScaleType={ScaleType.Linear}
                    yScaleType={ScaleType.Linear}
                    xAccessor="x"
                    yAccessors={['y']}
                    data={data}
                  />
                ))}

            {this.state.useOrdinalBar &&
              new Array(this.state.totalBars)
                .fill(0)
                .map((d, i) => (
                  <BarSeries
                    key={`ordinalBar${i}`}
                    id={`ordinalBar${i}`}
                    xScaleType={ScaleType.Ordinal}
                    yScaleType={ScaleType.Linear}
                    xAccessor="x"
                    yAccessors={['y']}
                    data={data}
                  />
                ))}

            {this.state.useHistogramBar &&
              new Array(this.state.totalBars)
                .fill(0)
                .map((d, i) => (
                  <BarSeries
                    key={`histoBar${i}`}
                    id={`histoBar${i}`}
                    enableHistogramMode
                    xScaleType={ScaleType.Linear}
                    yScaleType={ScaleType.Linear}
                    xAccessor="x"
                    yAccessors={['y']}
                    data={data}
                  />
                ))}

            {this.state.useOrdinalLine &&
              new Array(this.state.totalLines)
                .fill(0)
                .map((d, i) => (
                  <LineSeries
                    key={`ordinalLines${i}`}
                    id={`ordinalLines${i}`}
                    xScaleType={ScaleType.Ordinal}
                    yScaleType={ScaleType.Linear}
                    xAccessor="x"
                    yAccessors={['y']}
                    data={data}
                  />
                ))}

            {this.state.useLinearLine &&
              new Array(this.state.totalLines)
                .fill(0)
                .map((d, i) => (
                  <LineSeries
                    key={`linearLines${i}`}
                    id={`linearLines${i}`}
                    xScaleType={ScaleType.Linear}
                    yScaleType={ScaleType.Linear}
                    xAccessor="x"
                    yAccessors={['y']}
                    data={data}
                  />
                ))}
          </Chart>
        </div>
      </>
    );
  }
}
