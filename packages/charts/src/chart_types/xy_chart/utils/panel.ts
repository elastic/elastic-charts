/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Size } from '../../../utils/dimensions';
import { SmallMultipleScales } from '../state/selectors/compute_small_multiple_scales';

/** @internal */
export function getPanelSize({ horizontal, vertical }: SmallMultipleScales): Size {
  return { width: horizontal.bandwidth, height: vertical.bandwidth };
}

/** @internal */
export const hasSMDomain = ({ domain }: SmallMultipleScales['horizontal'] | SmallMultipleScales['vertical']) =>
  domain.length > 0 && domain[0] !== undefined;
