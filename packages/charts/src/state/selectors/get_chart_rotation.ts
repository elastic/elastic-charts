/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getSettingsSpecSelector } from './get_settings_spec';
import type { Rotation } from '../../utils/common';
import { createCustomCachedSelector } from '../create_selector';

/** @internal */
export const getChartRotationSelector = createCustomCachedSelector(
  [getSettingsSpecSelector],
  (settingsSpec): Rotation => settingsSpec.rotation,
);
