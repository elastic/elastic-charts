/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { memo } from 'react';
import { connect } from 'react-redux';

import { ScreenReaderDescription } from './description';
import { ScreenReaderLabel } from './label';
import { mapStateToProps } from './screen_reader_summary_connector';
import type { ScreenReaderSummaryData } from '../../state/selectors/get_screen_reader_summary';

const ScreenReaderSummaryComponent = ({ a11ySettings, chartSpecificData }: ScreenReaderSummaryData) => {
  return (
    <figcaption className="echScreenReaderOnly" id={`${a11ySettings.descriptionId}-summary`}>
      <ScreenReaderLabel {...a11ySettings} chartLabelData={chartSpecificData?.labelData} />
      {a11ySettings.generatedDescription}
      <ScreenReaderDescription {...a11ySettings} />
    </figcaption>
  );
};

/** @internal */
export const ScreenReaderSummary = memo(connect(mapStateToProps)(ScreenReaderSummaryComponent));
