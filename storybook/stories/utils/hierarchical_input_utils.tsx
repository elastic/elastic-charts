/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Datum } from '@elastic/charts';
import type { PrimitiveValue } from '@elastic/charts/src/chart_types/partition_chart/layout/utils/group_by_rollup';
import { mocks } from '@elastic/charts/src/mocks/hierarchical';

import { discreteColor } from './utils';

const raw = mocks.observabilityTree;

interface Node {
  c?: Node[];
  n: string;
  v: number;
}

type Row = { [layerKey: string]: unknown; value: number; depth: number };

const flatTree = ({ c, n, v }: Node, depth: number): Row[] => {
  if (!c) {
    return [{ [`layer_${depth}`]: n, value: v, depth }];
  }
  // as of writing this, the test runner can't run c.flatMap(...)
  const childrenRows = c.reduce<Row[]>((a, child) => [...a, ...flatTree(child, depth + 1)], []);
  const childrenTotal = childrenRows.reduce((p, { value }) => p + value, 0);
  const missing = Math.max(0, v - childrenTotal);
  if (missing > 0) {
    childrenRows.unshift({ [`layer_${depth + 1}`]: undefined, value: missing / 2, depth });
    childrenRows.push({ [`layer_${depth + 1}`]: undefined, value: missing / 2, depth });
  }
  childrenRows.forEach((innerChild) => {
    innerChild[`layer_${depth}`] = n;
  });
  return childrenRows;
};

/** @internal */
export const getFlatData = () => flatTree(raw, 0);

/** @internal */
export const maxDepth = getFlatData().reduce((p, n) => Math.max(p, n.depth), 0);

/** @internal */
export const getLayerSpec = (color: [string, string, string][]) =>
  [...new Array(maxDepth + 1)].map((_, depth) => ({
    groupByRollup: (d: Datum) => d[`layer_${depth}`],
    nodeLabel: (d: PrimitiveValue) => String(d),
    showAccessor: (d: PrimitiveValue) => d !== undefined,
    shape: {
      fillColor: () => discreteColor(color, 0.8)(depth),
    },
  }));
