/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getActiveValue } from './get_active_value';
import { getBulletSpec } from './get_bullet_spec';
import { TooltipInfo } from '../../../components/tooltip';
import { createCustomCachedSelector } from '../../../state/create_selector';
import { isBetween, mergePartial } from '../../../utils/common';
import { BulletGraphSpec } from '../spec';

const defaultValueLabels: Required<BulletGraphSpec['valueLabels']> = {
  active: 'Active',
  value: 'Value',
  target: 'Target',
};

/** @internal */
export const getTooltipInfo = createCustomCachedSelector(
  [getActiveValue, getBulletSpec],
  (activeValue, spec): TooltipInfo | undefined => {
    if (!activeValue) return;

    const useHighlighter = false;
    const highlightMargin = 2;
    const valueLabels = mergePartial(defaultValueLabels, spec.valueLabels);

    const activeDatum = activeValue.panel.datum;
    const tooltipInfo: TooltipInfo = {
      header: null,
      values: [],
    };

    tooltipInfo.values.push({
      label: valueLabels.active,
      value: activeValue.value,
      color: activeValue.color,
      isHighlighted: false,
      seriesIdentifier: {
        specId: 'bullet',
        key: 'active',
      },
      isVisible: true,
      formattedValue: activeDatum.valueFormatter(activeValue.snapValue),
    });

    const isHighlighted = useHighlighter
      ? isBetween(activeValue.pixelValue - highlightMargin, activeValue.pixelValue + highlightMargin)
      : () => false;

    tooltipInfo.values.push({
      label: valueLabels.value,
      value: activeDatum.value,
      color: `${activeValue.panel.colorScale(activeDatum.value)}`,
      isHighlighted: isHighlighted(activeValue.panel.scale(activeDatum.value)),
      seriesIdentifier: {
        specId: 'bullet',
        key: 'value',
      },
      isVisible: true,
      formattedValue: activeDatum.valueFormatter(activeDatum.value),
    });

    if (activeDatum.target) {
      tooltipInfo.values.push({
        label: valueLabels.target,
        value: activeDatum.target,
        color: `${activeValue.panel.colorScale(activeDatum.target)}`,
        isHighlighted: isHighlighted(activeValue.panel.scale(activeDatum.target)),
        seriesIdentifier: {
          // TODO make this better
          specId: 'bullet',
          key: 'target',
        },
        isVisible: true,
        formattedValue: activeDatum.valueFormatter(activeDatum.target),
      });
    }

    return tooltipInfo;
  },
);
