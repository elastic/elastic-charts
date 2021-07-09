/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { TooltipSettings, isTooltipType, SettingsSpec } from '../../specs/settings';

/** @internal */
export function getTooltipSettings(settings: SettingsSpec, isExternalTooltipVisible: boolean): TooltipSettings {
  if (!isExternalTooltipVisible) {
    return settings.tooltip;
  }
  if (isTooltipType(settings.tooltip)) {
    return {
      type: settings.tooltip,
      ...settings.externalPointerEvents.tooltip,
    };
  }
  return {
    ...settings.tooltip,
    ...settings.externalPointerEvents.tooltip,
  };
}
