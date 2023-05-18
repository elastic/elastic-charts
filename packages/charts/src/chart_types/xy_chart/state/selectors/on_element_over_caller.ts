/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Selector } from 'react-redux';

import {
  getHighlightedTooltipTooltipValuesSelector,
  TooltipAndHighlightedGeoms,
} from './get_tooltip_values_highlighted_geoms';
import { ChartType } from '../../..';
import { SettingsSpec } from '../../../../specs';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { IndexedGeometry, GeometryValue } from '../../../../utils/geometry';
import { XYChartSeriesIdentifier } from '../../utils/series';

interface Props {
  settings: SettingsSpec | undefined;
  highlightedGeometries: IndexedGeometry[];
}

function isOverElement(prevProps: Props | null, nextProps: Props | null) {
  if (!nextProps || !nextProps.settings || !nextProps.settings.onElementOver) {
    return false;
  }
  const { highlightedGeometries: nextGeomValues } = nextProps;
  const prevGeomValues = prevProps?.highlightedGeometries ?? [];
  return (
    nextGeomValues.length > 0 &&
    (nextGeomValues.length !== prevGeomValues.length ||
      !nextGeomValues.every(({ value: next }, index) => {
        const prev = prevGeomValues[index]?.value;
        return prev && prev.x === next.x && prev.y === next.y && prev.accessor === next.accessor;
      }))
  );
}

/**
 * Will call the onElementOver listener every time the following preconditions are met:
 * - the onElementOver listener is available
 * - we have a new set of highlighted geometries on our state
 * @internal
 */
export function createOnElementOverCaller(): (state: GlobalChartState) => void {
  let prevProps: Props | null = null;
  let selector: Selector<GlobalChartState, void> | null = null;
  return (state: GlobalChartState) => {
    if (selector === null && state.chartType === ChartType.XYAxis) {
      selector = createCustomCachedSelector(
        [getHighlightedTooltipTooltipValuesSelector, getSettingsSpecSelector],
        ({ highlightedGeometries }: TooltipAndHighlightedGeoms, settings: SettingsSpec): void => {
          const nextProps = {
            settings,
            highlightedGeometries,
          };

          if (isOverElement(prevProps, nextProps) && settings.onElementOver) {
            const elements = highlightedGeometries.map<[GeometryValue, XYChartSeriesIdentifier]>(
              ({ value, seriesIdentifier }) => [value, seriesIdentifier],
            );
            settings.onElementOver(elements);
          }
          prevProps = nextProps;
        },
      );
    }
    if (selector) {
      selector(state);
    }
  };
}
