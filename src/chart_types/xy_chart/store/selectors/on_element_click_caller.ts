import createCachedSelector from 're-reselect';
import { IChartState, PointerState } from '../../../../store/chart_store';
import { getSettingsSpecSelector } from '../../../../store/selectors/get_settings_specs';
import { getHighlightedGeomsSelector } from './get_tooltip_values_highlighted_geoms';
import { SettingsSpec } from '../../../../specs';
import { IndexedGeometry } from '../../../../utils/geometry';

const getPointerSelector = (state: IChartState) => state.interactions.pointer;

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
export function createOnElementClickCaller(): (state: IChartState) => void {
  let prevProps: Props | null = null;
  const selector = createCachedSelector(
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
    keySelector: (state: IChartState) => state.chartId,
  });
  return (state: IChartState) => {
    selector(state);
  };
}
