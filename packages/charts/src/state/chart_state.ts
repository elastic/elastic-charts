/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { configureStore, createSlice } from '@reduxjs/toolkit';

import { onChartRendered } from './actions/chart';
import { updateParentDimensions, updateChartTitles } from './actions/chart_settings';
import { clearTemporaryColors, setTemporaryColor, setPersistedColor } from './actions/colors';
import { onExternalPointerEvent } from './actions/events';
import { onComputedZIndex } from './actions/z_index';
import type { ChartSliceState } from './chart_slice_state';
import { chartTypeFromSpecs } from './chart_type_from_specs';
import { getInitialState } from './get_initial_state';
import {
  handleKeyActions,
  handleMouseActions,
  handleLegendActions,
  handleDOMElementActions,
  handleTooltipActions,
} from './reducers/interactions';
import { getInitialPointerState } from './utils/get_initial_pointer_state';
import { getInitialTooltipState } from './utils/get_initial_tooltip_state';
import type { Color } from '../common/colors';
import { DEFAULT_SETTINGS_SPEC } from '../specs/default_settings_spec';
import { upsertSpec, removeSpec, specParsed, specUnmounted } from '../state/actions/specs';
import { deepEqual } from '../utils/fast_deep_equal';

export type { InteractionsState, TooltipInteractionState } from './interactions_state';
export type { BackwardRef } from './internal_chart_renderer';
export type { TooltipVisibility } from './tooltip_visibility';

const handleChartActions = (builder: ActionReducerMapBuilder<ChartSliceState>) => {
  builder.addCase(onChartRendered, (state) => {
    const chartRenderedCount = state.chartRendered ? state.chartRenderedCount : state.chartRenderedCount + 1;
    state.chartRendered = true;
    state.chartRenderedCount = chartRenderedCount;
  });
};

const handleChartSettingsActions = (builder: ActionReducerMapBuilder<ChartSliceState>) => {
  builder
    .addCase(updateParentDimensions, (state, action) => {
      if (deepEqual(action.payload, state.parentDimensions)) {
        return;
      }
      state.interactions.prevDrilldown = state.interactions.drilldown;
      state.interactions.tooltip = getInitialTooltipState();
      state.interactions.pointer.pinned = null;
      state.parentDimensions = action.payload;
      state.chartRendered = false;
    })
    .addCase(updateChartTitles, (state, action) => {
      state.title = action.payload.title;
      state.description = action.payload.description;
    });
};

const handleColorsActions = (builder: ActionReducerMapBuilder<ChartSliceState>) => {
  builder
    .addCase(clearTemporaryColors, (state) => {
      state.colors.temporary = {};
    })
    .addCase(setTemporaryColor, (state, action) => {
      state.colors.temporary = {
        ...state.colors.temporary,
        ...action.payload.keys.reduce<Record<string, Color | null>>((acc, curr) => {
          acc[curr] = action.payload.color;
          return acc;
        }, {}),
      };
    })
    .addCase(setPersistedColor, (state, action) => {
      state.colors.persisted = action.payload.keys.reduce<Record<string, Color>>((acc, curr) => {
        if (action.payload.color) {
          acc[curr] = action.payload.color;
        } else {
          delete acc[curr];
        }
        return acc;
      }, state.colors.persisted);
    });
};

const handleSpecsActions = (builder: ActionReducerMapBuilder<ChartSliceState>) => {
  builder
    .addCase(upsertSpec, (state, action) => {
      if (state.specParsing) {
        state.specs[action.payload.id] = action.payload;
      } else {
        state.specs = { [DEFAULT_SETTINGS_SPEC.id]: DEFAULT_SETTINGS_SPEC, [action.payload.id]: action.payload };
      }

      state.specsInitialized = false;
      state.chartRendered = false;
      state.specParsing = true;
    })
    .addCase(removeSpec, (state, action) => {
      const { [action.payload]: specToRemove, ...rest } = state.specs;
      state.specsInitialized = false;
      state.chartRendered = false;
      state.specParsing = false;
      state.specs = rest;
    })
    .addCase(specParsed, (state) => {
      state.specsInitialized = true;
      state.specParsing = false;

      const newChartType = chartTypeFromSpecs(state.specs);
      if (state.chartType === newChartType) return;
      state.chartType = newChartType;
    })
    .addCase(specUnmounted, (state) => {
      state.specsInitialized = false;
      state.chartRendered = false;
    });
};

const handleZIndexActions = (builder: ActionReducerMapBuilder<ChartSliceState>) => {
  builder.addCase(onComputedZIndex, (state, action) => {
    state.zIndex = action.payload;
  });
};

const handleEventsActions = (builder: ActionReducerMapBuilder<ChartSliceState>) => {
  builder.addCase(onExternalPointerEvent, (state, action) => {
    // discard events from self if any
    if (action.payload.chartId === state.chartId) {
      state.externalEvents.pointer = null;
      return;
    }

    state.externalEvents.pointer = action.payload;

    // clear pinned states when syncing external cursors
    state.interactions.pointer = getInitialPointerState();
    state.interactions.tooltip = getInitialTooltipState();
  });
};

const createChartSlice = (initialState: ChartSliceState) =>
  createSlice({
    name: 'chart',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      handleChartActions(builder);
      handleChartSettingsActions(builder);
      handleColorsActions(builder);
      handleEventsActions(builder);
      handleSpecsActions(builder);
      handleZIndexActions(builder);

      // interactions
      handleKeyActions(builder);
      handleMouseActions(builder);
      handleLegendActions(builder);
      handleDOMElementActions(builder);
      handleTooltipActions(builder);
    },
  });

/** @internal */
export const createChartStore = (chartId: string, title?: string, description?: string) => {
  const initialState = getInitialState(chartId, title, description);
  const chartSlice = createChartSlice(initialState);
  return configureStore({
    reducer: chartSlice.reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // TODO https://github.com/elastic/elastic-charts/issues/2078
        serializableCheck: false,
      }),
  });
};

/**
 * Infer the `GlobalChartState` from the store itself
 * @internal
 */
export type GlobalChartState = ReturnType<ReturnType<typeof createChartStore>['getState']>;
