import { findDataSeriesByColorValues, getAxesSpecForSpecId } from '../../state/utils';
import { identity } from '../utils/commons';
import { AxisId, SpecId } from '../utils/ids';
import { DataSeriesColorsValues, getSortedDataSeriesColorsValuesMap } from './series';
import { AxisSpec, BasicSeriesSpec } from './specs';

export interface LegendItem {
  key: string;
  color: string;
  label: string;
  value: DataSeriesColorsValues;
  isSeriesVisible?: boolean;
  isLegendItemVisible?: boolean;
  displayValue: {
    raw: any;
    formatted: any;
  };
}

// export function computeIfEmpty(
//   seriesColor: Map<string, DataSeriesColorsValues>,
//   deselectedDataSeries?: DataSeriesColorsValues[] | null,
//   ) {
//   let isChartEmpty = 0;
//   const sortedSeriesColors = getSortedDataSeriesColorsValuesMap(seriesColor);
//   console.log('\n\n\n\n\n TESTsortedSeriesColors', sortedSeriesColors.size);
//   sortedSeriesColors.forEach((series) => {
//     if (deselectedDataSeries) {
//       isChartEmpty += 1;
//     }
//     console.log('\n\n\n\n isChartEmpty', isChartEmpty);
//     return isChartEmpty;
//   });

//   if (isChartEmpty === sortedSeriesColors.size) {
//     console.log('empty');
//   }
// }

export function computeLegend(
  seriesColor: Map<string, DataSeriesColorsValues>,
  seriesColorMap: Map<string, string>,
  specs: Map<SpecId, BasicSeriesSpec>,
  defaultColor: string,
  axesSpecs: Map<AxisId, AxisSpec>,
  deselectedDataSeries?: DataSeriesColorsValues[] | null,
): Map<string, LegendItem> {
  const legendItems: Map<string, LegendItem> = new Map();
  let isChartNotEmpty: number = 0;
  const sortedSeriesColors = getSortedDataSeriesColorsValuesMap(seriesColor);

  sortedSeriesColors.forEach((series, key) => {
    const spec = specs.get(series.specId);
    const color = seriesColorMap.get(key) || defaultColor;
    const hasSingleSeries = seriesColor.size === 1;
    const label = getSeriesColorLabel(series.colorValues, hasSingleSeries, spec);
    // computeIfEmpty(seriesColor, deselectedDataSeries);
    const isSeriesVisible = deselectedDataSeries
    ? findDataSeriesByColorValues(deselectedDataSeries, series) < 0
    : true;
    if (!label || !spec) {
      return;
    }

    // Use this to get axis spec w/ tick formatter
    const { yAxis } = getAxesSpecForSpecId(axesSpecs, spec.groupId);
    const formatter = yAxis ? yAxis.tickFormat : identity;

    const { hideInLegend } = spec;
    // 1 true
    isChartNotEmpty +=  Number(isSeriesVisible);
    console.log(isChartNotEmpty);

    legendItems.set(key, {
      key,
      color,
      label,
      value: series,
      isSeriesVisible,
      isLegendItemVisible: !hideInLegend,
      displayValue: {
        raw: series.lastValue,
        formatted: formatter(series.lastValue),
      },
    });
  });
  // need to sum up the isChartNotEmpty to confirm it is all 0
  if (!isChartNotEmpty) {
    // renderEmptyState(isChartNotEmpty);
  }
  return legendItems;
}

export function getSeriesColorLabel(
  colorValues: any[],
  hasSingleSeries: boolean,
  spec?: BasicSeriesSpec,
): string | undefined {
  let label = '';

  if (hasSingleSeries || colorValues.length === 0 || !colorValues[0]) {
    if (!spec) {
      return;
    }
    label = spec.name || `${spec.id}`;
  } else {
    label = colorValues.join(' - ');
  }

  return label;
}
