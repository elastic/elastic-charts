/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Selector } from 'react-redux';

import type { TooltipAndHighlightedGeoms } from './get_tooltip_values_highlighted_geoms';
import { getHighlightedTooltipTooltipValuesSelector } from './get_tooltip_values_highlighted_geoms';
import { ChartType } from '../../..';
import type { SettingsSpec } from '../../../../specs';
import type { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import type { IndexedGeometry } from '../../../../utils/geometry';

interface Props {
  settings: SettingsSpec | undefined;
  highlightedGeometries: IndexedGeometry[];
}

const isOutElement = (prevProps: Props | null, nextProps: Props | null): boolean =>
  Boolean(
    prevProps &&
      nextProps?.settings?.onElementOut &&
      prevProps.highlightedGeometries.length > 0 &&
      nextProps.highlightedGeometries.length === 0,
  );

/**
 * Will call the onElementOut listener every time the following preconditions are met:
 * - the onElementOut listener is available
 * - the highlighted geometries list goes from a list of at least one object to an empty one
 * @internal
 */
export function createOnElementOutCaller(): (state: GlobalChartState) => void {
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

          if (isOutElement(prevProps, nextProps) && settings.onElementOut) {
            settings.onElementOut();
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
