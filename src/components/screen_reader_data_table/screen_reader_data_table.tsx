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
  yDomains: { [s: string]: number[] };
  axesTitles: (string | undefined)[][];
}

export interface ScreenReaderDataTableStateProps {
  data: ScreenReaderData[];
}

/** helper function to read out each number  and type of series */
const readOutSeriesCountandType = (s: { [s: string]: number } | ArrayLike<number>) => {
  let returnString = '';
  for (let i = 0; i < Object.entries(s).length; i++) {
    const seriesT = Object.entries(s)[i][0];
    const seriesC = Object.entries(s)[i][1];
    returnString +=
      seriesC === 1 ? `There is ${seriesC} ${seriesT} series. ` : `There are ${seriesC} ${seriesT} series. `;
  }
  return returnString;
};

/** helper function to read out each title of the axes */
const axesWithTitles = (
  titles: (undefined | string)[][],
  domains: { [x: string]: number[] | string[] },
  xDomain: ContinuousDomain | OrdinalDomain | undefined,
) => {
  let titleDomain = '';
  for (let i = 0; i < titles.length; i++) {
    const getTitle = titles[i].length > 1 ? 'The axis is not titled and ' : `The axis named ${titles[i][0]} `;
    const groupId = titles[i][1];
    // @ts-ignore
    const domain = domains[groupId] ? domains[groupId] : xDomain;
    titleDomain += titles[i][1]
      ? `${getTitle} has the  domain ${domain.toString()}. `
      : `${getTitle} has an undefined domain.`;
  }
  return titleDomain;
};

/** helper function to read out each title for the axes if present */
const getAxesTitlesAndDomains = (d: ScreenReaderData[]) => {
  const { axesTitles } = d[0];
  const firstXAxisTitle =
    axesTitles[0][0] === undefined ? 'The x axis is not titled' : `The x axis is titled ${axesTitles[0][0]}`;
  const firstXAxisGroupId = axesTitles[0][1];
  const multipleTitles = Object.entries(d[0].yDomains).length > 1 || Object.entries(d[0].axesTitles).length > 2;
  return multipleTitles
    ? `This chart has multiple y axes. The axes are ${d[0].yScaleType}. ${axesWithTitles(
        d[0].axesTitles,
        d[0].yDomains,
        d[0].xDomain,
      )}`
    : `${firstXAxisTitle}. ${
        firstXAxisGroupId === undefined
          ? `Its y axis does not have a defined domain.`
          : // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `The y axis domain is ${d[0].yDomains[firstXAxisGroupId]}`
      }`;
};

const formatForTimeXAxis = (d: ScreenReaderData[]) => {
  if (d[0].xDomain === undefined) return 'is undefined';
  const [startDomain, endDomain] = d[0].xDomain;
  return d[0].xScaleType !== ScaleType.Time
    ? `scale type is ${d[0].xScaleType}. The domain is ${startDomain} to ${endDomain}`
    : `scale type is time with the domain ${new Date(startDomain).toTimeString()} to ${new Date(
        endDomain,
      ).toTimeString()}`;
};

/** @internal */
export const computeAlternativeChartText = (d: ScreenReaderData[]): string => {
  const numberOfSeriesByType: { [key: string]: number } = {};
  d.forEach((series) => {
    const { seriesType } = series;

    if (numberOfSeriesByType[seriesType]) {
      numberOfSeriesByType[seriesType]++;
    } else {
      numberOfSeriesByType[seriesType] = 1;
    }
  });

  const namedSeries = d[0].seriesName !== undefined ? `The chart is named ${d[0].seriesName}. ` : '';

  const mixedSeriesChart =
    Object.keys(numberOfSeriesByType).length > 1 ? `This chart has different series types in it.` : '';
  const stackedSeries = d[0].splitAccessor
    ? `This chart has stacked series in it. The scale type of the y axes are ${d[0].yScaleType}. `
    : '';

  const multipleSeries = d.length > 1;
  const typesOfSeries = multipleSeries
    ? readOutSeriesCountandType(numberOfSeriesByType)
    : `There is one ${d[0].seriesType} series in this chart.`;

  const chartHasAxes =
    d[0].axesTitles.length === 0
      ? 'This chart does not have axes.'
      : `The x axis is ${formatForTimeXAxis(d)}. ${getAxesTitlesAndDomains(d)}`;

  return `${namedSeries}${mixedSeriesChart} ${stackedSeries} ${
    mixedSeriesChart !== '' || stackedSeries !== '' ? `It` : `The  chart`
  } has ${d.length} series in it. ${typesOfSeries} ${chartHasAxes}`;
};

/** @internal */
export const ScreenReaderDataTableComponent = (props: ScreenReaderDataTableStateProps) => {
  const { data } = props;

  if (!data) {
    return null;
  }
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
