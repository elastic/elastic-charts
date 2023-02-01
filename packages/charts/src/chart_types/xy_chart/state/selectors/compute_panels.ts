/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeSmallMultipleScalesSelector } from './compute_small_multiple_scales';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { Size } from '../../../../utils/dimensions';
import { getPanelSize } from '../../utils/panel';
import { PerPanelMap, getPerPanelMap } from '../../utils/panel_utils';

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
