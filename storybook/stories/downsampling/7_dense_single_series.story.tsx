/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Fit } from '@elastic/charts';

import { DenseLines } from './6_dense_multi_series.story';
import type { ChartsStory } from '../../types';

// the series has a fit, as the charts of Kibana Lens always do, though it has no missing value to fill in
export const Example: ChartsStory = (_, { title, description }) => (
  <DenseLines
    seriesCount={1}
    pointsPerSeries={2_000_000}
    fit={{ type: Fit.Linear }}
    title={title}
    description={description}
  />
);
