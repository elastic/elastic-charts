/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { memo, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';

import {
  getTraceBadgeClickHandlerSelector,
  getTraceTableRowsSelector,
  type TraceTableBadge,
  type TraceTableRow,
} from '../state/selectors/get_screen_reader_data';
import type { GlobalChartState } from '../../../state/chart_state';
import type { A11ySettings } from '../../../state/selectors/get_accessibility_config';
import { DEFAULT_A11Y_SETTINGS, getA11ySettingsSelector } from '../../../state/selectors/get_accessibility_config';
import { getInternalIsInitializedSelector, InitStatus } from '../../../state/selectors/get_internal_is_intialized';
import { isNil } from '../../../utils/common';
import type { TraceSpec } from '../trace_api';

interface ScreenReaderTraceTableProps {
  a11ySettings: A11ySettings;
  rows: TraceTableRow[];
  onBadgeClick: TraceSpec['onBadgeClick'];
}

/** Number of rows shown per "show more" page. */
const TABLE_PAGINATION = 20;

/**
 * Renders one span's Span badges into its SR-table cell (Spec 27). With an `onBadgeClick` handler the
 * badges are keyboard-activatable `<button>`s (activation dispatches a `keyboard`-source badge event,
 * never synthesizing hover); without one they are inert, informational text. Accessible names come
 * from the resolved badge aria labels — assistive tech reads full names even for truncated badges.
 * @internal
 */
export const TraceTableBadgeCell = ({
  badges,
  onBadgeClick,
}: {
  badges: TraceTableBadge[];
  onBadgeClick: TraceSpec['onBadgeClick'];
}) => {
  if (badges.length === 0) return <>—</>;
  return (
    <>
      {badges.map(({ id, ariaLabel, badge, span }) =>
        onBadgeClick ? (
          <button
            key={id}
            type="button"
            tabIndex={-1}
            onClick={() => onBadgeClick({ source: 'keyboard', badge, span })}
          >
            {ariaLabel}
          </button>
        ) : (
          <span key={id}>{ariaLabel}</span>
        ),
      )}
    </>
  );
};

const ScreenReaderTraceTableComponent = ({ a11ySettings, rows, onBadgeClick }: ScreenReaderTraceTableProps) => {
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
            <th scope="col">Badges</th>
          </tr>
        </thead>
        <tbody>
          {rows
            .slice(0, rowLimit)
            .map(({ id, name, totalDuration, selfTime, startOffset, parentName, badges }, index) => (
              <tr key={id} ref={index === rowLimit - TABLE_PAGINATION ? tableRowRef : undefined} tabIndex={-1}>
                <th scope="row">{name}</th>
                <td>{totalDuration}</td>
                <td>{selfTime}</td>
                <td>{startOffset}</td>
                <td>{parentName}</td>
                <td>
                  <TraceTableBadgeCell badges={badges} onBadgeClick={onBadgeClick} />
                </td>
              </tr>
            ))}
        </tbody>
        {showMoreRows && (
          <tfoot>
            <tr>
              <td colSpan={6}>
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
  onBadgeClick: undefined,
};

const mapStateToProps = (state: GlobalChartState): ScreenReaderTraceTableProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }
  return {
    a11ySettings: getA11ySettingsSelector(state),
    rows: getTraceTableRowsSelector(state),
    onBadgeClick: getTraceBadgeClickHandlerSelector(state),
  };
};

/** @internal */
export const ScreenReaderTraceTable = memo(connect(mapStateToProps)(ScreenReaderTraceTableComponent));
