/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Shared data fixtures and generators for Trace viz stories.
 *
 * Only large (>15-line) or cross-story-reused fixtures live here.
 * Small single-use fixtures are kept inline in their story function.
 */

import type { OtelSpan, OtlpEnvelope, TraceDatum } from '@elastic/charts';

// ---------------------------------------------------------------------------
// EPOCH_BASE — shared anchor for stories with an x-scale knob
// ---------------------------------------------------------------------------

/**
 * Epoch-ms anchor used in stories with an x-scale (`linear` vs `time`) knob.
 *
 * **Why the x-scale knob requires traces longer than 1 s**
 *
 * `'linear'` labels elapsed ms from zero: "0ms … 10s".
 * `'time'` without an epoch offset labels wall-clock ms from 1970-01-01:
 *   at sub-second resolution the two scales produce identical labels, making
 *   the knob appear broken.
 *
 * The fix: use a trace that crosses at least one whole-second boundary (duration > 1 s),
 * and offset the span timestamps by EPOCH_BASE when `xScaleType='time'` so the raster
 * engine renders realistic wall-clock labels ("22:13:20 … 22:13:30").
 *
 * Stories with sub-second fixtures omit the x-scale knob entirely
 * (11_chrome_network, 12_kibana_trace, 13_segment_phases, 14_pinned_tooltip, 15_brush_zoom).
 */
export const EPOCH_BASE = 1_700_000_000_000; // 2023-11-14T22:13:20Z

// ---------------------------------------------------------------------------
// CHECKOUT_SPANS — 5-span 1000 ms checkout trace (stories 02, 03)
// ---------------------------------------------------------------------------

/**
 * Minimal checkout trace with parent/child nesting.
 * Used by self-time debug (02) and geometry debug (03).
 * Story 05 scales these ×10 for a 10 s trace.
 *
 * Shape:
 *   root (0–1000)
 *   ├── auth (100–350)
 *   └── db   (400–850)
 *       ├── cache (420–600)
 *       └── leaf  (700–820)
 */
export const CHECKOUT_SPANS: TraceDatum[] = [
  { id: 'root', name: 'HTTP GET /checkout', traceId: 't1', start: 0, end: 1000 },
  { id: 'auth', name: 'AuthService.validate', traceId: 't1', parentId: 'root', start: 100, end: 350 },
  { id: 'db', name: 'DB.query', traceId: 't1', parentId: 'root', start: 400, end: 850 },
  { id: 'cache', name: 'Cache.get', traceId: 't1', parentId: 'db', start: 420, end: 600 },
  { id: 'leaf', name: 'Serializer.encode', traceId: 't1', parentId: 'db', start: 700, end: 820 },
];

// ---------------------------------------------------------------------------
// CHECKOUT_WATERFALL — 16-span fixture (story 06)
// ---------------------------------------------------------------------------

/**
 * Expanded checkout waterfall with 16 spans (16 × 24 px = 384 px content height),
 * intentionally exceeding the ~268 px plot height so vertical lane-scroll is reachable.
 * Story 06 scales start/end ×10 at render time (via `SPAN_DURATION_SCALE = 10`).
 *
 * Shape (all values in ms, 0–1000 range pre-scale):
 *   root (0–1000)
 *   ├── tls      (10–95)
 *   ├── auth     (100–350)
 *   │   ├── token_refresh (110–200)
 *   │   └── jwt_verify    (210–290)
 *   ├── grpc     (300–395)
 *   ├── db       (400–850)
 *   │   ├── cache     (420–600)
 *   │   │   └── redis_get (430–510)
 *   │   ├── s3        (500–580)
 *   │   ├── cache_set (620–680)
 *   │   │   └── redis_set (625–665)
 *   │   └── leaf      (700–820)
 *   ├── extra1   (860–920)
 *   ├── logger   (820–860)
 *   └── metrics  (950–980)
 */
