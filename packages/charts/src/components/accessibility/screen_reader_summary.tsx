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
import { ScreenReaderItems } from './screen_reader_items';
import { mapStateToProps } from './screen_reader_summary_connector';
import type { ScreenReaderSummaryData } from '../../state/selectors/get_screen_reader_summary';

const ScreenReaderSummaryComponent = ({
  a11ySettings,
  screenReaderData,
  consolidatedSummary,
}: ScreenReaderSummaryData) => {
  return (
    <figcaption
      className="echScreenReaderOnly"
      id={`${a11ySettings.descriptionId}-summary`}
      data-testid="echScreenReaderSummary"
    >
      {consolidatedSummary}
      <ScreenReaderDescription {...a11ySettings} />
      <ScreenReaderItems {...a11ySettings} screenReaderItems={screenReaderData?.screenReaderItems} />
    </figcaption>
  );
};

/** @internal */
export const ScreenReaderSummary = memo(connect(mapStateToProps)(ScreenReaderSummaryComponent));
