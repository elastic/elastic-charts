/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getSettingsSpecSelector } from './get_settings_spec';
import { getSpecs } from './get_specs';
import { ChartType } from '../../chart_types';
import { SpecType } from '../../specs/constants';
import { DEFAULT_TOOLTIP_SPEC, TooltipProps, TooltipSettings, TooltipSpec } from '../../specs/tooltip';
import { mergePartial } from '../../utils/common';
import { createCustomCachedSelector } from '../create_selector';
import { getSpecsFromStore } from '../utils';

/**
 * @internal
 */
export const getTooltipSpecSelector = createCustomCachedSelector(
  [getSpecs, getSettingsSpecSelector],
  (specs, settings): TooltipSpec => {
    if (settings.tooltip) {
      const legacyProps = isTooltipProps(settings.tooltip) ? settings.tooltip : { type: settings.tooltip };
      // @ts-ignore - nesting limitation
      return mergePartial(DEFAULT_TOOLTIP_SPEC, legacyProps);
    }

    const [tooltipSpec] = getSpecsFromStore<TooltipSpec>(specs, ChartType.Global, SpecType.Tooltip);
    return tooltipSpec ?? DEFAULT_TOOLTIP_SPEC;
  },
);

function isTooltipProps(tooltipSettings: TooltipSettings): tooltipSettings is TooltipProps {
  return typeof tooltipSettings !== 'string';
}
