/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { clamp } from '../../../../utils/common';
import { HeatmapStyle } from '../../../../utils/themes/theme';

/** @internal */
export function limitXAxisLabelRotation(rotation: HeatmapStyle['xAxisLabel']['rotation']) {
  return clamp(rotation, -90, 0);
}
