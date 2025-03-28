/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ScaleBand } from '../../scales';
import type { RelativeBandsPadding } from '../../specs';
import { DEFAULT_SM_PANEL_PADDING } from '../../specs';
import type { OrdinalDomain } from '../../utils/domain';

/**
 * @internal
 */
export function getSmallMultiplesScale(
  domain: OrdinalDomain,
  maxRange: number,
  padding: RelativeBandsPadding = DEFAULT_SM_PANEL_PADDING,
): ScaleBand {
  const singlePanelSmallMultiple = domain.length <= 1;
  return new ScaleBand(domain, [0, maxRange], undefined, singlePanelSmallMultiple ? 0 : padding);
}
