import createCachedSelector from 're-reselect';
import { Selector } from 'reselect';
import { GlobalChartState, PointerState } from '../../../../state/chart_state';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { getHighlightedGeomsSelector } from './get_tooltip_values_highlighted_geoms';
import { SettingsSpec } from '../../../../specs';
import { IndexedGeometry } from '../../../../utils/geometry';
import { ChartTypes } from '../../../index';

const getPointerSelector = (state: GlobalChartState) => state.interactions.pointer;

interface Props {
  settings: SettingsSpec | undefined;
  pointer: PointerState;
  indexedGeometries: IndexedGeometry[];
}

function isClicking(prevProps: Props | null, nextProps: Props | null) {
  if (nextProps === null) {
    return false;
  }
  if (!nextProps.settings || !nextProps.settings.onElementClick || nextProps.indexedGeometries.length === 0) {
    return false;
  }
  const prevPointerUp = prevProps !== null ? prevProps.pointer.up : null;

  if (prevPointerUp === null && nextProps.pointer.up !== null) {
    return true;
  }
  return false;
}

/**
 * Will call the onElementClick listener every time the following preconditions are met:
 * - the onElementClick listener is available
 * - we have at least one highlighted geometry
 * - the pointer state goes from down state to up state
 */
export function createOnElementClickCaller(): (state: GlobalChartState) => void {
  let prevProps: Props | null = null;
  let selector: Selector<GlobalChartState, void> | null = null;
  return (state: GlobalChartState) => {
    if (selector === null && state.chartType === ChartTypes.XYAxis) {
      selector = createCachedSelector(
        [getPointerSelector, getSettingsSpecSelector, getHighlightedGeomsSelector],
        (pointer: PointerState, settings: SettingsSpec, indexedGeometries: IndexedGeometry[]): void => {
          const nextProps = {
            pointer,
            settings,
            indexedGeometries,
          };

          if (isClicking(prevProps, nextProps)) {
            if (settings && settings.onElementClick) {
              settings.onElementClick(indexedGeometries.map(({ value }) => value));
            }
          }
          prevProps = nextProps;
        },
      )({
        keySelector: (state: GlobalChartState) => state.chartId,
      });
    }
    if (selector) {
      selector(state);
    }
  };
}
