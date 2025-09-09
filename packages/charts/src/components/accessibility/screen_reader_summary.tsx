/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { memo } from 'react';
import { connect } from 'react-redux';

import { ScreenReaderDescription } from './screen_reader_description';
import { ScreenReaderLabel } from './screen_reader_label';
import { ScreenReaderTypes } from './screen_reader_types';
import type { GlobalChartState } from '../../state/chart_state';
import type { ScreenReaderSummaryData } from '../../state/selectors/get_screen_reader_summary';
import { getScreenReaderSummarySelector } from '../../state/selectors/get_screen_reader_summary';

const ScreenReaderSummaryComponent = ({ a11ySettings, screenReaderData }: ScreenReaderSummaryData) => {
  return (
    <figcaption
      className="echScreenReaderOnly"
      id={`${a11ySettings.descriptionId}-summary`}
      data-testid="echScreenReaderSummary"
    >
      <ScreenReaderLabel {...a11ySettings} chartLabelData={screenReaderData?.labelData} />
      <ScreenReaderDescription {...a11ySettings} />
      <ScreenReaderTypes {...a11ySettings} screenReaderTypes={screenReaderData?.screenReaderTypes} />
    </figcaption>
  );
};

/** @internal */
export const mapStateToProps = (state: GlobalChartState): ScreenReaderSummaryData => {
  return getScreenReaderSummarySelector(state);
};

/** @internal */
export const ScreenReaderSummary = memo(connect(mapStateToProps)(ScreenReaderSummaryComponent));