export const CHECKOUT_WATERFALL: TraceDatum[] = [
  { id: 'root', name: 'HTTP GET /checkout', traceId: 't1', start: 0, end: 1000 },
  { id: 'auth', name: 'AuthService.validate', traceId: 't1', parentId: 'root', start: 100, end: 350 },
  { id: 'db', name: 'DB.query', traceId: 't1', parentId: 'root', start: 400, end: 850 },
  { id: 'cache', name: 'Cache.get', traceId: 't1', parentId: 'db', start: 420, end: 600 },
  { id: 'leaf', name: 'Serializer.encode', traceId: 't1', parentId: 'db', start: 700, end: 820 },
  { id: 'extra1', name: 'Queue.enqueue', traceId: 't1', parentId: 'root', start: 860, end: 920 },
  { id: 'extra2', name: 'Cache.set', traceId: 't1', parentId: 'db', start: 620, end: 680 },
  { id: 'extra3', name: 'Auth.token_refresh', traceId: 't1', parentId: 'auth', start: 110, end: 200 },
  { id: 'extra4', name: 'Metrics.record', traceId: 't1', parentId: 'root', start: 950, end: 980 },
  { id: 'extra5', name: 'TLS.handshake', traceId: 't1', parentId: 'root', start: 10, end: 95 },
  { id: 'extra6', name: 'Logger.flush', traceId: 't1', parentId: 'root', start: 820, end: 860 },
  { id: 'extra7', name: 'Redis.get', traceId: 't1', parentId: 'cache', start: 430, end: 510 },
  { id: 'extra8', name: 'Redis.set', traceId: 't1', parentId: 'extra2', start: 625, end: 665 },
  { id: 'extra9', name: 'JWT.verify', traceId: 't1', parentId: 'auth', start: 210, end: 290 },
  { id: 'extra10', name: 'S3.getObject', traceId: 't1', parentId: 'db', start: 500, end: 580 },
  { id: 'extra11', name: 'gRPC.call', traceId: 't1', parentId: 'root', start: 300, end: 395 },
];

// ---------------------------------------------------------------------------
// A11Y_TRACE — 14-span fixture for story 16 (accessibility)
// ---------------------------------------------------------------------------

/**
 * Trace with activeSegments on every span, sized so content height (~14 × 24 px = 336 px)
 * exceeds the 240 px chart height, making ↑/↓/Home/End keyboard scroll meaningful.
 *
 * Shape:
 *   root (0–1000)
 *   ├── tls    (10–95)
 *   ├── auth   (100–350)  active: [100–200]
 *   │   └── jwt (110–190)
 *   ├── grpc   (300–395)
 *   ├── db     (400–850)  active: [400–450], [750–830]
 *   │   ├── cache    (420–600)
 *   │   │   └── redis-g (430–510)
 *   │   ├── s3       (500–580)
 *   │   ├── cache-s  (620–680)
 *   │   │   └── redis-s (625–665)
 *   │   └── serial   (700–820)
 *   ├── queue  (860–920)
 *   ├── logger (820–860)
 *   └── metrics(950–980)
 */
