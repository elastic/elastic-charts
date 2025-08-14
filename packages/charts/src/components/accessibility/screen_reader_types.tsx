/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { SummaryPart } from '../../state/chart_selectors';
import type { A11ySettings } from '../../state/selectors/get_accessibility_config';

interface ScreenReaderTypesProps {
  summaryParts?: SummaryPart[];
}

/** @internal */
export function ScreenReaderTypes({ summaryParts }: A11ySettings & ScreenReaderTypesProps) {
  const hasSummaryParts = summaryParts && summaryParts.length > 0;

  if (!hasSummaryParts) {
    return null;
  }

  return (
    <dl>
      {summaryParts.map((part) => (
        <React.Fragment key={part.id || part.label}>
          <dt>{part.label}:</dt>
          <dd id={part.id}>{part.value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
