/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { manyPieMock } from './many_pie';
import { miniSunburstMock } from './mini_sunburst';
import { observabilityTreeMock } from './observability_tree';
import { pieMock } from './pie';
import { sunburstMock } from './sunburst';

/** @internal */
export const mocks = {
  pie: pieMock,
  sunburst: sunburstMock,
  miniSunburst: miniSunburstMock,
  manyPie: manyPieMock,
  observabilityTree: observabilityTreeMock,
};
