/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { TraceColorAccessor } from '@elastic/charts';
import { Chart, Settings, Trace, colorByOtelAttribute, fromOtlp } from '@elastic/charts';

import { FRONTEND_WEB_OTLP_ENVELOPE } from './data';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

/** Groups spans by the `service.name` resource attribute set per resourceSpans entry. */
const BY_SERVICE: TraceColorAccessor = colorByOtelAttribute('service.name');

/** Pre-converted at module load: fromOtlp attaches resource.attributes to each span's meta. */
const DATA = fromOtlp(FRONTEND_WEB_OTLP_ENVELOPE);

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description} size={{ width: '100%', height: 350 }}>
    <Settings baseTheme={useBaseTheme()} />
    <Trace id="trace_kibana" data={DATA} xScaleType="linear" traceId="trace1" colorBy={BY_SERVICE} />
  </Chart>
);

Example.parameters = {
  markdown:
    'Real 4-service distributed trace from Kibana APM `frontend-web` service ' +
    '(`frontend-web → product-recommendation → inventory-service / user-preference-service`), ' +
    "200 ms total, colored by `service.name` via `colorByOtelAttribute('service.name')`. " +
    'Data is a faithful `OtlpEnvelope` extracted from ES ' +
    '(traceId `68822000000000000000000000080950`), converted by `fromOtlp()`.',
};
