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

import React, { memo } from 'react';
import { connect } from 'react-redux';

import { ShapeViewModel } from '../../chart_types/partition_chart/layout/types/viewmodel_types';
import { partitionMultiGeometries } from '../../chart_types/partition_chart/state/selectors/geometries';
import {
  getScreenReaderDataSelector,
  LabelsInterface,
} from '../../chart_types/partition_chart/state/selectors/get_screen_reader_data';
import { getPartitionSpecs } from '../../chart_types/partition_chart/state/selectors/partition_spec';
import { GlobalChartState } from '../../state/chart_state';
import {
  A11ySettings,
  DEFAULT_A11Y_SETTINGS,
  getA11ySettingsSelector,
} from '../../state/selectors/get_accessibility_config';
import { getInternalIsInitializedSelector, InitStatus } from '../../state/selectors/get_internal_is_intialized';
import { ValueFormatter } from '../../utils/common';

interface ScreenReaderSunburstTableStateProps {
  a11ySettings: A11ySettings;
  screenReaderData: LabelsInterface[];
  shapeViewModel: ShapeViewModel[];
  formatter: ValueFormatter;
}

const renderTableContent = (data: any[], formatter?: ValueFormatter) => {
  return data.map((value: LabelsInterface, i: any) => {
    return (
      <tr key={`row--${i}`}>
        <th scope="row">{value.label}</th>
        <td>{formatter && formatter(value.valueText) ? formatter(value.valueText) : value.valueText}</td>
        <td>{value.percentage}</td>
      </tr>
    );
  });
};

const ScreenReaderSunburstTableComponent = ({
  a11ySettings,
  shapeViewModel,
  screenReaderData,
  formatter,
}: ScreenReaderSunburstTableStateProps) => {
  const { tableCaption } = a11ySettings;
  return (
    <div className="echScreenReaderOnly screenReaderTable">
      <table>
        <caption>{tableCaption}</caption>
        <thead>
          {shapeViewModel.map((value: { panelTitle: any; layers: any[] }) => {
            const title = value.panelTitle;
            return value.layers.map((val: any, index: React.Key | null | undefined) => (
              <th key={index} scope="col">{`${title || `Category`}`}</th>
            ));
          })}
          <th scope="col">Value</th>
          <th scope="col">Percentage</th>
        </thead>
        <tbody>{renderTableContent(screenReaderData, formatter)}</tbody>
      </table>
    </div>
  );
};

const DEFAULT_SCREEN_READER_SUMMARY = {
  a11ySettings: DEFAULT_A11Y_SETTINGS,
  screenReaderData: [],
  shapeViewModel: [],
  formatter: (value: number) => value.toString(),
};

const mapStateToProps = (state: GlobalChartState): ScreenReaderSunburstTableStateProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_SCREEN_READER_SUMMARY;
  }
  return {
    a11ySettings: getA11ySettingsSelector(state),
    screenReaderData: getScreenReaderDataSelector(state),
    shapeViewModel: partitionMultiGeometries(state),
    formatter: getPartitionSpecs(state)[0].valueFormatter,
  };
};
/** @internal */
export const ScreenReaderSunburstTable = memo(connect(mapStateToProps)(ScreenReaderSunburstTableComponent));
