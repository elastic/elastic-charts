import { getSettingsSpecSelector } from '../../../../store/selectors/get_settings_specs';
import createCachedSelector from 're-reselect';
import {
  getTooltipValuesAndGeometriesSelector,
  TooltipAndHighlightedGeoms,
} from './get_tooltip_values_highlighted_geoms';
import { createSelectorCreator, defaultMemoize } from 'reselect';
import { SettingsSpec } from 'specs';
import { equalityCheck, isSettingsSpec } from './caller_utils';

// We want to trigger an update only if the previous array contains elements and the current is empty
const highlightedGeomsEqualityCheck = (
  prevValue: TooltipAndHighlightedGeoms,
  currValue: TooltipAndHighlightedGeoms,
) => {
  return currValue.highlightedGeometries.length > 0 || prevValue.highlightedGeometries.length === 0;
};

// We want to trigger a recomputation only if we have a new onElementOut listener
const settingsEqualityCheck = (prevSettings: SettingsSpec, currentSettings: SettingsSpec) => {
  if (currentSettings.onElementOut && currentSettings.onElementOut !== prevSettings.onElementOut) {
    return false;
  }
  return true;
};

const onElementOutEqualityCheck = equalityCheck(isSettingsSpec, settingsEqualityCheck, highlightedGeomsEqualityCheck);

export const onElementOutListenerCaller = createCachedSelector(
  [getTooltipValuesAndGeometriesSelector, getSettingsSpecSelector],
  ({ highlightedGeometries }: TooltipAndHighlightedGeoms, settingsSpec: SettingsSpec): void => {
    if (
      // this avoids the triggering of the first computation because of an empty cache
      onElementOutListenerCaller.recomputations() > 1 &&
      settingsSpec.onElementOut &&
      highlightedGeometries.length === 0
    ) {
      settingsSpec.onElementOut();
    }
  },
)({
  keySelector: (state) => state.chartId,
  selectorCreator: createSelectorCreator<typeof onElementOutEqualityCheck>(
    // @ts-ignore-next-line see https://github.com/reduxjs/reselect/issues/384
    defaultMemoize,
    onElementOutEqualityCheck,
  ),
});
