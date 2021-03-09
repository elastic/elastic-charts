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

import { Scale } from '../../scales';
import { ScaleType } from '../../scales/constants';
import { SeriesName, SeriesNameConfigOptions, SeriesNameFn, SeriesTypes } from '../../specs';
import { GlobalChartState } from '../../state/chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../../state/selectors/get_internal_is_intialized';
import { getScreenReaderDataSelector } from '../../state/selectors/get_screen_reader_data';
import { GroupId } from '../../utils/ids';

export interface ScreenReaderData {
  seriesName: SeriesName | SeriesNameFn | undefined | SeriesNameConfigOptions;
  seriesType: SeriesTypes;
  splitAccessor: Map<string | number, string | number>;
  dataKey: string[];
  dataValue: any[];
  xScale: Scale;
  yScales: Map<GroupId, Scale>;
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
const axesWithTitles = (titles: (undefined | string)[][], xScale: Scale, yScales: Map<GroupId, Scale>) => {
  let titleDomain = yScales.size > 1 ? `There are ${yScales.size} y-axes. ` : ' ';
  const numberOfScales = titles.length > yScales.size ? titles.length : yScales.size;
  for (let i = 0; i < numberOfScales; i++) {
    const axisDirection = titles[i][2] === 'top' || titles[i][2] === 'bottom' ? 'x-' : 'y-';
    const scaleType = axisDirection === 'x-' ? xScale.type : yScales.get(titles[i][1]!)?.type;
    const axisTitle = titles[i][0];
    const axisDomain =
      yScales.get(titles[i][1]!)!.domain === undefined
        ? 'The axis does not have a defined domain'
        : `${
            axisDirection === 'y-' ? yScales.get(titles[i][1]!)!.domain.toString() : formatForTimeOrOrdinalAxis(xScale)
          }`;
    titleDomain +=
      yScales.size === 1
        ? `The ${axisDirection}axis has the scale type  ${scaleType} and has the title ${axisTitle} with the domain ${axisDomain}. `
        : `${i}. A ${axisDirection}axis is the scale type ${scaleType} and is titled ${axisTitle} with the domain ${axisDomain}. `;
  }

  return titleDomain;
};

/** helper function to read out each title for the axes if present */
const getAxesTitlesAndDomains = (d: ScreenReaderData[]) => {
  const { axesTitles, yScales } = d[0];
  const firstXAxisTitle =
    axesTitles[0][0] === undefined ? 'The x-axis is not titled' : `The x-axis is titled ${axesTitles[0][0]}`;
  const firstXAxisGroupId = axesTitles[0][1];
  const multipleTitles = Object.entries(d[0].axesTitles).length >= 2;
  const yAxisGroupId = typeof axesTitles[1] !== 'object' ? ' ' : axesTitles[1][1];
  return multipleTitles
    ? `This chart has ${yScales.size + 1} unique axes. ${axesWithTitles(d[0].axesTitles, d[0].xScale, d[0].yScales)}`
    : `${firstXAxisTitle}. ${
        firstXAxisGroupId === undefined
          ? `Its y-axis does not have a defined domain.`
          : // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `The y-axis domain is ${yScales.get(yAxisGroupId!)?.domain}`
      }`;
};

const formatForTimeOrOrdinalAxis = (xScale: Scale) => {
  if (xScale.domain === undefined) return 'is undefined';
  if (xScale.type === 'ordinal') return `is ordinal.`;
  const [startDomain, endDomain] = xScale.domain;
  return xScale.type !== ScaleType.Time
    ? // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      ` ${startDomain} to ${endDomain}`
    : ` ${new Date(startDomain).toTimeString()} to ${new Date(endDomain).toTimeString()}`;
};

/** @internal */
export const computeAlternativeChartText = (d: ScreenReaderData[]): string => {
  const { seriesName, axesTitles, splitAccessor, seriesType, yScales } = d[0];
  const numberOfSeriesByType: { [key: string]: number } = {};
  d.forEach(() => {
    if (numberOfSeriesByType[seriesType]) {
      numberOfSeriesByType[seriesType]++;
    } else {
      numberOfSeriesByType[seriesType] = 1;
    }
  });

  const namedSeries = seriesName === undefined ? '' : `The chart is named ${seriesName}. `;

  const mixedSeriesChart =
    Object.keys(numberOfSeriesByType).length > 1 ? `This chart has different series types in it.` : '';

  const yAxisGroupId = axesTitles.length === 0 || !axesTitles[0][1] ? '' : axesTitles[0][1];
  const stackedSeries =
    splitAccessor.size > 1
      ? `This chart has stacked series in it. The scale type of the y-axes are ${yScales.get(yAxisGroupId)?.type}. `
      : '';

  const multipleSeries = d.length > 1;
  const typesOfSeries = multipleSeries
    ? readOutSeriesCountandType(numberOfSeriesByType)
    : `There is one ${seriesType} series in this chart.`;

  const chartHasAxes = axesTitles.length === 0 ? 'This chart does not have axes.' : `${getAxesTitlesAndDomains(d)}`;

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
