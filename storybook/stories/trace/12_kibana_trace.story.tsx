/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { OtlpEnvelope, TraceColorAccessor } from '@elastic/charts';
import { Chart, Settings, Trace, colorByOtelAttribute, fromOtlp } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

/**
 * Real OtlpEnvelope fixture: each resourceSpans entry carries a `resource.attributes` block with
 * `service.name`. This exercises the new fromOtlp resource-attribute plumbing introduced in Spec 9
 * (flattenEnvelope now spreads `resource` onto each span so colorByOtelAttribute can resolve it).
 *
 * Topology: frontend → checkout → payments / inventory
 *           frontend → auth
 */
const ENVELOPE: OtlpEnvelope = {
  resourceSpans: [
    {
      resource: { attributes: [{ key: 'service.name', value: 'frontend' }] },
      scopeSpans: [
        {
          spans: [
            {
              spanId: 'fe-root',
              name: 'GET /checkout',
              traceId: 'trace1',
              startTimeUnixNano: '0',
              endTimeUnixNano: '1000000000',
              kind: 2,
              attributes: [{ key: 'http.method', value: 'GET' }],
            },
            {
              spanId: 'fe-auth',
              parentSpanId: 'fe-root',
              name: 'auth.validate',
              traceId: 'trace1',
              startTimeUnixNano: '10000000',
              endTimeUnixNano: '80000000',
              kind: 3,
            },
          ],
        },
      ],
    },
    {
      resource: { attributes: [{ key: 'service.name', value: 'checkout' }] },
      scopeSpans: [
        {
          spans: [
            {
              spanId: 'checkout-root',
              parentSpanId: 'fe-root',
              name: 'checkout.process',
              traceId: 'trace1',
              startTimeUnixNano: '100000000',
              endTimeUnixNano: '900000000',
              kind: 2,
              attributes: [{ key: 'checkout.currency', value: 'USD' }],
            },
            {
              spanId: 'checkout-validate',
              parentSpanId: 'checkout-root',
              name: 'cart.validate',
              traceId: 'trace1',
              startTimeUnixNano: '110000000',
              endTimeUnixNano: '250000000',
              kind: 1,
            },
          ],
        },
      ],
    },
    {
      resource: { attributes: [{ key: 'service.name', value: 'payments' }] },
      scopeSpans: [
        {
          spans: [
            {
              spanId: 'pay-charge',
              parentSpanId: 'checkout-root',
              name: 'payments.charge',
              traceId: 'trace1',
              startTimeUnixNano: '300000000',
              endTimeUnixNano: '750000000',
              kind: 2,
              attributes: [{ key: 'payment.provider', value: 'stripe' }],
            },
          ],
        },
      ],
    },
    {
      resource: { attributes: [{ key: 'service.name', value: 'inventory' }] },
      scopeSpans: [
        {
          spans: [
            {
              spanId: 'inv-reserve',
              parentSpanId: 'checkout-root',
              name: 'inventory.reserve',
              traceId: 'trace1',
              startTimeUnixNano: '260000000',
              endTimeUnixNano: '550000000',
              kind: 2,
              attributes: [{ key: 'sku.count', value: 3 }],
            },
          ],
        },
      ],
    },
  ],
};

/** Stable module-level accessor — groups by service.name (a resource attribute). */
const BY_SERVICE: TraceColorAccessor = colorByOtelAttribute('service.name');

/** Pre-converted: fromOtlp attaches resource.attributes to each span's meta. */
const DATA = fromOtlp(ENVELOPE);

export const Example: ChartsStory = (_, { title, description }) => {
  const theme = useBaseTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, fontFamily: 'sans-serif' }}>
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Spec 9 — Kibana execution-trace style</h2>
        <p style={{ margin: '0 0 8px', color: '#555', fontSize: 13 }}>
          4-service distributed trace (frontend → checkout → payments / inventory) colored by{' '}
          <code>service.name</code> via <code>colorByOtelAttribute('service.name')</code>. Data comes
          from a real <code>OtlpEnvelope</code> with <code>resource.attributes</code>, converted by{' '}
          <code>fromOtlp()</code> — this exercises the Spec 9 resource-attribute plumbing end-to-end.
        </p>
      </div>

      <Chart title={title} description={description} size={{ width: '100%', height: 350 }}>
        <Settings baseTheme={theme} />
        <Trace
          id="trace_kibana"
          data={DATA}
          xScaleType="linear"
          traceId="trace1"
          colorBy={BY_SERVICE}
        />
      </Chart>

      <p style={{ margin: 0, fontSize: 11, color: '#888' }}>
        7 spans · 4 services · OtlpEnvelope → fromOtlp() → colorByOtelAttribute('service.name')
      </p>
    </div>
  );
};

Example.parameters = {
  showHeader: true,
};
