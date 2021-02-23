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
import { connect } from 'react-redux';

import { ScaleType } from '../../scales/constants';
import { SeriesName, SeriesNameConfigOptions, SeriesNameFn, SeriesTypes } from '../../specs';
import { GlobalChartState } from '../../state/chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../../state/selectors/get_internal_is_intialized';
import { getScreenReaderDataSelector } from '../../state/selectors/get_screen_reader_data';

export interface ScreenReaderData {
  seriesName: SeriesName | SeriesNameFn | undefined | SeriesNameConfigOptions;
  seriesType: SeriesTypes;
  splitAccessor: boolean;
  dataKey: string[];
  dataValue: any[];
  xScaleType: ScaleType;
  yScaleType: ScaleType;
}

export interface ScreenReaderDataTableStateProps {
  data: ScreenReaderData[];
}

/** @internal */
export const computeAlternativeChartText = (d: ScreenReaderData[]): string => {
  // number of series of type (make an object that has the count)

  const numberOfSeriesByType = {};
  d.forEach((series) => {
    const { seriesType } = series;
    // @ts-ignore
    if (numberOfSeriesByType[seriesType]) {
      // @ts-ignore
      numberOfSeriesByType[seriesType]++;
    } else {
      // @ts-ignore
      numberOfSeriesByType[seriesType] = 1;
    }
  });

  const numberOfSeries =
    d.length > 1 ? `There are ${d.length} series in this chart.` : `There is one series in this chart`;

  // if there is a splitAccessor in the series then it is stacked
  return !d[0].splitAccessor
    ? `${numberOfSeries} Each series has ${d[0].dataValue.length} data points. `
    : `This  chart is a stacked series.`;
};

const renderKeyHeaders = (keysArray: string[], index: number) => {
  if (index === 0) {
    index++;
    return keysArray.map((val) => {
      return (
        <th scope="row" key={Math.random()}>
          {' '}
          {val}{' '}
        </th>
      );
    });
  }
};

const computeScreenReaderTableForXYCharts = (d: ScreenReaderData[]) => {
  const dataKeys: JSX.Element[] = [];
  // go through the number of series in ScreenReaderData
  for (let seriesIndex = 0; seriesIndex < d.length; seriesIndex++) {
    dataKeys.push(
      <>
        <tr key={Math.random()}>
          <th scope="row" key={Math.random()} />
          <th scope="row" key={Math.random()}>
            {`Series Number of total ${d.length}`}{' '}
          </th>
          {renderKeyHeaders(d[seriesIndex].dataKey, seriesIndex)}
        </tr>
        <tr key={Math.random()}>
          <th scope="col" key={Math.random()} />
          <td key={Math.random()}>{seriesIndex + 1}</td>

          {
            // eslint-disable-next-line array-callback-return
            d[seriesIndex].dataValue.map((value, index) => {
              if (index % d[0].dataKey.length) {
                return <td key={Math.random()}>{value}</td>;
              }
            })
          }
        </tr>
      </>,
    );
  }
  return dataKeys;
};

// TODO
// const computeScreenReaderTableForStackedXYCharts = (d: ScreenReaderData) => {};
// const computeScreenReaderTableForPartitionCharts = (d: ScreenReaderData) => {};
// const computeScreenReaderTableForGoalCharts = (d: ScreenReaderData) => {};
// const computeScreenReaderTableForGaugeXYCharts = (d: ScreenReaderData) => {};

/** @internal */
export const ScreenReaderDataTableComponent = (props: ScreenReaderDataTableStateProps) => {
  const { data } = props;

  if (!data) {
    return null;
  }

  const classes = 'screen-reader';

  const renderDataTable = (data: ScreenReaderData[], classes: string = 'screen-reader') => {
    if (!data) return [];
    if (Object.values(SeriesTypes).includes(data[0].seriesType)) {
      return (
        <table className={classes}>
          <tbody>{computeScreenReaderTableForXYCharts(data)}</tbody>
        </table>
      );
    }
  };

  return renderDataTable(data, classes);
};

const DEFAULT_PROPS = {
  data: [],
};

const mapStateToProps = (state: GlobalChartState): ScreenReaderDataTableStateProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }
  return {
    data: getScreenReaderDataSelector(state),
  };
};

/** @internal */
export const ScreenReaderDataTable = connect(mapStateToProps)(
  // @ts-ignore
  ScreenReaderDataTableComponent,
);
