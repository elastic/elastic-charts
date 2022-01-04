/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { createRef, memo, useState } from 'react';
import { connect } from 'react-redux';

import {
  getScreenReaderDataSelector,
  CartesianData,
} from '../../chart_types/xy_chart/state/selectors/get_screen_reader_data';
import { SettingsSpec } from '../../specs/settings';
import { GlobalChartState } from '../../state/chart_state';
import {
  A11ySettings,
  DEFAULT_A11Y_SETTINGS,
  getA11ySettingsSelector,
} from '../../state/selectors/get_accessibility_config';
import { getInternalIsInitializedSelector, InitStatus } from '../../state/selectors/get_internal_is_intialized';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_specs';

interface ScreenReaderCartesianTableProps {
  a11ySettings: A11ySettings;
  cartesianData: CartesianData;
  debug: SettingsSpec['debug'];
}

const ScreenReaderCartesianTableComponent = ({
  a11ySettings,
  cartesianData,
  debug,
}: ScreenReaderCartesianTableProps) => {
  const [count, setCount] = useState(0);
  const tableRowRef = createRef<HTMLTableRowElement>();
  const { tableCaption } = a11ySettings;

  const rowLimit = cartesianData.numberOfItemsInGroup * count;
  const tableLength = cartesianData.data[0].values.length;
  const handleMoreData = () => {
    // avoid going out of bounds
    if (count < tableLength - 1) {
      setCount(count + 1);
    }
    // generate the next group of data
    if (tableRowRef.current) {
      tableRowRef.current.focus();
    }
  };

  const handlePreviousData = () => {
    // avoid going out of bounds
    if (count > 0) {
      setCount(count - 1);
    }
    if (tableRowRef.current) {
      tableRowRef.current.focus();
    }
  };

  const { isSmallMultiple } = cartesianData;

  let countOfCol: number = 3;
  const totalColumns: number = isSmallMultiple ? (countOfCol += 3) : countOfCol;

  const smallDataTableSingleSeries = (
    <div className={`echScreenReaderOnly ${debug ? 'echScreenReaderOnlyDebug' : ''} echScreenReaderTable`}>
      <table>
        {tableCaption ? (
          <caption>{tableCaption}</caption>
        ) : (
          <caption>
            This table shows the full data set for the chart with one series named {cartesianData.data[0].label}
          </caption>
        )}
        <thead>
          <tr>
            <th scope="col">X Value</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {cartesianData.data.map(({ values }, index) => {
            {
              return values.map((val: { xValue: any; formatted: any; raw: any }, i: number) => {
                return (
                  <tr key={String(`screen-reader-row--${index} ${i}`)} tabIndex={-1}>
                    <td>{val.xValue && val.xValue}</td>
                    <td>{val.formatted ?? val.raw}</td>
                  </tr>
                );
              });
            }
          })}
        </tbody>
      </table>
    </div>
  );

  const smallDataTableMultipleSeries = (
    <div className={`echScreenReaderOnly ${debug ? 'echScreenReaderOnlyDebug' : ''} echScreenReaderTable`}>
      <table>
        {tableCaption ? (
          <caption>{tableCaption}</caption>
        ) : (
          <caption>This table shows the full data set for the chart with multiple series</caption>
        )}
        <thead>
          <tr>
            <th scope="col">X Value</th>
            <th scope="col">Label</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {/* {cartesianData.data.map(({ label, values }, index) => {
            {
              return values.map((val: { xValue: any; formatted: any; raw: any }, i: number) => {
                return (
                  <tr key={String(`screen-reader-row--${index} ${i}`)} tabIndex={-1}>
                    <td>{val.xValue && val.xValue}</td>
                    <td>{label}</td>
                    <td>{val.formatted ?? val.raw}</td>
                  </tr>
                );
              });
            }
          })} */}
          {cartesianData.data.map(({ label, values }, index) => {
            return values.map((val: { xValue: any; formatted: any; raw: any }, i: number) => {
              return (
                <tr key={String(`screen-reader-row--${index} ${i}`)} tabIndex={-1}>
                  <td>{val.xValue && val.xValue}</td>
                  <td>{label}</td>
                  <td>{val.formatted ?? val.raw}</td>
                </tr>
              );
            });
          })}
        </tbody>
      </table>
    </div>
  );

  const largeDataTable = (
    <div className={`echScreenReaderOnly ${debug ? 'echScreenReaderOnlyDebug' : ''} echScreenReaderTable`}>
      <table>
        {tableCaption ? (
          <caption>{tableCaption}</caption>
        ) : (
          <caption>
            `This table shows a partial selection of the full data set. To see the previous or next set of data,
            navigate to the previous and next button below the data.`
          </caption>
        )}
        <thead>
          <tr>
            {isSmallMultiple && cartesianData.smallMultipleTitle.length === 2 && (
              <th scope="col">{`Small multiple titles - ${cartesianData.smallMultipleTitle[0]} and ${cartesianData.smallMultipleTitle[1]}`}</th>
            )}
            {isSmallMultiple && cartesianData.smallMultipleTitle && (
              <th scope="col">{`Small multiple title - ${cartesianData.smallMultipleTitle[0]}`}</th>
            )}
            <th scope="col">Label</th>
            <th scope="col">Value</th>
            <th scope="col">X Value</th>
          </tr>
        </thead>

        <tbody>
          {cartesianData.data.map(({ label, values }, index) => {
            return (
              <tr
                key={String(`screen-reader-row--${index}`)}
                ref={rowLimit === index ? tableRowRef : undefined}
                tabIndex={-1}
              >
                {isSmallMultiple && cartesianData.smallMultipleTitle.length === 2 && (
                  <>
                    <th scope="row" colSpan={2}>
                      {values[count].smPanelTitle}
                    </th>
                  </>
                )}
                {isSmallMultiple && cartesianData.smallMultipleTitle.length === 1 && (
                  <th scope="row">{values[count].smPanelTitle}</th>
                )}
                <th scope="row">{label}</th>
                <td>{values[count].formatted ?? values[count].raw}</td>
                {values[count].xValue && <td>{values[count].xValue}</td>}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={totalColumns}>
              <button type="submit" onClick={() => handleMoreData()} tabIndex={-1}>
                Click to show next x value data
              </button>
            </td>
          </tr>
          <tr>
            <td colSpan={totalColumns}>
              <button type="submit" onClick={() => handlePreviousData()} tabIndex={-1}>
                Click to show previous x value data
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
  const numberOfSeries = cartesianData.data.length;
  return tableLength > 20
    ? largeDataTable
    : numberOfSeries === 1
    ? smallDataTableSingleSeries
    : smallDataTableMultipleSeries;
};

const DEFAULT_SCREEN_READER_SUMMARY = {
  a11ySettings: DEFAULT_A11Y_SETTINGS,
  cartesianData: {
    isSmallMultiple: false,
    smallMultipleTitle: [],
    hasAxes: false,
    data: [],
    numberOfItemsInGroup: 0,
  },
  debug: false,
};

const mapStateToProps = (state: GlobalChartState): ScreenReaderCartesianTableProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_SCREEN_READER_SUMMARY;
  }
  return {
    a11ySettings: getA11ySettingsSelector(state),
    cartesianData: getScreenReaderDataSelector(state),
    debug: getSettingsSpecSelector(state).debug,
  };
};
/** @internal */
export const ScreenReaderCartesianTable = memo(connect(mapStateToProps)(ScreenReaderCartesianTableComponent));
