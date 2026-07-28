/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import React from 'react';

import type { TraceDatum, TraceSpanBadge, TraceSpanBadgeAccessor } from '@elastic/charts';
import { Chart, Settings, Trace, fromOtlp } from '@elastic/charts';

import { FRONTEND_WEB_OTLP_ENVELOPE, LANGUAGE_BADGE_ICONS, DURATION_BADGE_ICON } from './data';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

/**
 * Coerces an OTLP `AnyValue` (or an already-flat scalar) to a display string. Consumer-side helper:
 * the library keeps its equivalent internal, so a consumer reading raw OTel attributes for badges
 * provides their own extraction (checking the well-known AnyValue keys in precedence order).
 */
function anyValueToString(value: unknown): string {
  if (value !== null && typeof value === 'object') {
    const v = value as Record<string, unknown>;
    if (typeof v.stringValue === 'string') return v.stringValue;
    if (typeof v.intValue === 'number') return String(v.intValue);
    if (typeof v.intValue === 'string') return v.intValue;
    if (typeof v.doubleValue === 'number') return String(v.doubleValue);
    if (typeof v.boolValue === 'boolean') return String(v.boolValue);
  }
  return String(value);
}

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
 * `spanDisplay="duration"` (below) renders each lane as a full-extent bar (Kibana APM waterfall
 * style) while self-time-derived active segments still drive selfTime/tooltip/SR (ADR 0035).
 */
const DATA = fromOtlp(FRONTEND_WEB_OTLP_ENVELOPE);

export const Example: ChartsStory = (_, { title, description }) => (
  <Chart title={title} description={description} size={{ width: '100%', height: 350 }}>
    <Settings
      baseTheme={useBaseTheme()}
      theme={{
        trace: {
          // Inline mode: label on a row below the bar, gutter collapsed (Kibana APM style).
          // laneHeight is auto-derived taller for inline mode, so no override is needed here.
          labelPosition: 'inline',
        },
      }}
      onElementClick={action('onElementClick')}
      onElementOver={action('onElementOver')}
      onElementOut={action('onElementOut')}
    />
    <Trace
      id="trace_kibana"
      data={DATA}
      xScaleType="linear"
      spanDisplay="duration"
      colorBy={{ otelAttribute: 'service.name' }}
      badgeAccessor={OTLP_BADGES}
    />
  </Chart>
);

Example.parameters = {
  markdown:
    'Real 4-service distributed trace from Kibana APM `frontend-web` service ' +
    '(`frontend-web → product-recommendation → inventory-service / user-preference-service`), ' +
    "200 ms total, colored by `service.name` via `colorBy={{ otelAttribute: 'service.name' }}`. " +
    'Data is a faithful `OtlpEnvelope` extracted from ES ' +
    '(traceId `68822000000000000000000000080950`), converted by `fromOtlp()`.\n\n' +
    '**Span badges (Spec 27)** are derived from OTel attributes by `badgeAccessor`: a language icon ' +
    '(`telemetry.sdk.language`) on each service entry span, the HTTP method, a color-coded status ' +
    'code, the datastore system, and the total duration. Hover or click a badge to log ' +
    '`onElementOver` / `onElementOut` / `onElementClick` (a `traceBadgeEvent`) in the **Actions** ' +
    'panel.\n\n' +
    '**Duration bars** — `spanDisplay="duration"` renders each lane as a full-extent color-group bar ' +
    '(the Kibana APM waterfall look). Self time is still derived internally, so tooltips and the ' +
    'screen-reader table report correct self time (ADR 0035).',
};
