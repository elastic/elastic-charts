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

import { percentFormatter, percentValueGetter } from '../../chart_types/partition_chart/layout/config';
import { ShapeViewModel } from '../../chart_types/partition_chart/layout/types/viewmodel_types';
import { partitionMultiGeometries } from '../../chart_types/partition_chart/state/selectors/geometries';
import { GlobalChartState } from '../../state/chart_state';
import {
  A11ySettings,
  DEFAULT_A11Y_SETTINGS,
  getA11ySettingsSelector,
} from '../../state/selectors/get_accessibility_config';
import { getInternalIsInitializedSelector, InitStatus } from '../../state/selectors/get_internal_is_intialized';

interface ScreenReaderSunburstTableStateProps {
  a11ySettings: A11ySettings;
  partitionSpec: ShapeViewModel[];
}

const formatPartitionDataHeaders = (partitionSpec: ShapeViewModel[]) => {
  return partitionSpec.map((val) => {
    return val.linkLabelViewModels.linkLabels.map((value, index) => {
      return <th key={index}>{value.text}</th>;
    });
  });
};

const formatPartitionDataRows = (partitionSpec: ShapeViewModel[]) => {
  return partitionSpec.map((val) => {
    return val.linkLabelViewModels.linkLabels.map((value, index) => {
      return <td key={index}>{value.valueText}</td>;
    });
  });
};

const formatPartitionDataSlicePercentage = (partitionSpec: ShapeViewModel[]) => {
  return partitionSpec.map((node) => {
    return node.quadViewModel.map((value, index) => {
      return <td key={index}>{percentFormatter(percentValueGetter(value))}</td>;
    });
  });
};

const ScreenReaderSunburstTableComponent = ({ a11ySettings, partitionSpec }: ScreenReaderSunburstTableStateProps) => {
  const { tableCaption } = a11ySettings;

  return (
    <div className="echScreenReaderOnly screenReaderTable">
      <table>
        <caption>{tableCaption}</caption>
        <thead>
          {partitionSpec.map((value) => {
            const title = value.panelTitle;
            return value.layers.map((val, index) => <tr key={index}>{`${title || `Category`}`}</tr>);
          })}
        </thead>
        <tbody>
          <tr>
            <th scope="row">{formatPartitionDataHeaders(partitionSpec)}</th>
            {formatPartitionDataRows(partitionSpec)}
            <tr>{formatPartitionDataSlicePercentage(partitionSpec)}</tr>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const DEFAULT_SCREEN_READER_SUMMARY = {
  a11ySettings: DEFAULT_A11Y_SETTINGS,
  partitionSpec: [],
};

const mapStateToProps = (state: GlobalChartState): ScreenReaderSunburstTableStateProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_SCREEN_READER_SUMMARY;
  }
  return {
    a11ySettings: getA11ySettingsSelector(state),
    partitionSpec: partitionMultiGeometries(state),
  };
};
/** @internal */
export const ScreenReaderSunburstTable = memo(connect(mapStateToProps)(ScreenReaderSunburstTableComponent));
