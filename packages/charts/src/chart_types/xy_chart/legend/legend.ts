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
import { getLegendExtraValue } from '../state/utils/legend_extra';
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
  isBandedSpec,
  getSeriesIdentifierFromDataSeries,
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
    const labelY1 = banded ? getBandedLegendItemLabel(name, BandedAccessorType.Y1, postFixes) : name;

    // Use this to get axis spec w/ tick formatter
    const { yAxis } = getAxesSpecForSpecId(axesSpecs, spec.groupId, settingsSpec.rotation);
    const formatter = spec.tickFormat ?? yAxis?.tickFormat ?? defaultTickFormatter;
    const { hideInLegend } = spec;

    const seriesIdentifier = getSeriesIdentifierFromDataSeries(series);

    const pointStyle = getPointStyle(spec, theme);

    const extraValue = getLegendExtraValue(series, xDomain, settingsSpec.legendExtra, (d) => {
      return series.stackMode === StackMode.Percentage
        ? d.y1 === null || d.y0 === null
          ? null
          : d.y1 - d.y0
        : d.initialY1;
    });

    legendItems.push({
      color,
      label: labelY1,
      seriesIdentifiers: [seriesIdentifier],
      childId: BandedAccessorType.Y1,
      isSeriesHidden,
      isItemHidden: hideInLegend,
      isToggleable: true,
      extraValue: {
        raw: extraValue,
        formatted: extraValue !== null ? formatter(extraValue) : '',
        legendSizingLabel: extraValue !== null ? formatter(extraValue) : '',
      },
      path: [{ index: 0, value: seriesIdentifier.key }],
      keys: [specId, spec.groupId, yAccessor, ...series.splitAccessors.values()],
      pointStyle,
    });
    if (banded) {
      const extraValue = getLegendExtraValue(series, xDomain, settingsSpec.legendExtra, (d) => {
        return series.stackMode === StackMode.Percentage ? d.y0 : d.initialY0;
      });
      const labelY0 = getBandedLegendItemLabel(name, BandedAccessorType.Y0, postFixes);
      legendItems.push({
        color,
        label: labelY0,
        seriesIdentifiers: [seriesIdentifier],
        childId: BandedAccessorType.Y0,
        isSeriesHidden,
        isItemHidden: hideInLegend,
        isToggleable: true,
        extraValue: {
          raw: extraValue,
          formatted: extraValue !== null ? formatter(extraValue) : '',
          legendSizingLabel: extraValue !== null ? formatter(extraValue) : '',
        },
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
