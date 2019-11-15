import createCachedSelector from 're-reselect';
import { Dimensions } from '../../../../utils/dimensions';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { GlobalChartState } from '../../../../state/chart_state';
import { Point } from '../../../../utils/point';

const getCurrentPointerPosition = (state: GlobalChartState) => state.interactions.pointer.current.position;

export const computeCursorPositionSelector = createCachedSelector(
  [getCurrentPointerPosition, computeChartDimensionsSelector],
  (currentPointerPosition, chartDimensions): Point => {
    return computeCursorPosition(currentPointerPosition, chartDimensions.chartDimensions);
  },
)((state) => state.chartId);

function computeCursorPosition(currentPointerPosition: Point, chartDimensions: Dimensions) {
  const { x, y } = currentPointerPosition;
  // get positions relative to chart
  let xPos = x - chartDimensions.left;
  let yPos = y - chartDimensions.top;

  // limit cursorPosition to chartDimensions
  if (xPos < 0 || xPos >= chartDimensions.width) {
    xPos = -1;
  }
  if (yPos < 0 || yPos >= chartDimensions.height) {
    yPos = -1;
  }
  return {
    x: xPos,
    y: yPos,
  };
}
