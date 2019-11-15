import createCachedSelector from 're-reselect';
import { Selector } from 'reselect';
import { GlobalChartState, DragState } from '../../../../state/chart_state';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { SettingsSpec } from '../../../../specs';
import { ChartTypes } from '../../../index';
import { getComputedScalesSelector } from './get_computed_scales';
import { ComputedScales } from '../utils';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';

const getLastDragSelector = (state: GlobalChartState) => state.interactions.pointer.lastDrag;

interface Props {
  settings: SettingsSpec | undefined;
  lastDrag: DragState | null;
}

function hasDragged(prevProps: Props | null, nextProps: Props | null) {
  if (nextProps === null) {
    return false;
  }
  if (!nextProps.settings || !nextProps.settings.onElementClick) {
    return false;
  }
  const prevLastDrag = prevProps !== null ? prevProps.lastDrag : null;
  const nextLastDrag = nextProps !== null ? nextProps.lastDrag : null;

  if (prevLastDrag === null && nextLastDrag !== null) {
    return true;
  }
  if (prevLastDrag !== null && nextLastDrag !== null && prevLastDrag.end.time !== nextLastDrag.end.time) {
    return true;
  }
  return false;
}

/**
 * Will call the onBrushEnd listener every time the following preconditions are met:
 * - the onBrushEnd listener is available
 * - we dragged the mouse pointer
 */
export function createOnBrushEndCaller(): (state: GlobalChartState) => void {
  let prevProps: Props | null = null;
  let selector: Selector<GlobalChartState, void> | null = null;
  return (state: GlobalChartState) => {
    if (selector === null && state.chartType === ChartTypes.XYAxis) {
      selector = createCachedSelector(
        [getLastDragSelector, getSettingsSpecSelector, getComputedScalesSelector, computeChartDimensionsSelector],
        (
          lastDrag: DragState | null,
          settings: SettingsSpec,
          computedScales: ComputedScales,
          { chartDimensions },
        ): void => {
          const nextProps = {
            lastDrag,
            settings,
          };

          if (lastDrag !== null && hasDragged(prevProps, nextProps)) {
            if (settings && settings.onBrushEnd) {
              const minValue = Math.min(lastDrag.start.position.x, lastDrag.end.position.x);
              const maxValue = Math.max(lastDrag.start.position.x, lastDrag.end.position.x);
              if (maxValue === minValue) {
                // if 0 size brush, avoid computing the value
                return;
              }
              const min = computedScales.xScale.invert(minValue - chartDimensions.left);
              const max = computedScales.xScale!.invert(maxValue - chartDimensions.left);
              settings.onBrushEnd(min, max);
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
