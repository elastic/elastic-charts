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
import { ContinuousDomain, OrdinalDomain } from '../../utils/domain';

export interface ScreenReaderData {
  seriesName: SeriesName | SeriesNameFn | undefined | SeriesNameConfigOptions;
  seriesType: SeriesTypes;
  splitAccessor: boolean;
  dataKey: string[];
  dataValue: any[];
  xScaleType: ScaleType;
  yScaleType: ScaleType;
  xDomain: ContinuousDomain | OrdinalDomain | undefined;
  yDomains: any;
  axesTitles: (string | undefined)[][] | undefined;
}

export interface ScreenReaderDataTableStateProps {
  data: ScreenReaderData[];
}

/** helper function to read out each number  and type of series */
const readOutSeriesCountandType = (s: { [s: string]: unknown } | ArrayLike<unknown>) => {
  let returnString = '';
  for (let i = 0; i < Object.entries(s).length; i++) {
    const seriesT = Object.entries(s)[i][0];
    const seriesC = Object.entries(s)[i][1];
    returnString +=
      seriesC === 1 ? `There is ${seriesC} ${seriesT} series. ` : `There are ${seriesC} ${seriesT} series. `;
  }
  return returnString;
};

const axesWithTitles = (titles: string | any[] | undefined, domains: { [x: string]: any }) => {
  let titleDomain = '';
  for (let i = 0; i < titles!.length; i++) {
    if (titles![i][0]) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      titleDomain += `The axis ${titles![i][0]} has the  domain ${domains[titles[i][1]]}. `;
    }
  }
  return titleDomain;
};

/** @internal */
export const computeAlternativeChartText = (d: ScreenReaderData[]): string => {
  const namedSeries = d[0].seriesName !== undefined ? `The chart is named ${d[0].seriesName}. ` : '';
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

  const mixedSeriesChart =
    Object.keys(numberOfSeriesByType).length > 1 ? `This chart has different series types in it.` : '';
  const stackedSeries = d[0].splitAccessor
    ? `This chart has stacked series in it. The scale type of the y axes are ${d[0].yScaleType}. `
    : ``;

  const multipleSeries = d.length > 1;
  const types = multipleSeries
    ? readOutSeriesCountandType(numberOfSeriesByType)
    : `There is one ${d[0].seriesType} series in this chart.`;

  const YAxes =
    d[0].axesTitles!.length > 1
      ? `This chart has multiple y-axes. The y axes are ${d[0].yScaleType}. ${axesWithTitles(
          d[0].axesTitles,
          d[0].yDomains,
        )}`
      : // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `There is one y-axis titled ${d[0].axesTitles}. Its domain is ${d[0].yDomains[d[0].axesTitles]}. `;

  return `${namedSeries}${mixedSeriesChart} ${stackedSeries} ${
    mixedSeriesChart !== '' || stackedSeries !== '' ? `It` : `The  chart`
  } has ${d.length} series in it. ${types} The x axis is ${d[0].xScaleType}. The domain is ${d[0].xDomain}. ${YAxes}`;
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

const computeScreenReaderTableForXYCharts = (d: ScreenReaderData[], classes = 'screen-reader') => {
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
        <tr key={Math.random()} className={classes}>
          <th scope="col" key={Math.random()} />
          <td key={Math.random()}>{seriesIndex + 1}</td>

          {
            // eslint-disable-next-line array-callback-return
            d[seriesIndex].dataValue.map((value: React.ReactNode, index: number) => {
              if (index % d[0].dataKey.length) {
                return (
                  <td key={Math.random()} className={classes}>
                    {value}
                  </td>
                );
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
// const computeScreenReaderTableForStackedXYCharts = (d: ScreenReaderData) => {
//   return [];
// };
// const computeScreenReaderTableForPartitionCharts = (d: ScreenReaderData) => {
//   return [];
// };
// const computeScreenReaderTableForGoalCharts = (d: ScreenReaderData) => {
//   return [];
// };
// const computeScreenReaderTableForGaugeXYCharts = (d: ScreenReaderData) => {
//   return [];
// };

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
    return [];
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
