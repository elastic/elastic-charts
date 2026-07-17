/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { memo, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';

import { getTraceTableRowsSelector, type TraceTableRow } from '../state/selectors/get_screen_reader_data';
import type { GlobalChartState } from '../../../state/chart_state';
import type { A11ySettings } from '../../../state/selectors/get_accessibility_config';
import { DEFAULT_A11Y_SETTINGS, getA11ySettingsSelector } from '../../../state/selectors/get_accessibility_config';
import { getInternalIsInitializedSelector, InitStatus } from '../../../state/selectors/get_internal_is_intialized';
import { isNil } from '../../../utils/common';

interface ScreenReaderTraceTableProps {
  a11ySettings: A11ySettings;
  rows: TraceTableRow[];
}

/** Number of rows shown per "show more" page. */
const TABLE_PAGINATION = 20;

const ScreenReaderTraceTableComponent = ({ a11ySettings, rows }: ScreenReaderTraceTableProps) => {
  const [count, setCount] = useState(1);
  const tableRowRef = useRef<HTMLTableRowElement>(null);
  const prevCountRef = useRef(1);
  const { tableCaption } = a11ySettings;

  const rowLimit = TABLE_PAGINATION * count;
  const tableLength = rows.length;
  const showMoreRows = rowLimit < tableLength;

  // Focus the first newly-revealed row after "show more" is clicked. Running in useEffect
  // ensures the DOM has re-rendered (new rows mounted) before focus() is called.
  useEffect(() => {
    if (count > prevCountRef.current) {
      prevCountRef.current = count;
      tableRowRef.current?.focus();
    }
  }, [count]);

  const handleMoreData = () => {
    setCount(count + 1);
    // focus() is deferred to the useEffect above so it runs after the DOM update.
  };

  return (
    <div className="echScreenReaderOnly echScreenReaderTable" data-testid="echScreenReaderTraceTable">
      <table>
        <caption>
          {isNil(tableCaption)
            ? `The table ${
                showMoreRows
                  ? `represents only ${rowLimit} of the ${tableLength} spans`
                  : `fully represents the dataset of ${tableLength} span${tableLength !== 1 ? 's' : ''}`
              }`
            : tableCaption}
        </caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Total duration</th>
            <th scope="col">Self time</th>
            <th scope="col">Start offset</th>
            <th scope="col">Parent</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, rowLimit).map(({ id, name, totalDuration, selfTime, startOffset, parentName }, index) => (
            <tr
              key={id}
              ref={index === rowLimit - TABLE_PAGINATION ? tableRowRef : undefined}
              tabIndex={-1}
            >
              <th scope="row">{name}</th>
              <td>{totalDuration}</td>
              <td>{selfTime}</td>
              <td>{startOffset}</td>
              <td>{parentName}</td>
            </tr>
          ))}
        </tbody>
        {showMoreRows && (
          <tfoot>
            <tr>
              <td colSpan={5}>
                <button type="button" onClick={handleMoreData} tabIndex={-1}>
                  Click to show more data
                </button>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};

const DEFAULT_PROPS: ScreenReaderTraceTableProps = {
  a11ySettings: DEFAULT_A11Y_SETTINGS,
  rows: [],
};

const mapStateToProps = (state: GlobalChartState): ScreenReaderTraceTableProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }
  return {
    a11ySettings: getA11ySettingsSelector(state),
    rows: getTraceTableRowsSelector(state),
  };
};

/** @internal */
export const ScreenReaderTraceTable = memo(connect(mapStateToProps)(ScreenReaderTraceTableComponent));
