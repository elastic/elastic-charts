/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeSmallMultipleScalesSelector } from './compute_small_multiple_scales';
import type { PerPanelMap } from '../../common/panel_utils';
import { getPanelSize, getPerPanelMap } from '../../common/panel_utils';
import type { Size } from '../../utils/dimensions';
import { createCustomCachedSelector } from '../create_selector';

/** @internal */
export type PanelGeoms = Array<Size & PerPanelMap>;

/** @internal */
export const computePanelsSelectors = createCustomCachedSelector(
  [computeSmallMultipleScalesSelector],
  (scales): PanelGeoms => {
    const panelSize = getPanelSize(scales);
    return getPerPanelMap(scales, () => panelSize);
  },
);
