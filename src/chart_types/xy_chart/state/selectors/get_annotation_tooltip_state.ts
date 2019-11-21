import createCachedSelector from 're-reselect';
import { Dimensions } from '../../../../utils/dimensions';
import { getProjectedPointerPositionSelector } from './get_projected_pointer_position';
import { Point } from '../../../../utils/point';
import { TooltipValue } from '../../utils/interactions';
import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { getAxisSpecsSelector, getAnnotationSpecsSelector } from './get_specs';
import { AxisSpec, AnnotationSpec, Rotation, AnnotationTypes } from '../../utils/specs';
import {
  computeAnnotationTooltipState,
  AnnotationTooltipState,
  AnnotationDimensions,
} from '../../annotations/annotation_utils';
import { computeAnnotationDimensionsSelector } from './compute_annotations';
import { getChartRotationSelector } from '../../../../state/selectors/get_chart_rotation';
import { AnnotationId } from '../../../../utils/ids';
import { computeSeriesGeometriesSelector } from './compute_series_geometries';
import { ComputedGeometries } from '../utils';
import { getTooltipValuesSelector } from './get_tooltip_values_highlighted_geoms';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';

export const getAnnotationTooltipStateSelector = createCachedSelector(
  [
    getProjectedPointerPositionSelector,
    computeChartDimensionsSelector,
    computeSeriesGeometriesSelector,
    getChartRotationSelector,
    getAnnotationSpecsSelector,
    getAxisSpecsSelector,
    computeAnnotationDimensionsSelector,
    getTooltipValuesSelector,
  ],
  getAnnotationTooltipState,
)(getChartIdSelector);

function getAnnotationTooltipState(
  projectedPointerPosition: Point,
  chartDimensions: { chartDimensions: Dimensions },
  geometries: ComputedGeometries,
  chartRotation: Rotation,
  annotationSpecs: AnnotationSpec[],
  axesSpecs: AxisSpec[],
  annotationDimensions: Map<AnnotationId, AnnotationDimensions>,
  tooltipValues: TooltipValue[],
): AnnotationTooltipState | null {
  // get positions relative to chart
  if (projectedPointerPosition.x < 0 || projectedPointerPosition.y < 0) {
    return null;
  }
  const { xScale, yScales } = geometries.scales;
  // only if we have a valid cursor position and the necessary scale
  if (!xScale || !yScales) {
    return null;
  }

  const tooltipState = computeAnnotationTooltipState(
    projectedPointerPosition,
    annotationDimensions,
    annotationSpecs,
    chartRotation,
    axesSpecs,
    chartDimensions.chartDimensions,
  );

  // If there's a highlighted chart element tooltip value, don't show annotation tooltip
  if (tooltipState && tooltipState.isVisible && tooltipState.annotationType === AnnotationTypes.Rectangle) {
    for (const tooltipValue of tooltipValues) {
      if (tooltipValue.isHighlighted) {
        return null;
      }
    }
  }

  return tooltipState;
}
