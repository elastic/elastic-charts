/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ScaleType } from '../../../scales/constants';

/** @internal */
export const X_SCALE_DEFAULT = {
  type: ScaleType.Ordinal,
  nice: false,
  desiredTickCount: 10,
};

/** @internal */
export const Y_SCALE_DEFAULT = {
  type: ScaleType.Linear,
  nice: false,
  desiredTickCount: 5,
  constrainDomainPadding: undefined,
  domainPixelPadding: 0,
  logBase: undefined,
  logMinLimit: undefined,
};
