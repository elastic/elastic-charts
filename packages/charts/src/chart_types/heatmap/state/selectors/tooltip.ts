/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { getPickedShapes } from './picked_shapes';
import { RGBATupleToString } from '../../../../common/color_library_wrappers';
import { Colors } from '../../../../common/colors';
import type { TooltipInfo } from '../../../../components/tooltip/types';
import { createCustomCachedSelector } from '../../../../state/create_selector';

const EMPTY_TOOLTIP = Object.freeze({
  header: null,
  values: [],
  disableActions: false,
});

/** @internal */
export const getTooltipInfoSelector = createCustomCachedSelector(
  [getHeatmapSpecSelector, getPickedShapes],
  (spec, pickedShapes): TooltipInfo => {
    if (!spec) {
      return EMPTY_TOOLTIP;
    }

    const tooltipInfo: TooltipInfo = {
      header: null,
      values: [],
      disableActions: false,
    };

    if (Array.isArray(pickedShapes)) {
      pickedShapes
        .filter(({ visible }) => visible)
        .forEach((shape) => {
          // X-axis value
          tooltipInfo.values.push({
            label: spec.xAxisLabelName,
            color: Colors.Transparent.keyword,
            isHighlighted: false,
            isVisible: true,
            seriesIdentifier: {
              specId: spec.id,
              key: spec.id,
            },
            value: `${shape.datum.x}`,
            formattedValue: spec.xAxisLabelFormatter(shape.datum.x),
            datum: shape.datum,
          });

          // Y-axis value
          tooltipInfo.values.push({
            label: spec.yAxisLabelName,
            color: Colors.Transparent.keyword,
            isHighlighted: false,
            isVisible: true,
            seriesIdentifier: {
              specId: spec.id,
              key: spec.id,
            },
            value: `${shape.datum.y}`,
            formattedValue: spec.yAxisLabelFormatter(shape.datum.y),
            datum: shape.datum,
          });

          // Cell value
          tooltipInfo.values.push({
            label: spec.name ?? spec.id,
            color: RGBATupleToString(shape.fill.color),
            isHighlighted: false,
            isVisible: true,
            seriesIdentifier: {
              specId: spec.id,
              key: spec.id,
            },
            value: `${shape.value}`,
            formattedValue: `${shape.formatted}`,
            datum: shape.datum,
            displayOnly: true,
          });
        });
    } else {
      tooltipInfo.values.push({
        label: '',
        color: Colors.Transparent.keyword,
        isHighlighted: false,
        isVisible: true,
        seriesIdentifier: {
          specId: spec.id,
          key: spec.id,
        },
        value: `${pickedShapes.value}`,
        formattedValue: `${pickedShapes.text}`,
        datum: pickedShapes.value,
        displayOnly: true,
      });
      tooltipInfo.disableActions = true;
    }

    return tooltipInfo;
  },
);
