import createCachedSelector from 're-reselect';
import { Selector } from 'reselect';
import { GlobalChartState, PointerState } from '../../../../state/chart_state';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { SettingsSpec } from '../../../../specs';
import { QuadViewModel } from '../../layout/types/viewmodel_types';
import { getPickedShapes } from './picked_shapes';
import { getPieSpecOrNull } from './pie_spec';
import { ChartTypes } from '../../..';
import { PARENT_KEY, DEPTH_KEY, SORT_INDEX_KEY, AGGREGATE_KEY, CHILDREN_KEY } from '../../layout/utils/group_by_rollup';
import { LayerValue } from '../../specs';
import { SeriesIdentifier } from '../../../xy_chart/utils/series';

const getLastClickSelector = (state: GlobalChartState) => state.interactions.pointer.lastClick;

interface Props {
  settings: SettingsSpec | undefined;
  lastClick: PointerState | null;
  pickedShapes: QuadViewModel[];
}

function isClicking(prevProps: Props | null, nextProps: Props | null) {
  if (nextProps === null) {
    return false;
  }
  if (!nextProps.settings || !nextProps.settings.onElementClick || nextProps.pickedShapes.length === 0) {
    return false;
  }
  const prevLastClick = prevProps !== null ? prevProps.lastClick : null;
  const nextLastClick = nextProps !== null ? nextProps.lastClick : null;

  if (prevLastClick === null && nextLastClick !== null) {
    return true;
  }
  if (prevLastClick !== null && nextLastClick !== null && prevLastClick.time !== nextLastClick.time) {
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
    if (selector === null && state.chartType === ChartTypes.Partition) {
      selector = createCachedSelector(
        [getPieSpecOrNull, getLastClickSelector, getSettingsSpecSelector, getPickedShapes],
        (pieSpec, lastClick: PointerState | null, settings: SettingsSpec, pickedShapes: QuadViewModel[]): void => {
          const nextProps = {
            lastClick,
            settings,
            pickedShapes,
          };
          if (!pieSpec) {
            return;
          }
          if (isClicking(prevProps, nextProps)) {
            if (settings && settings.onElementClick) {
              const elements = pickedShapes.map<[Array<LayerValue>, SeriesIdentifier]>((model) => {
                const values: Array<LayerValue> = [];
                values.push({
                  groupByRollup: model.dataName,
                  value: model.value,
                });
                let parent = model.parent;
                let index = model.parent.sortIndex;
                while (parent[DEPTH_KEY] > 0) {
                  const value = parent[AGGREGATE_KEY];
                  const dataName = parent[PARENT_KEY][CHILDREN_KEY][index][0];
                  values.push({ groupByRollup: dataName, value });

                  parent = parent[PARENT_KEY];
                  index = parent[SORT_INDEX_KEY];
                }
                return [
                  values.reverse(),
                  {
                    specId: pieSpec.id,
                    key: `spec{${pieSpec.id}}`,
                  },
                ];
              });
              settings.onElementClick(elements);
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
