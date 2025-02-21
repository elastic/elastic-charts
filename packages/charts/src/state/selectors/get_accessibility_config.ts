/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getChartIdSelector } from './get_chart_id';
import { getSettingsSpecSelector } from './get_settings_spec';
import { SettingsSpec } from '../../specs';
import { DEFAULT_SETTINGS_SPEC } from '../../specs/default_settings_spec';
import { isDefined } from '../../utils/common';
import { createCustomCachedSelector } from '../create_selector';

/** @internal */
export type A11ySettings = {
  label?: string;
  labelId?: string;
  labelHeadingLevel: SettingsSpec['ariaLabelHeadingLevel'];
  description?: string;
  descriptionId?: string;
  defaultSummaryId?: string;
  tableCaption?: string;
};

/** @internal */
export const DEFAULT_A11Y_SETTINGS: A11ySettings = {
  labelHeadingLevel: DEFAULT_SETTINGS_SPEC.ariaLabelHeadingLevel,
};

/** @internal */
export const getA11ySettingsSelector = createCustomCachedSelector(
  [getSettingsSpecSelector, getChartIdSelector],
  (
    {
      ariaDescription,
      ariaDescribedBy,
      ariaLabel,
      ariaLabelledBy,
      ariaUseDefaultSummary,
      ariaLabelHeadingLevel,
      ariaTableCaption,
    },
    chartId,
  ) => {
    const defaultSummaryId = ariaUseDefaultSummary ? `${chartId}--defaultSummary` : undefined;
    // use ariaDescribedBy if present, or create a description element if ariaDescription is present.
    // concat also if default summary id if requested
    const describeBy = [ariaDescribedBy ?? (ariaDescription && `${chartId}--desc`), defaultSummaryId].filter(isDefined);

    return {
      // don't render a label if a labelledBy id is provided
      label: ariaLabelledBy ? undefined : ariaLabel,
      // use ariaLabelledBy if present, or create an internal label if ariaLabel is present
      labelId: ariaLabelledBy ?? (ariaLabel && `${chartId}--label`),
      labelHeadingLevel: isValidHeadingLevel(ariaLabelHeadingLevel)
        ? ariaLabelHeadingLevel
        : DEFAULT_A11Y_SETTINGS.labelHeadingLevel,
      // don't use a description if ariaDescribedBy id is provided
      description: ariaDescribedBy ? undefined : ariaDescription,
      // concat all the ids
      descriptionId: describeBy.length > 0 ? describeBy.join(' ') : undefined,
      defaultSummaryId,
      tableCaption: ariaTableCaption,
    };
  },
);

function isValidHeadingLevel(ariaLabelHeadingLevel: SettingsSpec['ariaLabelHeadingLevel']): boolean {
  return ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].includes(ariaLabelHeadingLevel);
}
