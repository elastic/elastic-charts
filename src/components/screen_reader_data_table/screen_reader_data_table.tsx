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

const ScreenReaderDataTableComponent = (props: ScreenReaderDataTableStateProps) => {
  const { data } = props;

  if (!data) {
    return null;
  }

  const classNames = 'echDataTable';

  const renderText = () => {
    if (!data[0]) {
      return;
    }

    return `This chart has ${data.length} series in it. ${data.map((value, index) => {
      return ` The ${index + 1} series of ${data.length} series is a ${value.seriesType} series`;
    })}`;
  };

  const screenReaderTable = (d: ScreenReaderData[]) => {
    const dataKeys: JSX.Element[] = [];
    // go through the number of series in ScreenReaderData
    for (let seriesIndex = 0; seriesIndex < d.length; seriesIndex++) {
      if (d.length !== 1) {
        dataKeys.push(
          <th key={Math.random()}>
            {seriesIndex + 1} series of the total {d.length} series{' '}
          </th>,
        );
      }
      // get the index of the key in each series and use the index to get the index of it in the values
      for (let j = 0; j < d[seriesIndex].dataKey.length; j++) {
        dataKeys.push(
          <tr key={Math.random()}>
            <th scope="row" key={Math.random()}>
              {d[seriesIndex].dataKey[j]}
            </th>
            {d[seriesIndex].dataValue.map((value) => {
              return <td key={Math.random()}>{value[j]}</td>;
            })}
          </tr>,
        );
      }
    }
    return dataKeys;
  };

  return (
    <>
      <p className={classNames} aria-label="alt text for chart">
        {renderText()}
      </p>
      <table className={classNames}>
        <tbody>{screenReaderTable(data)}</tbody>
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