export const A11Y_TRACE: TraceDatum[] = [
  { id: 'root', name: 'GET /checkout', traceId: 't1', start: 0, end: 1000 },
  {
    id: 'tls',
    name: 'TLS.handshake',
    traceId: 't1',
    parentId: 'root',
    start: 10,
    end: 95,
    activeSegments: [{ start: 10, end: 95 }],
  },
  {
    id: 'auth',
    name: 'AuthService.validate',
    traceId: 't1',
    parentId: 'root',
    start: 100,
    end: 350,
    activeSegments: [{ start: 100, end: 200 }],
  },
  {
    id: 'jwt',
    name: 'JWT.verify',
    traceId: 't1',
    parentId: 'auth',
    start: 110,
    end: 190,
    activeSegments: [{ start: 110, end: 190 }],
  },
  {
    id: 'grpc',
    name: 'gRPC.call',
    traceId: 't1',
    parentId: 'root',
    start: 300,
    end: 395,
    activeSegments: [{ start: 300, end: 395 }],
  },
  {
    id: 'db',
    name: 'DB.query (read)',
    traceId: 't1',
    parentId: 'root',
    start: 400,
    end: 850,
    activeSegments: [
      { start: 400, end: 450 },
      { start: 750, end: 830 },
    ],
  },
  {
    id: 'cache',
    name: 'Cache.get',
    traceId: 't1',
    parentId: 'db',
    start: 420,
    end: 600,
    activeSegments: [{ start: 420, end: 600 }],
  },
  {
    id: 'redis-g',
    name: 'Redis.get',
    traceId: 't1',
    parentId: 'cache',
    start: 430,
    end: 510,
    activeSegments: [{ start: 430, end: 510 }],
  },
  {
    id: 's3',
    name: 'S3.getObject',
    traceId: 't1',
    parentId: 'db',
    start: 500,
    end: 580,
    activeSegments: [{ start: 500, end: 580 }],
  },
  {
    id: 'cache-s',
    name: 'Cache.set',
    traceId: 't1',
    parentId: 'db',
    start: 620,
    end: 680,
    activeSegments: [{ start: 620, end: 680 }],
  },
  {
    id: 'redis-s',
    name: 'Redis.set',
    traceId: 't1',
    parentId: 'cache-s',
    start: 625,
    end: 665,
    activeSegments: [{ start: 625, end: 665 }],
  },
  {
    id: 'serial',
    name: 'Serializer.encode',
    traceId: 't1',
    parentId: 'db',
    start: 700,
    end: 820,
    activeSegments: [{ start: 700, end: 820 }],
  },
  {
    id: 'queue',
    name: 'Queue.enqueue',
    traceId: 't1',
    parentId: 'root',
    start: 860,
    end: 920,
    activeSegments: [{ start: 860, end: 920 }],
  },
  {
    id: 'logger',
    name: 'Logger.flush',
    traceId: 't1',
    parentId: 'root',
    start: 820,
    end: 860,
    activeSegments: [{ start: 820, end: 860 }],
  },
  {
    id: 'metrics',
    name: 'Metrics.record',
    traceId: 't1',
    parentId: 'root',
    start: 950,
    end: 980,
    activeSegments: [{ start: 950, end: 980 }],
  },
];

// ---------------------------------------------------------------------------
// SELECTION_TRACE — 4-span order trace for segment selection (stories 17, 18)
// ---------------------------------------------------------------------------

/**
 * Order-API trace with explicit activeSegments on most spans to give the segment
 * selection feature visible active/waiting regions to click.
 *
 * Shape:
 *   root (0–1000)  active: [0–150 "init"], [750–1000 "finalize"]  → waiting gap between them
 *   ├── db    (200–700)  active: [200–300 "connect"], [350–500 "execute"], [600–700 "commit"]
 *   ├── cache (160–190)  active: [160–190]
 *   └── auth  (800–950)  no activeSegments → self-time derived
 */
export const SELECTION_TRACE: TraceDatum[] = [
  {
    id: 'root',
    name: 'GET /api/order',
    traceId: 't1',
    start: 0,
    end: 1000,
    activeSegments: [
      { start: 0, end: 150, label: 'init' },
      { start: 750, end: 1000, label: 'finalize' },
    ],
  },
  {
    id: 'db',
    name: 'DB.query',
    traceId: 't1',
    parentId: 'root',
    start: 200,
    end: 700,
    activeSegments: [
      { start: 200, end: 300, label: 'connect' },
      { start: 350, end: 500, label: 'execute' },
      { start: 600, end: 700, label: 'commit' },
    ],
  },
  {
    id: 'cache',
    name: 'Cache.get',
    traceId: 't1',
    parentId: 'root',
    start: 160,
    end: 190,
    activeSegments: [{ start: 160, end: 190 }],
  },
  {
    id: 'auth',
    name: 'AuthService.validate',
    traceId: 't1',
    parentId: 'root',
    start: 800,
    end: 950,
    // no activeSegments → self-time is derived from child coverage (none here → full self-time)
  },
];

