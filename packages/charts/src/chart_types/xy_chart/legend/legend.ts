/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Color } from '../../../common/colors';
import { LegendItem } from '../../../common/legend';
import { SeriesKey, SeriesIdentifier } from '../../../common/series_id';
import { SettingsSpec } from '../../../specs';
import { isDefined, mergePartial } from '../../../utils/common';
import { BandedAccessorType } from '../../../utils/geometry';
import { getLegendCompareFn, SeriesCompareFn } from '../../../utils/series_sort';
import { PointStyle, Theme } from '../../../utils/themes/theme';
import { XDomain } from '../domains/types';
import { isDatumFilled } from '../rendering/utils';
import { getLegendValues } from '../state/utils/get_legend_values';
import { getAxesSpecForSpecId, getSpecsById } from '../state/utils/spec';
import { Y0_ACCESSOR_POSTFIX, Y1_ACCESSOR_POSTFIX } from '../tooltip/tooltip';
import { defaultTickFormatter } from '../utils/axis_utils';
import { defaultXYLegendSeriesSort } from '../utils/default_series_sort_fn';
import { groupBy } from '../utils/group_data_series';
import {
  getSeriesIndex,
  getSeriesName,
  DataSeries,
  getSeriesKey,
  getSeriesIdentifierFromDataSeries,
  isBandedSpec,
  DataSeriesDatum,
} from '../utils/series';
import {
  AxisSpec,
  BasicSeriesSpec,
  Postfixes,
  StackMode,
  isAreaSeriesSpec,
  isBarSeriesSpec,
  isBubbleSeriesSpec,
  isLineSeriesSpec,
} from '../utils/specs';

/** @internal */
export interface FormattedLastValues {
  y0: number | string | null;
  y1: number | string | null;
}

function getPostfix(spec: BasicSeriesSpec): Postfixes {
  if (isAreaSeriesSpec(spec) || isBarSeriesSpec(spec)) {
    const { y0AccessorFormat = Y0_ACCESSOR_POSTFIX, y1AccessorFormat = Y1_ACCESSOR_POSTFIX } = spec;
    return { y0AccessorFormat, y1AccessorFormat };
  }

  return {};
}

function getBandedLegendItemLabel(name: string, yAccessor: BandedAccessorType, postfixes: Postfixes) {
  return yAccessor === BandedAccessorType.Y1
    ? `${name}${postfixes.y1AccessorFormat}`
    : `${name}${postfixes.y0AccessorFormat}`;
}

/** @internal */
function getPointStyle(spec: BasicSeriesSpec, theme: Theme): PointStyle | undefined {
  if (isBubbleSeriesSpec(spec)) {
    return mergePartial(theme.bubbleSeriesStyle.point, spec.bubbleSeriesStyle?.point);
  } else if (isLineSeriesSpec(spec)) {
    return mergePartial(theme.lineSeriesStyle.point, spec.lineSeriesStyle?.point);
  } else if (isAreaSeriesSpec(spec)) {
    return mergePartial(theme.areaSeriesStyle.point, spec.areaSeriesStyle?.point);
  }
}

const y1Accessor =
  (stackMode?: StackMode) =>
  (d: DataSeriesDatum): number | null => {
    // don't consider filled in data in the calculations
    if (isDatumFilled(d)) {
      return null;
    }
    return stackMode === StackMode.Percentage ? (d.y1 === null || d.y0 === null ? null : d.y1 - d.y0) : d.initialY1;
  };

const y0Accessor =
  (stackMode?: StackMode) =>
  (d: DataSeriesDatum): number | null => {
    // don't consider filled in data in the calculations
    if (isDatumFilled(d)) {
      return null;
    }
    return stackMode === StackMode.Percentage ? d.y0 : d.initialY0;
  };

