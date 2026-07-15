/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useMemo } from 'react';

import type { TraceDatum } from '@elastic/charts';
import { Chart, Settings, Trace } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

// ---------------------------------------------------------------------------
// Deterministic seeded PRNG (LCG) — no Math.random(), no Date.now().
// Ensures VRT baselines are stable across runs.
// Max product 1664525 × (2³² − 1) ≈ 7.1e15 < Number.MAX_SAFE_INTEGER, so
// regular JS multiplication is exact; no BigInt needed.
// ---------------------------------------------------------------------------
function seededRng(seed: number) {
  let s = seed >>> 0;
  return {
    next() {
      s = (1664525 * s + 1013904223) >>> 0;
      return s / 0x100000000; // [0, 1)
    },
    int(lo: number, hi: number) {
      return lo + Math.floor(this.next() * (hi - lo + 1));
    },
    pick<T>(arr: readonly T[]): T {
      // int() is range-bounded to [0, arr.length-1], so the element always exists.
      return arr[this.int(0, arr.length - 1)]!;
    },
  };
}

// ---------------------------------------------------------------------------
// Service + operation catalogue — models a realistic microservices checkout.
// ---------------------------------------------------------------------------
const SERVICE_OPS: readonly [string, readonly string[]][] = [
  ['frontend',            ['render', 'hydrate', 'prefetch']],
  ['api-gateway',         ['auth', 'rate-limit', 'forward', 'transform']],
  ['auth-service',        ['validate-token', 'refresh-token', 'check-permissions']],
  ['user-service',        ['get-user', 'get-profile', 'update-session']],
  ['product-service',     ['get-product', 'list-products', 'pricing']],
  ['inventory-service',   ['check-stock', 'reserve', 'release']],
  ['order-service',       ['create', 'validate', 'process', 'update']],
  ['payment-service',     ['fraud-check', 'charge', 'confirm', 'refund']],
  ['notification-service',['send-email', 'send-push', 'queue']],
  ['db-postgres',         ['SELECT', 'INSERT', 'UPDATE', 'BEGIN', 'COMMIT']],
  ['cache-redis',         ['GET', 'SET', 'DEL', 'HGET', 'EXPIRE']],
  ['search-service',      ['query', 'rank', 'suggest', 'index']],
];

// ---------------------------------------------------------------------------
// Trace builder — recursive tree that fills to TARGET_SPANS.
// ---------------------------------------------------------------------------
const TARGET_SPANS = 5_000;

/**
 * Builds a realistic distributed-trace TraceDatum[] of ~TARGET_SPANS spans.
 *
 * Structure: a root "POST /checkout" span; each branch gets 2–15 children
 * (more near the root, fewer at depth), placed sequentially with small self-time
 * gaps so the self-time algorithm produces visible active segments. Service and
 * operation names are chosen from SERVICE_OPS at each node.
 */
function buildTrace(): TraceDatum[] {
  const rng = seededRng(42);
  const spans: TraceDatum[] = [];
  let counter = 0;

  function addSpan(parentId: string | undefined, svc: string, op: string, start: number, end: number): string {
    const id = `s${counter++}`;
    spans.push({ id, name: `${svc} — ${op}`, traceId: 'large-n', parentId, start, end });
    return id;
  }

  function populate(parentId: string, t0: number, t1: number, depth: number): void {
    if (spans.length >= TARGET_SPANS || depth > 7 || t1 - t0 < 2) return;
    const dur = t1 - t0;

    // Wide at the root, narrower as we go deeper.
    const maxChildren = depth === 0 ? 15 : depth <= 2 ? 8 : 4;
    const nChildren = rng.int(2, maxChildren);

    // Leave a small self-time head so the parent has an active segment at its start.
    const selfHead = dur * (0.02 + rng.next() * 0.05);
    const available = dur - selfHead;
    const perSlot = available / nChildren;

    let cursor = t0 + selfHead;

    for (let i = 0; i < nChildren && spans.length < TARGET_SPANS; i++) {
      const [svc, ops] = rng.pick(SERVICE_OPS);
      const op = rng.pick(ops);

      // Children vary in duration: 40 %–130 % of their slot.
      const childDur = Math.max(1, perSlot * (0.4 + rng.next() * 0.9));
      const childEnd = Math.min(cursor + childDur, t1);
      if (childEnd <= cursor) { cursor += perSlot; continue; }

      const childId = addSpan(parentId, svc, op, cursor, childEnd);

      // Recurse on 75 % of children (fewer at depth > 5 to keep the tree finite).
      if (depth < 6 && rng.next() > 0.25) {
        populate(childId, cursor, childEnd, depth + 1);
      }

      // Small gap after each child (self-time for the parent between calls).
      cursor += perSlot;
    }
  }

  const rootId = addSpan(undefined, 'frontend', 'POST /api/checkout', 0, 10_000);
  populate(rootId, 0, 10_000, 0);
  return spans;
}

export const Example: ChartsStory = (_, { title, description }) => {
  const theme = useBaseTheme();
  const data: TraceDatum[] = useMemo(() => buildTrace(), []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, fontFamily: 'sans-serif' }}>
      <div>
        <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Spec 8 — Large-N performance gate</h2>
        <p style={{ margin: '0 0 8px', color: '#555', fontSize: 13 }}>
          ~{TARGET_SPANS.toLocaleString()} spans modelling a realistic microservices checkout trace
          (frontend → api-gateway → auth/user/product/inventory/order/payment/notification, plus DB and
          cache leaves). Pan (drag), zoom (wheel), and vertical scroll must stay responsive via viewport
          culling — the draw loop only visits the visible lanes per frame. ADR 0001&apos;s WebGL seam is
          the fallback if this regresses.
        </p>
      </div>

      <Chart title={title} description={description} size={{ width: '100%', height: 300 }}>
        <Settings baseTheme={theme} />
        <Trace id="trace_large_n" data={data} xScaleType="linear" />
      </Chart>

      <p style={{ margin: 0, fontSize: 11, color: '#888' }}>
        Simple format · ~{TARGET_SPANS.toLocaleString()} spans · seeded PRNG (deterministic, VRT-stable) ·
        culling regression guard in <code>canvas2d_renderer.test.ts</code>
      </p>
    </div>
  );
};

Example.parameters = {
  showHeader: true,
};