// ---------------------------------------------------------------------------
// Chrome Network fixture (story 11)
// ---------------------------------------------------------------------------

/** Custom meta type for Chrome Network-style resource spans. */
export interface NetworkMeta {
  type: 'document' | 'script' | 'stylesheet' | 'image' | 'xhr' | 'font';
}

/**
 * Synthetic page-load waterfall with 12 spans mimicking Chrome DevTools Network panel.
 * Spans carry `meta: NetworkMeta` so a custom `TraceColorAccessor` can color by resource type.
 *
 * Shape (all in ms, root 0–850):
 *   nav (document, 0–850)
 *   ├── react (script, 60–280)
 *   ├── app   (script, 80–490)
 *   ├── main-css (stylesheet, 55–180)
 *   ├── fonts-css (stylesheet, 58–170)
 *   ├── inter      (font, 180–310)
 *   ├── inter-bold (font, 185–315)
 *   ├── logo (image, 200–260)
 *   ├── hero (image, 210–480)
 *   ├── api-user  (xhr, 500–640)
 *   ├── api-cart  (xhr, 510–700)
 *   └── api-promo (xhr, 520–820)
 */
export const CHROME_NETWORK_SPANS: TraceDatum[] = [
  { id: 'nav', name: 'index.html', start: 0, end: 850, meta: { type: 'document' } as NetworkMeta },
  {
    id: 'react',
    name: 'react.production.min.js',
    start: 60,
    end: 280,
    parentId: 'nav',
    meta: { type: 'script' } as NetworkMeta,
  },
  { id: 'app', name: 'app.bundle.js', start: 80, end: 490, parentId: 'nav', meta: { type: 'script' } as NetworkMeta },
  {
    id: 'main-css',
    name: 'main.css',
    start: 55,
    end: 180,
    parentId: 'nav',
    meta: { type: 'stylesheet' } as NetworkMeta,
  },
  {
    id: 'fonts-css',
    name: 'fonts.css',
    start: 58,
    end: 170,
    parentId: 'nav',
    meta: { type: 'stylesheet' } as NetworkMeta,
  },
  {
    id: 'inter',
    name: 'Inter-Regular.woff2',
    start: 180,
    end: 310,
    parentId: 'nav',
    meta: { type: 'font' } as NetworkMeta,
  },
  {
    id: 'inter-bold',
    name: 'Inter-Bold.woff2',
    start: 185,
    end: 315,
    parentId: 'nav',
    meta: { type: 'font' } as NetworkMeta,
  },
  { id: 'logo', name: 'logo.svg', start: 200, end: 260, parentId: 'nav', meta: { type: 'image' } as NetworkMeta },
  { id: 'hero', name: 'hero.webp', start: 210, end: 480, parentId: 'nav', meta: { type: 'image' } as NetworkMeta },
  { id: 'api-user', name: '/api/user', start: 500, end: 640, parentId: 'nav', meta: { type: 'xhr' } as NetworkMeta },
  { id: 'api-cart', name: '/api/cart', start: 510, end: 700, parentId: 'nav', meta: { type: 'xhr' } as NetworkMeta },
  { id: 'api-promo', name: '/api/promos', start: 520, end: 820, parentId: 'nav', meta: { type: 'xhr' } as NetworkMeta },
];

// ---------------------------------------------------------------------------
// FRONTEND_WEB_OTLP_ENVELOPE — real Kibana APM trace (story 12)
// ---------------------------------------------------------------------------

