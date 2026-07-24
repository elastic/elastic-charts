/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import React from 'react';

import type { TraceColorAccessor, TraceDatum, TraceSpanBadge, TraceSpanBadgeAccessor } from '@elastic/charts';
import { Chart, Settings, Trace, anyValueToString, colorByOtelAttribute, fromOtlp } from '@elastic/charts';

import { FRONTEND_WEB_OTLP_ENVELOPE, LANGUAGE_BADGE_ICONS, DURATION_BADGE_ICON } from './data';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

/** Groups spans by the `service.name` resource attribute set per resourceSpans entry. */
const BY_SERVICE: TraceColorAccessor = colorByOtelAttribute('service.name');

/** OTel meta shape after `fromOtlp`: span-level `attributes`, `kind`, and a `resource` block. */
interface OtelMeta {
  attributes?: { key: string; value: unknown }[];
  resource?: { attributes?: { key: string; value: unknown }[] };
  kind?: number;
}

/** Reads an OTel attribute (span-level first, then resource-level), coerced to a display string. */
const readAttr = (datum: TraceDatum, key: string): string | undefined => {
  const meta = datum.meta as OtelMeta | undefined;
  const attr = meta?.attributes?.find((a) => a.key === key) ?? meta?.resource?.attributes?.find((a) => a.key === key);
  return attr === undefined ? undefined : anyValueToString(attr.value);
};

/** Maps an HTTP status code to a semantic badge color (2xx/3xx ok, 4xx warn, 5xx error). */
const statusColor = (code: number): TraceSpanBadge['color'] =>
  code >= 500 ? 'danger' : code >= 400 ? 'warning' : 'success';

/**
 * Derives Kibana-APM-style Span badges from OTel attributes (Spec 27): a language icon on each
 * service entry span, the HTTP method, a colored status code, the datastore system, and the total
 * duration. Returned by reference so events carry the caller's objects untouched.
 */
const OTLP_BADGES: TraceSpanBadgeAccessor = (datum) => {
  const badges: TraceSpanBadge[] = [];

  // Language icon on the service entry span (SERVER kind=2), from telemetry.sdk.language.
  const language = readAttr(datum, 'telemetry.sdk.language');
  const meta = datum.meta as OtelMeta | undefined;
  if (meta?.kind === 2 && language && LANGUAGE_BADGE_ICONS[language]) {
    const icon = LANGUAGE_BADGE_ICONS[language]!;
    badges.push({ id: 'lang', image: { src: icon.src }, ariaLabel: icon.label, text: icon.label, color: 'hollow' });
  }

  const method = readAttr(datum, 'http.method');
  if (method) badges.push({ id: 'method', text: method, color: 'hollow' });

  const status = readAttr(datum, 'http.response.status_code');
  if (status !== undefined) {
    const code = Number(status);
    badges.push({ id: 'status', text: status, color: Number.isNaN(code) ? 'default' : statusColor(code) });
  }

  const db = readAttr(datum, 'db.system');
  if (db) badges.push({ id: 'db', text: db, color: 'primary' });

  badges.push({
    id: 'duration',
    text: `${Math.round(datum.end - datum.start)} ms`,
    image: { src: DURATION_BADGE_ICON },
  });
  return badges;
};

/**
 * Pre-converted at module load: fromOtlp attaches resource.attributes to each span's meta.
 * activeSegments is set to the full span extent so each lane shows the total duration (Kibana
 * APM waterfall style) rather than self-time (the default when activeSegments is omitted).
 */
const DATA = fromOtlp(FRONTEND_WEB_OTLP_ENVELOPE).map((datum) => ({
  ...datum,
  activeSegments: [{ start: datum.start, end: datum.end }],
}));

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description} size={{ width: '100%', height: 350 }}>
    <Settings
      baseTheme={useBaseTheme()}
      theme={{
        trace: {
          // Inline mode: label on a row below the bar, gutter collapsed (Kibana APM style).
          labelPosition: 'inline',
          laneHeight: 40,
        },
      }}
    />
    <Trace
      id="trace_kibana"
      data={DATA}
      xScaleType="linear"
      colorBy={BY_SERVICE}
      badgeAccessor={OTLP_BADGES}
      onBadgeClick={action('onBadgeClick')}
      onBadgeOver={action('onBadgeOver')}
      onBadgeOut={action('onBadgeOut')}
    />
  </Chart>
);

Example.parameters = {
  markdown:
    'Real 4-service distributed trace from Kibana APM `frontend-web` service ' +
    '(`frontend-web → product-recommendation → inventory-service / user-preference-service`), ' +
    "200 ms total, colored by `service.name` via `colorByOtelAttribute('service.name')`. " +
    'Data is a faithful `OtlpEnvelope` extracted from ES ' +
    '(traceId `68822000000000000000000000080950`), converted by `fromOtlp()`.\n\n' +
    '**Span badges (Spec 27)** are derived from OTel attributes by `badgeAccessor`: a language icon ' +
    '(`telemetry.sdk.language`) on each service entry span, the HTTP method, a color-coded status ' +
    'code, the datastore system, and the total duration. Hover or click a badge to log ' +
    '`onBadgeOver` / `onBadgeOut` / `onBadgeClick` in the **Actions** panel.',
};
