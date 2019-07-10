import { getAxesSpecForSpecId } from '../../state/utils';
import { identity } from '../utils/commons';
import { AxisId, SpecId } from '../utils/ids';
import { DataSeriesValues, getSeriesIndex, getSortedDataSeriesColorsValuesMap } from './series';
import { AxisSpec, BasicSeriesSpec } from './specs';

export interface LegendItem {
  key: string;
  color: string;
  label: string;
  value: DataSeriesValues;
  isSeriesVisible?: boolean;
  isLegendItemVisible?: boolean;
  displayValue: {
    raw: any;
    formatted: any;
  };
}

export function computeLegend(
  seriesColor: Map<string, DataSeriesValues>,
  seriesColorMap: Map<string, string>,
  specs: Map<SpecId, BasicSeriesSpec>,
  defaultColor: string,
  axesSpecs: Map<AxisId, AxisSpec>,
  deselectedDataSeries?: DataSeriesValues[] | null,
): Map<string, LegendItem> {
  const legendItems: Map<string, LegendItem> = new Map();

  const sortedSeriesColors = getSortedDataSeriesColorsValuesMap(seriesColor);

  sortedSeriesColors.forEach((series, key) => {
    const spec = series.specId && specs.get(series.specId);

    const color = seriesColorMap.get(key) || defaultColor;
    // const hasSingleSeries = seriesColor.size === 1;
    const label = 'nick';
    // const label = getSeriesColorLabel(series.colorValues, hasSingleSeries, spec);
    const isSeriesVisible = deselectedDataSeries ? getSeriesIndex(deselectedDataSeries, series) < 0 : true;

    if (!label || !spec) {
      return;
    }

    // Use this to get axis spec w/ tick formatter
    const { yAxis } = getAxesSpecForSpecId(axesSpecs, spec.groupId);
    const formatter = yAxis ? yAxis.tickFormat : identity;

    const { hideInLegend } = spec;

    legendItems.set(key, {
      key,
      color,
      label,
      value: series,
      isSeriesVisible,
      isLegendItemVisible: !hideInLegend,
      displayValue: {
        raw: series.lastValue,
        formatted: isSeriesVisible ? formatter(series.lastValue) : undefined,
      },
    });
  });
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
