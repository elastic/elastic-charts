/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LayoutDirection } from './common';
import type { LegendPositionConfig } from '../specs/settings';

/** @internal */
export const isHorizontalLegend = (legendPosition: LegendPositionConfig) =>
  legendPosition.direction === LayoutDirection.Horizontal;

/** @internal */
export const isHierarchicalLegend = (flatLegend: boolean | undefined, legendPosition: LegendPositionConfig) =>
  !flatLegend && !isHorizontalLegend(legendPosition);
