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
  debugA11y: SettingsSpec['debugA11y'];
}

interface MultipleSeries {
  label: string | number;
  data: string | number;
  xValue: string | number;
  smPanelTitle: string | undefined;
}

/**
 * Helper function to format the cartesian data for serializing the data to show better comparision across multiple series
 */
const formatMultipleSeriesSmallData = (data: any[]) => {
  const formatted: Record<string, MultipleSeries[]> = {};
  data.map(({ values, label }) => {
    values.map(
      (val: { xValue: number | string; formatted: string; raw: number | string; smPanelTitle: string | undefined }) => {
        return formatted.hasOwnProperty(val.xValue)
          ? // add to the array value this new value with the same xValue
            formatted[val.xValue].push({
              label,
              data: val.formatted ?? val.raw,
              xValue: val.xValue,
              smPanelTitle: val.smPanelTitle,
            })
          : // create an array as the value so additional values can be added
            (formatted[val.xValue] = [
              { label, data: val.formatted ?? val.raw, xValue: val.xValue, smPanelTitle: val.smPanelTitle },
            ]);
      },
    );
  });
  return formatted;
};

const ScreenReaderCartesianTableComponent = ({
  a11ySettings,
  cartesianData,
  debugA11y,
}: ScreenReaderCartesianTableProps) => {
  const [count, setCount] = useState(0);
  const tableRowRef = createRef<HTMLTableRowElement>();
  const { tableCaption } = a11ySettings;

  const tableLength = cartesianData.data[0].values.length;
  const numberOfSeries = cartesianData.data.length;

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

  /**
   * Data table for small data sets (less than 20 data points) with only one series
   */
  const smallDataTableSingleSeries = (
    <div
      className={`echScreenReaderOnly ${debugA11y ? 'echScreenReaderOnly' : ''} echScreenReaderTable`}
      aria-live="polite"
    >
      <table>
        {tableCaption ? (
          <caption>{tableCaption}</caption>
        ) : (
          <caption>
            This table shows the full data set for the chart with one series named {cartesianData.data[0].label}.{' '}
            {cartesianData.axesTitles ?? null}
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
            <th scope="col">X Value</th>
            <th scope="col">Y Value</th>
          </tr>
        </thead>
        <tbody>
          {cartesianData.data.map(({ values }, index) => {
            {
              return values.map(
                (val: { xValue: any; formatted: any; raw: any; smPanelTitle: string | undefined }, i: number) => {
                  return (
                    <tr key={String(`screen-reader-row--${index} ${i}`)} tabIndex={-1}>
                      {isSmallMultiple && cartesianData.smallMultipleTitle.length === 2 && (
                        <th colSpan={2}>{val.smPanelTitle}</th>
                      )}
                      {isSmallMultiple && cartesianData.smallMultipleTitle.length !== 2 && (
                        <th scope="row">{val.smPanelTitle}</th>
                      )}
                      <td>{val.xValue && val.xValue}</td>
                      <td>{val.formatted ?? val.raw}</td>
                    </tr>
                  );
                },
              );
            }
          })}
        </tbody>
      </table>
    </div>
  );

  /**
   * Data table for small data sets (less than 20 data points) with multiple series
   */
  const smallDataTableMultipleSeries = (
    <div
      className={`echScreenReaderOnly ${debugA11y ? 'echScreenReaderOnly' : ''} echScreenReaderTable`}
      aria-live="polite"
    >
      <table>
        {tableCaption ? (
          <caption>{tableCaption}</caption>
        ) : (
          <caption>
            This table shows the full data set for the chart with multiple series. {cartesianData.axesTitles ?? null}{' '}
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
            <th scope="col">X Value</th>
            <th scope="col">Y Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(formatMultipleSeriesSmallData(cartesianData.data)).map((values: any, index) => {
            return values.map(
              (
                val: {
                  xValue: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined;
                  label: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined;
                  data: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined;
                  smPanelTitle: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined;
                },
                i: any,
              ) => {
                return (
                  <tr key={String(`screen-reader-row--${index} ${i}`)} tabIndex={-1}>
                    {isSmallMultiple && cartesianData.smallMultipleTitle.length === 2 && (
                      <th colSpan={2}>{val.smPanelTitle}</th>
                    )}
                    {isSmallMultiple && cartesianData.smallMultipleTitle.length !== 2 && (
                      <th scope="row">{val.smPanelTitle}</th>
                    )}
                    <td>{val.label}</td>
                    <td>{val.xValue}</td>
                    <td>{val.data}</td>
                  </tr>
                );
              },
            );
          })}
        </tbody>
      </table>
    </div>
  );

  /**
   * Data table for large data sets (more than 20 data points)
   */
  const largeDataTable = (
    <div
      className={`echScreenReaderOnly ${debugA11y ? 'echScreenReaderOnlyDebug' : ''} echScreenReaderTable`}
      aria-live="polite"
    >
      <table>
        {tableCaption ? (
          <caption>{tableCaption}</caption>
        ) : (
          <caption>
            This table shows a partial selection of the full data set. To see the previous or next set of data, navigate
            to the previous and next button below the data. {cartesianData.axesTitles ?? null}
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
            <th scope="col">Y Value</th>
            <th scope="col">X Value</th>
          </tr>
        </thead>

        <tbody>
          {cartesianData.data.map(({ label, values }, index) => {
            return (
              <tr key={`screen-reader-row--${index}`} ref={tableRowRef} tabIndex={0} className="tableRow">
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
                <td>{label}</td>
                <td>{values[count].formatted ?? values[count].raw}</td>
                {values[count].xValue && <td>{values[count].xValue}</td>}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={totalColumns}>
              <button type="submit" onClick={() => handleMoreData()} tabIndex={0}>
                Click to show next x value data
              </button>
            </td>
          </tr>
          <tr>
            <td colSpan={totalColumns}>
              <button type="submit" onClick={() => handlePreviousData()} tabIndex={0}>
                Click to show previous x value data
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

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
  debugA11y: false,
};

const mapStateToProps = (state: GlobalChartState): ScreenReaderCartesianTableProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_SCREEN_READER_SUMMARY;
  }
  return {
    a11ySettings: getA11ySettingsSelector(state),
    cartesianData: getScreenReaderDataSelector(state),
    debugA11y: getSettingsSpecSelector(state).debugA11y,
  };
};

/** @internal */
export const ScreenReaderCartesianTable = memo(connect(mapStateToProps)(ScreenReaderCartesianTableComponent));