/** @internal */
export function computeLegend(
  xDomain: XDomain,
  dataSeries: DataSeries[],
  seriesColors: Map<SeriesKey, Color>,
  specs: BasicSeriesSpec[],
  axesSpecs: AxisSpec[],
  settingsSpec: SettingsSpec,
  serialIdentifierDataSeriesMap: Record<string, DataSeries>,
  theme: Theme,
  deselectedDataSeries: SeriesIdentifier[] = [],
): LegendItem[] {
  const legendItems: LegendItem[] = [];
  const defaultColor = theme.colors.defaultVizColor;

  const legendValues = settingsSpec.legendValues ?? [];

  dataSeries.forEach((series) => {
    const { specId, yAccessor } = series;
    const banded = isBandedSpec(series.spec);
    const spec = getSpecsById<BasicSeriesSpec>(specs, specId);
    const dataSeriesKey = getSeriesKey(
      {
        specId: series.specId,
        yAccessor: series.yAccessor,
        splitAccessors: series.splitAccessors,
      },
      series.groupId,
    );

    const color = seriesColors.get(dataSeriesKey) || defaultColor;
    const hasSingleSeries = dataSeries.length === 1;
    const name = getSeriesName(series, hasSingleSeries, false, spec);
    const isSeriesHidden = deselectedDataSeries && getSeriesIndex(deselectedDataSeries, series) >= 0;
    if (name === '' || !spec) return;

    const postFixes = getPostfix(spec);
    // Use this to get axis spec w/ tick formatter
    const { yAxis } = getAxesSpecForSpecId(axesSpecs, spec.groupId, settingsSpec.rotation);
    const formatter = spec.tickFormat ?? yAxis?.tickFormat ?? defaultTickFormatter;
    const { hideInLegend } = spec;

    const seriesIdentifier = getSeriesIdentifierFromDataSeries(series);

    const pointStyle = getPointStyle(spec, theme);

    const legendValuesItems = getLegendValues(series, xDomain, legendValues, y1Accessor(series.stackMode), formatter);

    legendItems.push({
      depth: 0,
      color,
      label: banded ? getBandedLegendItemLabel(name, BandedAccessorType.Y1, postFixes) : name,
      seriesIdentifiers: [seriesIdentifier],
      childId: BandedAccessorType.Y1,
      isSeriesHidden,
      isItemHidden: hideInLegend,
      isToggleable: true,
      values: legendValuesItems,
      path: [{ index: 0, value: seriesIdentifier.key }],
      keys: [specId, spec.groupId, yAccessor, ...series.splitAccessors.values()],
      pointStyle,
    });
    if (banded) {
      const bandedLegendValuesItems = getLegendValues(
        series,
        xDomain,
        legendValues,
        y0Accessor(series.stackMode),
        formatter,
      );

      const labelY0 = getBandedLegendItemLabel(name, BandedAccessorType.Y0, postFixes);
      legendItems.push({
        depth: 0,
        color,
        label: labelY0,
        seriesIdentifiers: [seriesIdentifier],
        childId: BandedAccessorType.Y0,
        isSeriesHidden,
        isItemHidden: hideInLegend,
        isToggleable: true,
        values: bandedLegendValuesItems,
        path: [{ index: 0, value: seriesIdentifier.key }],
        keys: [specId, spec.groupId, yAccessor, ...series.splitAccessors.values()],
        pointStyle,
      });
    }
  });

  const legendSortFn = getLegendCompareFn((a, b) => {
    const aDs = serialIdentifierDataSeriesMap[a.key];
    const bDs = serialIdentifierDataSeriesMap[b.key];
    return defaultXYLegendSeriesSort(aDs, bDs);
  });
  const sortFn: SeriesCompareFn = settingsSpec.legendSort ?? legendSortFn;
  return groupBy(
    legendItems.sort((a, b) =>
      a.seriesIdentifiers[0] && b.seriesIdentifiers[0] ? sortFn(a.seriesIdentifiers[0], b.seriesIdentifiers[0]) : 0,
    ),
    ({ keys, childId }) => {
      return [...keys, childId].join('__'); // childId is used for band charts
    },
    true,
  )
    .map((d) => {
      if (!d[0]) return;
      return {
        ...d[0],
        seriesIdentifiers: d.map(({ seriesIdentifiers: [s] }) => s).filter(isDefined),
        path: d.map(({ path: [p] }) => p).filter(isDefined),
      };
    })
    .filter(isDefined);
}
