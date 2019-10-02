import { getSettingsSpecSelector } from '../../../../store/selectors/get_settings_specs';
import createCachedSelector from 're-reselect';
import {
  getTooltipValuesAndGeometriesSelector,
  TooltipAndHighlightedGeoms,
} from './get_tooltip_values_highlighted_geoms';
import { SettingsSpec } from 'specs';
import { IChartState } from 'store/chart_store';
import { IndexedGeometry } from 'utils/geometry';

interface Props {
  settings: SettingsSpec | undefined;
  highlightedGeometries: IndexedGeometry[];
}

function isOutElement(prevProps: Props | null, nextProps: Props | null) {
  if (!nextProps || !prevProps) {
    return false;
  }
  if (!nextProps.settings || !nextProps.settings.onElementOut) {
    return false;
  }
  if (prevProps.highlightedGeometries.length > 0 && nextProps.highlightedGeometries.length === 0) {
    return true;
  }
  return false;
}

/**
 * Will call the onElementOut listener every time the following preconditions are met:
 * - the onElementOut listener is available
 * - the highlighted geometries list goes from a list of at least one object to an empty one
 */
export function createOnElementOutCaller(): (state: IChartState) => void {
  let prevProps: Props | null = null;
  const selector = createCachedSelector(
    [getTooltipValuesAndGeometriesSelector, getSettingsSpecSelector],
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
  )({
    keySelector: (state) => state.chartId,
  });
  return (state: IChartState) => {
    selector(state);
  };
}
