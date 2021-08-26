/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Colors } from '../../../../common/color';
import { RGBtoString } from '../../../../common/color_library_wrappers';
import { TooltipInfo } from '../../../../components/tooltip/types';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getHeatmapConfigSelector } from './get_heatmap_config';
import { getSpecOrNull } from './heatmap_spec';
import { getPickedShapes } from './picked_shapes';

const EMPTY_TOOLTIP = Object.freeze({
  header: null,
  values: [],
});

/** @internal */
export const getTooltipInfoSelector = createCustomCachedSelector(
  [getSpecOrNull, getHeatmapConfigSelector, getPickedShapes],
  (spec, config, pickedShapes): TooltipInfo => {
    if (!spec) {
      return EMPTY_TOOLTIP;
    }

    const tooltipInfo: TooltipInfo = {
      header: null,
      values: [],
    };

    if (Array.isArray(pickedShapes)) {
      pickedShapes
        .filter(({ visible }) => visible)
        .forEach((shape) => {
          // X-axis value
          tooltipInfo.values.push({
            label: config.xAxisLabel.name,
            color: Colors.Transparent.rgba,
            isHighlighted: false,
            isVisible: true,
            seriesIdentifier: {
              specId: spec.id,
              key: spec.id,
            },
            value: `${shape.datum.x}`,
            formattedValue: config.xAxisLabel.formatter(shape.datum.x),
            datum: shape.datum,
          });

          // Y-axis value
          tooltipInfo.values.push({
            label: config.yAxisLabel.name,
            color: Colors.Transparent.rgba,
            isHighlighted: false,
            isVisible: true,
            seriesIdentifier: {
              specId: spec.id,
              key: spec.id,
            },
            value: `${shape.datum.y}`,
            formattedValue: config.yAxisLabel.formatter(shape.datum.y),
            datum: shape.datum,
          });

          // Cell value
          tooltipInfo.values.push({
            label: spec.name ?? spec.id,
            color: RGBtoString(shape.fill.color),
            isHighlighted: false,
            isVisible: true,
            seriesIdentifier: {
              specId: spec.id,
              key: spec.id,
            },
            value: `${shape.value}`,
            formattedValue: `${shape.formatted}`,
            datum: shape.datum,
          });
        });
    } else {
      tooltipInfo.values.push({
        label: ``,
        color: Colors.Transparent.rgba,
        isHighlighted: false,
        isVisible: true,
        seriesIdentifier: {
          specId: spec.id,
          key: spec.id,
        },
        value: `${pickedShapes.value}`,
        formattedValue: `${pickedShapes.value}`,
        datum: pickedShapes.value,
      });
    }

    return tooltipInfo;
  },
);
