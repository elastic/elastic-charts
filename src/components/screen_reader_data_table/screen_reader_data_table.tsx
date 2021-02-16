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
import { SeriesName, SeriesNameConfigOptions, SeriesNameFn } from '../../specs';
import { GlobalChartState } from '../../state/chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../../state/selectors/get_internal_is_intialized';
import { getScreenReaderDataSelector } from '../../state/selectors/get_screen_reader_data';

export interface ScreenReaderData {
  seriesName: SeriesName | SeriesNameFn | undefined | SeriesNameConfigOptions;
  seriesType: string | null;
  dataKey: string[];
  dataValue: any[];
  xScaleType: ScaleType;
  yScaleType: ScaleType;
}

export interface ScreenReaderDataTableStateProps {
  data: ScreenReaderData[];
}

/** @internal */
export const altTextChartDescription = () => {
  // if there is a stackAccessor in the series then it is stacked
  return `There are 3 series in this chart.
  There are 2 line series and 1 area series.
  Each series has 10 data points.
  There is an x-axis and one y-axis
  The x-axis is linear. The y axis is linear
  The x-axis domain is 0 to 100
  The y-axis domain is 0 to 5.00 
  `;
};

/** @internal */
export const renderAltText = (data: ScreenReaderData[]) => {
  if (!data[0]) {
    return;
  }

  const validSeriesName = data[0].seriesName !== undefined ? ` with the name ${data[0].seriesName}` : ``;

  return `This chart has a total of ${data.length} series. ${data.map((value, index) => {
    return ` The ${index + 1} series of ${data.length} series is a ${
      value.seriesType
    } series${validSeriesName}. The x scale is ${value.xScaleType} and the y scale is ${value.yScaleType}.`;
  })}

`;
};

export const ScreenReaderDataTableComponent = (props: ScreenReaderDataTableStateProps) => {
  const { data } = props;

  if (!data) {
    return null;
  }

  const classes = 'echDataTable';

  const computeScreenReaderTable = (d: ScreenReaderData[]) => {
    const dataKeys: JSX.Element[] = [];
    // go through the number of series in ScreenReaderData
    for (let seriesIndex = 0; seriesIndex < d.length; seriesIndex++) {
      if (d.length !== 1) {
        dataKeys.push(
          <tr key={`${d[seriesIndex].dataKey}__${seriesIndex}`}>
            <th key={`${d[seriesIndex].dataValue}__${d[seriesIndex].seriesName}__${seriesIndex}`}>
              {seriesIndex + 1} series of the total {d.length} series{' '}
            </th>
          </tr>,
        );
      }
      // get the index of the key in each series and use the index to get the index of it in the values
      for (let j = 0; j < d[seriesIndex].dataKey.length; j++) {
        dataKeys.push(
          <tr
            key={`${d[seriesIndex].seriesType}__${d[seriesIndex].dataKey[j]}__${seriesIndex}`}
            aria-labelledby="alt text for chart data"
          >
            <th
              scope="row"
              key={`${d[seriesIndex].seriesType}__${d[seriesIndex].dataValue[j]}__${seriesIndex}`}
              align="center"
            >
              {d[seriesIndex].dataKey[j]}
            </th>
            {d[seriesIndex].dataValue.map((value, index) => {
              return (
                <td
                  key={`${d[seriesIndex].seriesName}__${d[seriesIndex].dataKey[index]}__${seriesIndex}${index}`}
                  align="center"
                >
                  {value[j]}
                </td>
              );
            })}
          </tr>,
        );
      }
    }
    return dataKeys;
  };

  return (
    <>
      <p className={classes} aria-label="information about the serie(s) within the chart">
        {renderAltText(data)}
      </p>
      <table className={classes} role="presentation" tabIndex={-1}>
        <tbody>{computeScreenReaderTable(data)}</tbody>
      </table>
    </>
  );
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
export const ScreenReaderDataTable = connect(mapStateToProps)(ScreenReaderDataTableComponent);