/**
 * OtlpEnvelope extracted from a real Kibana APM `frontend-web` trace
 * (traceId `68822000000000000000000000080950`, sampled 2026-07-16T14:28:20Z).
 * Used by story 12 to exercise `fromOtlp()` + `colorByOtelAttribute('service.name')`.
 *
 * Service topology (10 spans, 200 ms total):
 *   frontend-web → product-recommendation → inventory-service
 *                                         → user-preference-service
 *
 * Timing: absolute nanosecond epoch strings (µs × 1000).
 * Staggered starts reproduce the original waterfall:
 *   - GET /products/_search  starts 5 ms into its parent (GET /products in inventory-service)
 *   - SELECT * FROM products starts 30 ms into its parent
 *   - GET user:123           starts 5 ms into its parent (GET /preferences in user-pref-service)
 */
export const FRONTEND_WEB_OTLP_ENVELOPE: OtlpEnvelope = {
  resourceSpans: [
    // ── frontend-web (rum-js) ────────────────────────────────────────────────
    {
      resource: { attributes: [{ key: 'service.name', value: 'frontend-web' }] },
      scopeSpans: [
        {
          spans: [
            {
              spanId: '6882200000080949',
              name: 'GET /products',
              traceId: '68822000000000000000000000080950',
              startTimeUnixNano: '1784212100146000000',
              endTimeUnixNano: '1784212100346000000',
              kind: 2,
              attributes: [
                { key: 'http.method', value: 'GET' },
                { key: 'http.response.status_code', value: 200 },
                { key: 'http.url', value: 'elastic.co' },
              ],
            },
            {
              spanId: '6882200000080947',
              parentSpanId: '6882200000080949',
              name: 'GET /recommendations',
              traceId: '68822000000000000000000000080950',
              startTimeUnixNano: '1784212100146000000',
              endTimeUnixNano: '1784212100346000000',
              kind: 3,
            },
          ],
        },
      ],
    },
    // ── product-recommendation (go) ─────────────────────────────────────────
    {
      resource: { attributes: [{ key: 'service.name', value: 'product-recommendation' }] },
      scopeSpans: [
        {
          spans: [
            {
              spanId: '6882200000080945',
              parentSpanId: '6882200000080947',
              name: 'GET /recommendations',
              traceId: '68822000000000000000000000080950',
              startTimeUnixNano: '1784212100146000000',
              endTimeUnixNano: '1784212100296000000',
              kind: 2,
            },
            {
              spanId: '6882200000080941',
              parentSpanId: '6882200000080945',
              name: 'GET /products',
              traceId: '68822000000000000000000000080950',
              startTimeUnixNano: '1784212100146000000',
              endTimeUnixNano: '1784212100296000000',
              kind: 3,
            },
            {
              spanId: '6882200000080943',
              parentSpanId: '6882200000080945',
              name: 'GET /preferences',
              traceId: '68822000000000000000000000080950',
              startTimeUnixNano: '1784212100146000000',
              endTimeUnixNano: '1784212100221000000',
              kind: 3,
            },
          ],
        },
      ],
    },
    // ── inventory-service (nodejs) ───────────────────────────────────────────
    {
      resource: { attributes: [{ key: 'service.name', value: 'inventory-service' }] },
      scopeSpans: [
        {
          spans: [
            {
              spanId: '6882200000080935',
              parentSpanId: '6882200000080941',
              name: 'GET /products',
              traceId: '68822000000000000000000000080950',
              startTimeUnixNano: '1784212100146000000',
              endTimeUnixNano: '1784212100246000000',
              kind: 2,
            },
            {
              spanId: '6882200000080931',
              parentSpanId: '6882200000080935',
              name: 'GET /products/_search',
              traceId: '68822000000000000000000000080950',
              startTimeUnixNano: '1784212100151000000',
              endTimeUnixNano: '1784212100171000000',
              kind: 3,
              attributes: [{ key: 'db.system', value: 'elasticsearch' }],
            },
            {
              spanId: '6882200000080933',
              parentSpanId: '6882200000080935',
              name: 'SELECT * FROM products',
              traceId: '68822000000000000000000000080950',
              startTimeUnixNano: '1784212100176000000',
              endTimeUnixNano: '1784212100256000000',
              kind: 3,
              attributes: [
                { key: 'db.system', value: 'postgresql' },
                { key: 'db.statement', value: 'SELECT * FROM products' },
              ],
            },
          ],
        },
      ],
    },
    // ── user-preference-service (python) ────────────────────────────────────
    {
      resource: { attributes: [{ key: 'service.name', value: 'user-preference-service' }] },
      scopeSpans: [
        {
          spans: [
            {
              spanId: '6882200000080939',
              parentSpanId: '6882200000080943',
              name: 'GET /preferences',
              traceId: '68822000000000000000000000080950',
              startTimeUnixNano: '1784212100146000000',
              endTimeUnixNano: '1784212100171000000',
              kind: 2,
            },
            {
              spanId: '6882200000080937',
              parentSpanId: '6882200000080939',
              name: 'GET user:123',
              traceId: '68822000000000000000000000080950',
              startTimeUnixNano: '1784212100151000000',
              endTimeUnixNano: '1784212100166000000',
              kind: 3,
              attributes: [{ key: 'db.system', value: 'redis' }],
            },
          ],
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// OTEL_TOOLTIP_SPANS — 4-span OTel fixture for tooltip story (07)
// ---------------------------------------------------------------------------

/** Nanosecond offset to apply when xScaleType='time'. Derived from EPOCH_BASE. */
export const EPOCH_BASE_NS = BigInt(EPOCH_BASE) * 1_000_000n;

/**
 * Four OTel spans with `attributes` and `status` so the custom tooltip renders them.
 * Times in nanosecond strings (1 ms = 1 000 000 ns). Total duration: 1 s (0–1 000 000 000 ns).
 *
 * Shape:
 *   s1 HTTP GET /api/v1/data (0–1000 ms)
 *   ├── s2 DB.query users     (100–600 ms)  db.system=postgresql
 *   │   └── s4 Auth.verify_token (110–280 ms) auth.method=JWT
 *   └── s3 Cache.get session  (620–800 ms)  cache.hit=false  status: CACHE_MISS
 */
export const OTEL_TOOLTIP_SPANS: OtelSpan[] = [
  {
    spanId: 's1',
    name: 'HTTP GET /api/v1/data',
    traceId: 't1',
    startTimeUnixNano: '0',
    endTimeUnixNano: '1000000000',
    attributes: [
      { key: 'http.method', value: 'GET' },
      { key: 'http.url', value: '/api/v1/data' },
      { key: 'http.status_code', value: 200 },
    ],
    status: { code: 1, message: 'OK' },
  },
  {
    spanId: 's2',
    parentSpanId: 's1',
    name: 'DB.query users',
    traceId: 't1',
    startTimeUnixNano: '100000000',
    endTimeUnixNano: '600000000',
    attributes: [
      { key: 'db.system', value: 'postgresql' },
      { key: 'db.statement', value: 'SELECT * FROM users WHERE id = $1' },
    ],
    status: { code: 1 },
  },
  {
    spanId: 's3',
    parentSpanId: 's1',
    name: 'Cache.get session',
    traceId: 't1',
    startTimeUnixNano: '620000000',
    endTimeUnixNano: '800000000',
    attributes: [
      { key: 'cache.backend', value: 'redis' },
      { key: 'cache.hit', value: false },
    ],
    status: { code: 2, message: 'CACHE_MISS' },
  },
  {
    spanId: 's4',
    parentSpanId: 's2',
    name: 'Auth.verify_token',
    traceId: 't1',
    startTimeUnixNano: '110000000',
    endTimeUnixNano: '280000000',
    attributes: [{ key: 'auth.method', value: 'JWT' }],
    status: { code: 1 },
  },
];

// ---------------------------------------------------------------------------
// Large-N generator (story 09)
// ---------------------------------------------------------------------------

/**
 * Deterministic seeded LCG PRNG — no Math.random(), no Date.now().
 * Ensures VRT baselines are stable across runs.
 * Max product 1664525 × (2³²−1) ≈ 7.1e15 < Number.MAX_SAFE_INTEGER → no BigInt needed.
 */
export function seededRng(seed: number) {
  let s = seed >>> 0;
  return {
    next() {
      s = (1664525 * s + 1013904223) >>> 0;
      return s / 0x100000000;
    },
    int(lo: number, hi: number) {
      return lo + Math.floor(this.next() * (hi - lo + 1));
    },
    pick<T>(arr: readonly T[]): T {
      return arr[this.int(0, arr.length - 1)]!;
    },
  };
}

/**
 * Microservices service+operation catalogue for the large-N trace generator.
 * Each entry is [serviceName, operationNames[]].
 */
export const SERVICE_OPS: readonly [string, readonly string[]][] = [
  ['frontend', ['render', 'hydrate', 'prefetch']],
  ['api-gateway', ['auth', 'rate-limit', 'forward', 'transform']],
  ['auth-service', ['validate-token', 'refresh-token', 'check-permissions']],
  ['user-service', ['get-user', 'get-profile', 'update-session']],
  ['product-service', ['get-product', 'list-products', 'pricing']],
  ['inventory-service', ['check-stock', 'reserve', 'release']],
  ['order-service', ['create', 'validate', 'process', 'update']],
  ['payment-service', ['fraud-check', 'charge', 'confirm', 'refund']],
  ['notification-service', ['send-email', 'send-push', 'queue']],
  ['db-postgres', ['SELECT', 'INSERT', 'UPDATE', 'BEGIN', 'COMMIT']],
  ['cache-redis', ['GET', 'SET', 'DEL', 'HGET', 'EXPIRE']],
  ['search-service', ['query', 'rank', 'suggest', 'index']],
];

/**
 * Builds a realistic distributed-trace `TraceDatum[]` of approximately `targetSpans` spans.
 *
 * Root is `frontend — POST /api/checkout` over a 10 s domain. Each branch gets 2–15
 * children (wider near the root, narrower at depth), placed sequentially with small
 * self-time gaps so the self-time algorithm produces visible active segments.
 * Service and operation names are drawn from `SERVICE_OPS`.
 *
 * The seed is fixed at 42 for VRT stability; only span count changes with the knob.
 */
export function buildLargeTrace(targetSpans: number): TraceDatum[] {
  const rng = seededRng(42);
  const spans: TraceDatum[] = [];
  let counter = 0;

  function addSpan(parentId: string | undefined, svc: string, op: string, start: number, end: number): string {
    const id = `s${counter++}`;
    spans.push({ id, name: `${svc} — ${op}`, traceId: 'large-n', parentId, start, end });
    return id;
  }

  function populate(parentId: string, t0: number, t1: number, depth: number): void {
    if (spans.length >= targetSpans || depth > 7 || t1 - t0 < 2) return;
    const dur = t1 - t0;
    const maxChildren = depth === 0 ? 15 : depth <= 2 ? 8 : 4;
    const nChildren = rng.int(2, maxChildren);
    const selfHead = dur * (0.02 + rng.next() * 0.05);
    const available = dur - selfHead;
    const perSlot = available / nChildren;
    let cursor = t0 + selfHead;
    for (let i = 0; i < nChildren && spans.length < targetSpans; i++) {
      const [svc, ops] = rng.pick(SERVICE_OPS);
      const op = rng.pick(ops);
      const childDur = Math.max(1, perSlot * (0.4 + rng.next() * 0.9));
      const childEnd = Math.min(cursor + childDur, t1);
      if (childEnd <= cursor) {
        cursor += perSlot;
        continue;
      }
      const childId = addSpan(parentId, svc, op, cursor, childEnd);
      if (depth < 6 && rng.next() > 0.25) populate(childId, cursor, childEnd, depth + 1);
      cursor += perSlot;
    }
  }

  const rootId = addSpan(undefined, 'frontend', 'POST /api/checkout', 0, 10_000);
  populate(rootId, 0, 10_000, 0);
  return spans;
}
