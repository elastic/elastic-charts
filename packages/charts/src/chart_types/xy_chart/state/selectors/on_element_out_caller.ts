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
import { SettingsSpec } from '../../../../specs/settings';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { GlobalChartState } from '../../../../state/global_chart_state';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { IndexedGeometry } from '../../../../utils/geometry';
import { ChartType } from '../../../chart_type';

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
