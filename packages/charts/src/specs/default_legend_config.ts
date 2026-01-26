/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LegendLayout, Position } from '../utils/common';

/**
 * Default legend config
 * @internal
 */
export const DEFAULT_LEGEND_CONFIG = {
  showLegend: false,
  legendSize: NaN,
  legendValues: [],
  legendMaxDepth: Infinity,
  legendPosition: Position.Right,
  legendLayout: LegendLayout.List,
  flatLegend: false,
};
