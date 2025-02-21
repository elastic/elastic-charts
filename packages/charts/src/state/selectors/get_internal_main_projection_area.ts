/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getInternalChartStateSelector } from './get_internal_chart_state';
import { Dimensions, EMPTY_DIMENSIONS } from '../../utils/dimensions';
import { GlobalChartState } from '../chart_state';

/** @internal */
export const getInternalMainProjectionAreaSelector = (state: GlobalChartState): Dimensions =>
  getInternalChartStateSelector(state)?.getMainProjectionArea(state) ?? EMPTY_DIMENSIONS;
