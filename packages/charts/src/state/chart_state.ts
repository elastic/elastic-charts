/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { configureStore, createSlice, ActionReducerMapBuilder, PayloadAction } from '@reduxjs/toolkit';

import { onChartRendered } from './actions/chart';
import { updateParentDimensions, updateChartTitles } from './actions/chart_settings';
import { clearTemporaryColors, setTemporaryColor, setPersistedColor } from './actions/colors';
import { onExternalPointerEvent } from './actions/events';
import { onComputedZIndex } from './actions/z_index';
import { ChartSliceState } from './chart_slice_state';
import { chartTypeFromSpecs } from './chart_type_from_specs';
import { getInitialState } from './get_initial_state';
import { newInternalState } from './new_internal_state';
import {
  handleKeyActions,
  handleMouseActions,
  handleLegendActions,
  handleDOMElementActions,
  handleTooltipActions,
} from './reducers/interactions';
import { getInitialPointerState } from './utils/get_initial_pointer_state';
import { getInitialTooltipState } from './utils/get_initial_tooltip_state';
import { Color } from '../common/colors';
import { DEFAULT_SETTINGS_SPEC } from '../specs/default_settings_spec';
import { upsertSpec, removeSpec, specParsed, specUnmounted } from '../state/actions/specs';
import { deepEqual } from '../utils/fast_deep_equal';

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
      state.specsInitialized = false;
      state.chartRendered = false;
      state.specParsing = true;
      state.specs = state.specParsing
        ? { ...state.specs, [action.payload.id]: action.payload }
        : { [DEFAULT_SETTINGS_SPEC.id]: DEFAULT_SETTINGS_SPEC, [action.payload.id]: action.payload };
      return state;
    })
    .addCase(removeSpec, (state, action) => {
      const { [action.payload]: specToRemove, ...rest } = state.specs;
      state.specsInitialized = false;
      state.chartRendered = false;
      state.specParsing = false;
      state.specs = {
        ...rest,
      };
    })
    .addCase(specParsed, (state) => {
      const newChartType = chartTypeFromSpecs(state.specs);

      state.specsInitialized = true;
      state.specParsing = false;
      state.internalChartState =
        state.chartType === newChartType ? state.internalChartState : newInternalState(newChartType);
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

/** @internal */
export const chartSlice = createSlice({
  name: 'chart',
  initialState: getInitialState('not-initialized'),
  reducers: {
    initialize(state, action: PayloadAction<{ id: string; title?: string; description?: string }>) {
      return getInitialState(action.payload.id, action.payload.title, action.payload.description);
    },
  },
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
export const { initialize } = chartSlice.actions;

/** @internal */
export const chartStore = configureStore({
  reducer: chartSlice.reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // TODO https://github.com/elastic/elastic-charts/issues/2078
      serializableCheck: false,
    }),
});

// Infer the `GlobalChartState` and `AppDispatch` types from the store itself

/**
 * Inferred state type
 * @internal
 */
export type GlobalChartState = ReturnType<typeof chartStore.getState>;

/**
 * Inferred dispatch type: Dispatch & ThunkDispatch<RootState, undefined, UnknownAction>
 * @internal
 */
export type AppDispatch = typeof chartStore.dispatch;
