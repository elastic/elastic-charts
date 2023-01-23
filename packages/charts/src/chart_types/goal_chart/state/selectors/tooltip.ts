/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getSpecOrNull } from './goal_spec';
import { getPickedShapes } from './picked_shapes';
import { Colors } from '../../../../common/colors';
import { TooltipInfo } from '../../../../components/tooltip/types';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { BandViewModel } from '../../layout/types/viewmodel_types';

const EMPTY_TOOLTIP = Object.freeze({
  header: null,
  values: [],
});

const getBandColor = (value: number, bands: BandViewModel[]) =>
  bands.find(({ value: v }) => {
    return v >= value;
  })?.fillColor ?? Colors.White.keyword;

/** @internal */
export const getTooltipInfoSelector = createCustomCachedSelector(
  [getSpecOrNull, getPickedShapes],
  (spec, pickedShapes): TooltipInfo => {
    if (!spec) {
      return EMPTY_TOOLTIP;
    }
    const { tooltipValueFormatter, id } = spec;

    const tooltipInfo: TooltipInfo = {
      header: null,
      values: [],
    };

    pickedShapes.forEach(({ actual: value, bands }) => {
      tooltipInfo.values.push({
        label: 'Actual',
        color: getBandColor(value, bands),
        isHighlighted: false,
        isVisible: true,
        seriesIdentifier: {
          specId: id,
          key: id,
        },
        value,
        formattedValue: tooltipValueFormatter(value),
        datum: value,
      });
    });

    return tooltipInfo;
  },
);
