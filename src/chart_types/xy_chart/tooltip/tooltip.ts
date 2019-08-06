import { TooltipValue } from '../utils/interactions';
import { IndexedGeometry } from '../rendering/rendering';
import { getColorValuesAsString } from '../utils/series';
import { AxisSpec, BasicSeriesSpec } from '../utils/specs';

export function getSeriesTooltipValues(tooltipValues: TooltipValue[]): Map<string, any> {
  // map from seriesKey to tooltipValue
  const seriesTooltipValues = new Map();

  // First tooltipValue is the header
  if (tooltipValues.length <= 1) {
    return seriesTooltipValues;
  }

  tooltipValues.slice(1).forEach((tooltipValue: TooltipValue) => {
    const { seriesKey, value } = tooltipValue;
    seriesTooltipValues.set(seriesKey, value);
  });

  return seriesTooltipValues;
}

export function formatTooltip(
  searchIndexValue: IndexedGeometry,
  spec: BasicSeriesSpec,
  isXValue: boolean,
  isHighlighted: boolean,
  seriesNameMap: Map<string, string>,
  axisSpec?: AxisSpec,
): TooltipValue {
  const { id } = spec;
  const {
    color,
    value: { x, y },
    geometryId: { seriesKey },
  } = searchIndexValue;
  const seriesKeyAsString = getColorValuesAsString(seriesKey, id);
  const customName = seriesKey.length > 0 ? seriesNameMap.get(seriesKeyAsString) : '';
  let name: string | undefined;

  if (customName) {
    name = customName;
  } else if (seriesKey.length > 0) {
    name = seriesKey.join(' - ');
  } else {
    name = spec.name || `${spec.id}`;
  }

  const value = isXValue ? x : y;
  return {
    seriesKey: seriesKeyAsString,
    name,
    value: axisSpec ? axisSpec.tickFormat(value) : emptyFormatter(value),
    color,
    isHighlighted: isXValue ? false : isHighlighted,
    isXValue,
  };
}

function emptyFormatter<T>(value: T): T {
  return value;
}
