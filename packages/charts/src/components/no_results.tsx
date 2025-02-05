/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { FC, Suspense } from 'react';

import { SettingsProps } from '../specs';

interface NoResultsProps {
  renderFn?: SettingsProps['noResults'];
}

/** @internal */
export const NoResults: FC<NoResultsProps> = ({ renderFn }) => (
  <Suspense fallback={() => null}>
    <div className="echReactiveChart_noResults">{renderFn ?? <p>No data to display</p>}</div>
  </Suspense>
);
