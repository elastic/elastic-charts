import createCachedSelector from 're-reselect';
import { TooltipValue, isFollowTooltipType, TooltipType, TooltipValueFormatter } from '../../utils/interactions';
import { computeCursorPositionSelector } from './compute_cursor_position';
import { Point } from '../../../../utils/point';
import { getAxisCursorPositionSelector } from './get_axis_cursor_position';
import { ComputedScales, getAxesSpecForSpecId } from '../utils';
import { getComputedScalesSelector } from './get_computed_scales';
import { getElementAtCursorPositionSelector } from './get_elements_at_cursor_pos';
import { IndexedGeometry } from '../../../../utils/geometry';
import { getSeriesSpecsSelector, getAxisSpecsSelector } from './get_specs';
import { BasicSeriesSpec, AxisSpec } from '../../utils/specs';
import { getTooltipTypeSelector } from './get_tooltip_type';
import { formatTooltip } from '../../tooltip/tooltip';
import { getTooltipHeaderFormatterSelector } from './get_tooltip_header_formatter';
import { isPointOnGeometry } from '../../rendering/rendering';
import { GlobalChartState } from '../../../../state/chart_state';

const EMPTY_VALUES = Object.freeze({
  tooltipValues: [],
  highlightedGeometries: [],
});

export interface TooltipAndHighlightedGeoms {
  tooltipValues: TooltipValue[];
  highlightedGeometries: IndexedGeometry[];
}
export const getTooltipValuesAndGeometriesSelector = createCachedSelector(
  [
    getSeriesSpecsSelector,
    getAxisSpecsSelector,
    computeCursorPositionSelector,
    getAxisCursorPositionSelector,
    getComputedScalesSelector,
    getElementAtCursorPositionSelector,
    getTooltipTypeSelector,
    getTooltipHeaderFormatterSelector,
  ],
  getTooltipValues,
)((state: GlobalChartState) => {
  return state.chartId;
});

function getTooltipValues(
  seriesSpecs: BasicSeriesSpec[],
  axesSpecs: AxisSpec[],
  cursorPosition: Point,
  axisCursorPosition: Point,
  scales: ComputedScales,
  xMatchingGeoms: IndexedGeometry[],
  tooltipType: TooltipType,
  tooltipHeaderFormatter: TooltipValueFormatter | undefined,
): TooltipAndHighlightedGeoms {
  const { x, y } = cursorPosition;
  if (x === -1 || y === -1) {
    return EMPTY_VALUES;
  }
  if (axisCursorPosition.x < 0 || !scales.xScale || !scales.yScales) {
    return EMPTY_VALUES;
  }

  if (xMatchingGeoms.length === 0) {
    return EMPTY_VALUES;
  }

  // build the tooltip value list
  let xValueInfo: TooltipValue | null = null;
  const highlightedGeometries: IndexedGeometry[] = [];
  const tooltipValues = xMatchingGeoms.reduce<TooltipValue[]>((acc, indexedGeometry) => {
    const {
      geometryId: { specId },
    } = indexedGeometry;
    const spec = seriesSpecs.find((spec) => spec.id === specId);

    // safe guard check
    if (!spec) {
      return acc;
    }
    const { xAxis, yAxis } = getAxesSpecForSpecId(axesSpecs, spec.groupId);

    // yScales is ensured by the enclosing if
    const yScale = scales.yScales.get(spec.groupId);
    if (!yScale) {
      return acc;
    }

    // check if the pointer is on the geometry
    let isHighlighted = false;
    if (isPointOnGeometry(axisCursorPosition.x, axisCursorPosition.y, indexedGeometry)) {
      isHighlighted = true;
      highlightedGeometries.push(indexedGeometry);
    }

    // if it's a follow tooltip, and no element is highlighted
    // not add that element into the tooltip list
    if (!isHighlighted && isFollowTooltipType(tooltipType)) {
      return acc;
    }

    // format the tooltip values
    const formattedTooltip = formatTooltip(indexedGeometry, spec, false, isHighlighted, yAxis);

    // format only one time the x value
    if (!xValueInfo) {
      // if we have a tooltipHeaderFormatter, then don't pass in the xAxis as the user will define a formatter
      const formatterAxis = tooltipHeaderFormatter ? undefined : xAxis;
      xValueInfo = formatTooltip(indexedGeometry, spec, true, false, formatterAxis);
      return [xValueInfo, ...acc, formattedTooltip];
    }

    return [...acc, formattedTooltip];
  }, []);

  return {
    tooltipValues,
    highlightedGeometries,
  };
}

export const getTooltipValuesSelector = createCachedSelector(
  [getTooltipValuesAndGeometriesSelector],
  (values): TooltipValue[] => {
    return values.tooltipValues;
  },
)((state) => state.chartId);

export const getHighlightedGeomsSelector = createCachedSelector(
  [getTooltipValuesAndGeometriesSelector],
  (values): IndexedGeometry[] => {
    return values.highlightedGeometries;
  },
)((state) => state.chartId);
