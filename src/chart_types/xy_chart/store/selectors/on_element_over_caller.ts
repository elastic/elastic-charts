import { getSettingsSpecSelector } from '../../../../store/selectors/get_settings_specs';
import createCachedSelector from 're-reselect';
import {
  getTooltipValuesAndGeometriesSelector,
  TooltipAndHighlightedGeoms,
} from './get_tooltip_values_highlighted_geoms';
import { createSelectorCreator, defaultMemoize } from 'reselect';
import { SettingsSpec } from '../../../../specs';
import { equalityCheck, isSettingsSpec } from './caller_utils';

const highlightedGeomsEqualityCheck = (
  prevValue: TooltipAndHighlightedGeoms,
  currValue: TooltipAndHighlightedGeoms,
) => {
  if (currValue.highlightedGeometries.length !== prevValue.highlightedGeometries.length) {
    return false;
  }
  const length = currValue.highlightedGeometries.length;
  for (let i = 0; i < length; i++) {
    if (
      currValue.highlightedGeometries[i].value.x !== prevValue.highlightedGeometries[i].value.x ||
      currValue.highlightedGeometries[i].value.y !== prevValue.highlightedGeometries[i].value.y ||
      currValue.highlightedGeometries[i].value.accessor !== prevValue.highlightedGeometries[i].value.accessor
    ) {
      return false;
    }
  }
  return true;
};
const settingsEqualityCheck = (prevSettings: SettingsSpec, currentSettings: SettingsSpec) => {
  if (currentSettings.onElementOver !== prevSettings.onElementOver) {
    return false;
  }
  return true;
};

const onElementOverEqualityCheck = equalityCheck(isSettingsSpec, settingsEqualityCheck, highlightedGeomsEqualityCheck);

export const onElementOverListenerCaller = createCachedSelector(
  [getTooltipValuesAndGeometriesSelector, getSettingsSpecSelector],
  ({ highlightedGeometries }: TooltipAndHighlightedGeoms, settingsSpec: SettingsSpec): void => {
    if (settingsSpec.onElementOver && highlightedGeometries.length > 0) {
      settingsSpec.onElementOver(highlightedGeometries.map((d) => d.value));
    }
  },
)({
  keySelector: (state) => state.chartId,
  selectorCreator: createSelectorCreator<typeof onElementOverEqualityCheck>(
    // @ts-ignore-next-line see https://github.com/reduxjs/reselect/issues/384
    defaultMemoize,
    onElementOverEqualityCheck,
  ),
});
