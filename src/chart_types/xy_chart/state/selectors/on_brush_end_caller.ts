import createCachedSelector from 're-reselect';
import { Selector } from 'reselect';
import { GlobalChartState, DragState } from '../../../../state/chart_state';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { SettingsSpec } from '../../../../specs';
import { ChartTypes } from '../../../index';
import { getComputedScalesSelector } from './get_computed_scales';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { isHistogramModeEnabledSelector } from './is_histogram_mode_enabled';
import { isBrushAvailableSelector } from './is_brush_available';

const getLastDragSelector = (state: GlobalChartState) => state.interactions.pointer.lastDrag;

interface Props {
  settings: SettingsSpec | undefined;
  lastDrag: DragState | null;
}

function hasDragged(prevProps: Props | null, nextProps: Props | null) {
  if (nextProps === null) {
    return false;
  }
  if (!nextProps.settings || !nextProps.settings.onBrushEnd) {
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
      if (!isBrushAvailableSelector(state)) {
        selector = null;
        prevProps = null;
        return;
      }
      selector = createCachedSelector(
        [
          getLastDragSelector,
          getSettingsSpecSelector,
          getComputedScalesSelector,
          computeChartDimensionsSelector,
          isHistogramModeEnabledSelector,
        ],
        (lastDrag, settings, computedScales, { chartDimensions }, histogramMode): void => {
          const nextProps = {
            lastDrag,
            settings,
          };

          if (lastDrag !== null && hasDragged(prevProps, nextProps)) {
            if (settings && settings.onBrushEnd) {
              let startPos = lastDrag.start.position.x - chartDimensions.left;
              let endPos = lastDrag.end.position.x - chartDimensions.left;
              let chartMax = chartDimensions.width;
              if (settings.rotation === -90 || settings.rotation === 90) {
                startPos = lastDrag.start.position.y - chartDimensions.top;
                endPos = lastDrag.end.position.y - chartDimensions.top;
                chartMax = chartDimensions.height;
              }
              const minValue = Math.max(Math.min(startPos, endPos), 0);
              const maxValue = Math.min(Math.max(startPos, endPos), chartMax);
              if (maxValue === minValue) {
                // if 0 size brush, avoid computing the value
                return;
              }

              const { xScale } = computedScales;
              const offset = histogramMode ? 0 : -(xScale.bandwidth + xScale.bandwidthPadding) / 2;
              const min = Math.max(xScale.invert(minValue + offset), xScale.domain[0]);

              const max = Math.min(
                xScale.invert(maxValue + offset),
                histogramMode ? xScale.domain[1] + xScale.bandwidth + xScale.bandwidthPadding : xScale.domain[1],
              );
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
