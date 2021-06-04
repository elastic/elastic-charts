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

import React, { createRef, memo, RefObject, useState } from 'react';
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
import { isNil } from '../../utils/common';

interface ScreenReaderPartitionTableProps {
  a11ySettings: A11ySettings;
  screenReaderData: LabelsInterface[];
  shapeViewModel: ShapeViewModel[];
  configMaxCount?: number;
}

const maxRowsToShow = 200;

const ScreenReaderPartitionTableComponent = ({
  a11ySettings,
  shapeViewModel,
  screenReaderData,
  configMaxCount,
}: ScreenReaderPartitionTableProps) => {
  const [count, setCount] = useState(1);
  const tableRowRef = createRef<HTMLTableRowElement>();
  const { tableCaption } = a11ySettings;
  const moreThanOneLayer = shapeViewModel[0].layers.length > 1;

  const renderTableRows = (
    value: LabelsInterface,
    index: number,
    c: number,
    layers: boolean,
    ref: RefObject<HTMLTableRowElement>,
    maxRows?: number,
  ) => {
    return (
      <tr key={`row--${index}`} ref={maxRows && maxRows * (c - 1) === index ? ref : undefined} tabIndex={-1}>
        <th scope="row">{value.label}</th>
        {layers && <td>{value.depth}</td>}
        {layers && <td>{value.parentName}</td>}
        <td>{value.valueText}</td>
        <td>{value.percentage}</td>
      </tr>
    );
  };

  const renderTableContent = (
    d: any[],
    c: number,
    layers: boolean,
    ref: RefObject<HTMLTableRowElement>,
    maxRows?: number,
  ) => {
    const showCount = maxRows && d.length > maxRowsToShow ? maxRows : Infinity;
    return d.slice(0, showCount * c).map((value, i) => renderTableRows(value, i, c, layers, ref, maxRows));
  };

  const handleMoreData = () => {
    setCount(count + 1);
    const nextSliceOfData = screenReaderData.slice(count * configMaxCount!, count * configMaxCount! + configMaxCount!);
    // generate the next group of data
    if (tableRowRef.current) {
      tableRowRef.current.focus();
    }
    return renderTableContent(nextSliceOfData, count, moreThanOneLayer, tableRowRef, configMaxCount);
    // // Set active element to the startOfConfigMaxCount
    // return tableRowRef.current ? tableRowRef.current.focus() : undefined;
  };

  const showMoreCellsButton =
    configMaxCount && screenReaderData.length > maxRowsToShow && count < screenReaderData.length ? (
      <tfoot>
        <tr>
          <td>
            <button type="submit" onClick={() => handleMoreData()} tabIndex={-1}>
              Click to show more data
            </button>
          </td>
        </tr>
      </tfoot>
    ) : null;

  return (
    <div className="echScreenReaderOnly echScreenReaderTable">
      <table>
        <caption>
          {isNil(tableCaption)
            ? `The table ${
                configMaxCount && screenReaderData.length > maxRowsToShow
                  ? `represents only ${configMaxCount} of the ${screenReaderData.length} data points`
                  : `fully represents the dataset of ${screenReaderData.length} data point${
                      screenReaderData.length > 1 ? 's' : ''
                    }`
              }`
            : tableCaption}
        </caption>
        <thead>
          <tr>
            {shapeViewModel.map((value: { panelTitle: string; layers: any[] }) => {
              const title = value.panelTitle;
              return value.layers.map((val: any, index: number) => (
                <th key={`table header--${index}`} scope="col">{`${title || `Category`}`}</th>
              ));
            })}
            {moreThanOneLayer && <th scope="col">Depth</th>}
            {moreThanOneLayer && <th scope="col">Parent</th>}
            <th scope="col">Value</th>
            <th scope="col">Percentage</th>
          </tr>
        </thead>
        {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
        <tbody>{renderTableContent(screenReaderData, count, moreThanOneLayer, tableRowRef, configMaxCount)}</tbody>
        {showMoreCellsButton}
      </table>
    </div>
  );
};

const DEFAULT_SCREEN_READER_SUMMARY = {
  a11ySettings: DEFAULT_A11Y_SETTINGS,
  screenReaderData: [],
  shapeViewModel: [],
};

const mapStateToProps = (state: GlobalChartState): ScreenReaderPartitionTableProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_SCREEN_READER_SUMMARY;
  }
  return {
    a11ySettings: getA11ySettingsSelector(state),
    screenReaderData: getScreenReaderDataSelector(state),
    shapeViewModel: partitionMultiGeometries(state),
    configMaxCount:
      getPartitionSpecs(state)[0].config.linkLabel?.maxCount || getPartitionSpecs(state)[0].config.maxRowCount,
  };
};
/** @internal */
export const ScreenReaderPartitionTable = memo(connect(mapStateToProps)(ScreenReaderPartitionTableComponent));
