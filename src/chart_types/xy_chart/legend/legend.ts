import { getAxesSpecForSpecId, LastValues } from '../store/utils';
import { identity } from '../../../utils/commons';
import { AxisId, SpecId } from '../../../utils/ids';
import {
  SeriesCollectionValue,
  getSeriesIndex,
  getSortedDataSeriesColorsValuesMap,
  SeriesIdentifier,
  getSeriesLabel,
} from '../utils/series';
import { AxisSpec, BasicSeriesSpec, Postfixes, isAreaSeriesSpec, isBarSeriesSpec } from '../utils/specs';
import { Y0_ACCESSOR_POSTFIX, Y1_ACCESSOR_POSTFIX } from '../tooltip/tooltip';

export interface FormatedLastValues {
  y0: number | string | null;
  y1: number | string | null;
}

export type LegendItem = Postfixes & {
  key: string;
  color: string;
  label: string;
  seriesIdentifier: SeriesIdentifier;
  isSeriesVisible?: boolean;
  banded?: boolean;
  isLegendItemVisible?: boolean;
  displayValue: {
    raw: LastValues;
    formatted: FormatedLastValues;
  };
};

export function getPostfix(spec: BasicSeriesSpec): Postfixes {
  if (isAreaSeriesSpec(spec) || isBarSeriesSpec(spec)) {
    const { y0AccessorFormat = Y0_ACCESSOR_POSTFIX, y1AccessorFormat = Y1_ACCESSOR_POSTFIX } = spec;
    return {
      y0AccessorFormat,
      y1AccessorFormat,
    };
  }

  return {};
}

export function computeLegend(
  seriesCollection: Map<string, SeriesCollectionValue>,
  seriesColors: Map<string, string>,
  specs: Map<SpecId, BasicSeriesSpec>,
  defaultColor: string,
  axesSpecs: Map<AxisId, AxisSpec>,
  deselectedDataSeries?: SeriesIdentifier[],
): Map<string, LegendItem> {
  const legendItems: Map<string, LegendItem> = new Map();
  const sortedCollection = getSortedDataSeriesColorsValuesMap(seriesCollection);

  sortedCollection.forEach((series, key) => {
    const { banded, lastValue, seriesIdentifier } = series;
    const spec = specs.get(seriesIdentifier.specId);
    const color = seriesColors.get(key) || defaultColor;
    const hasSingleSeries = seriesCollection.size === 1;
    const label = getSeriesLabel(seriesIdentifier, hasSingleSeries, false, spec);
    const isSeriesVisible = deselectedDataSeries ? getSeriesIndex(deselectedDataSeries, seriesIdentifier) < 0 : true;

    if (label === '' || !spec) {
      return;
    }

    // Use this to get axis spec w/ tick formatter
    const { yAxis } = getAxesSpecForSpecId(axesSpecs, spec.groupId);
    const formatter = yAxis ? yAxis.tickFormat : identity;
    const { hideInLegend } = spec;

    const legendItem: LegendItem = {
      key,
      color,
      label,
      banded,
      seriesIdentifier,
      isSeriesVisible,
      isLegendItemVisible: !hideInLegend,
      displayValue: {
        raw: {
          y0: lastValue && lastValue.y0 !== null ? lastValue.y0 : null,
          y1: lastValue && lastValue.y1 !== null ? lastValue.y1 : null,
        },
        formatted: {
          y0: isSeriesVisible && lastValue && lastValue.y0 !== null ? formatter(lastValue.y0) : null,
          y1: isSeriesVisible && lastValue && lastValue.y1 !== null ? formatter(lastValue.y1) : null,
        },
      },
      ...getPostfix(spec),
    };

    legendItems.set(key, legendItem);
  });
  return legendItems;
}
