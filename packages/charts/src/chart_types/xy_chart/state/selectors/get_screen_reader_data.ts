/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { SeriesKey } from '../../../../common/series_id';
import { ScaleType } from '../../../../scales/constants';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { getSmallMultiplesSpec } from '../../../../state/selectors/get_small_multiples_spec';
import { Rotation } from '../../../../utils/common';
import { BandedAccessorType } from '../../../../utils/geometry';
import { getAxisSpecsSelector, getSeriesSpecsSelector } from '../../../xy_chart/state/selectors/get_specs';
import { getBandedLegendItemLabel, getLegendExtra, getPostfix } from '../../legend/legend';
import { getXScaleTypeFromSpec } from '../../scales/get_api_scales';
import { defaultTickFormatter } from '../../utils/axis_utils';
import {
  DataSeries,
  getSeriesKey,
  getSeriesName,
  isDataSeriesBanded,
  XYChartSeriesIdentifier,
} from '../../utils/series';
import { AxisSpec, BasicSeriesSpec, StackMode } from '../../utils/specs';
import { getLastValues } from '../utils/get_last_value';
import { getSpecsById, getAxesSpecForSpecId } from '../utils/spec';
import { LastValues } from '../utils/types';
import { computeSeriesDomainsSelector } from './compute_series_domains';

interface FormattedDefaultExtraValue {
  xValue: number | string | null;
  raw: number | null;
  formatted: string | number | null;
  legendSizingLabel: string | number | null;
}

/**@internal */
export interface CartesianData {
  isSmallMultiple: boolean;
  xScaleType?: ScaleType;
  yScaleType?: ScaleType;
  hasAxes: boolean;
  numberOfItemsInGroup: number;
  data: any[];
}

/** @internal */
export const getScreenReaderDataSelector = createCustomCachedSelector(
  [
    getSeriesSpecsSelector,
    getSmallMultiplesSpec,
    getAxisSpecsSelector,
    computeSeriesDomainsSelector,
    getSettingsSpecSelector,
  ],
  (specs, isSmallMultiple, axis, { formattedDataSeries, xDomain }, { rotation }): CartesianData => {
    const allValues = getValues(formattedDataSeries);
    if (specs.length === 0) {
      return {
        isSmallMultiple: false,
        xScaleType: undefined,
        yScaleType: undefined,
        hasAxes: false,
        data: [],
        numberOfItemsInGroup: 0,
      };
    }
    return {
      isSmallMultiple: isSmallMultiple ? true : false,
      data: computeScreenReaderValues(formattedDataSeries, allValues, specs, axis, rotation),
      numberOfItemsInGroup: getLastValues(formattedDataSeries, xDomain).size,
      xScaleType: specs[0].xScaleType,
      yScaleType: specs[0].yScaleType,
      hasAxes: axis.length > 0 ? true : false,
    };
  },
);

function getValues(dataSeries: DataSeries[]): Map<SeriesKey, { y0: number | null; y1: number | null }[]> {
  const allValues: Map<SeriesKey, { y0: any; y1: number | null }[]> = new Map();
  dataSeries.forEach((series) => {
    const seriesLastValues: { y0: number | null; y1: number | null }[] = [];
    series.data.forEach((data) => {
      const { y0, y1, initialY0, initialY1 } = data;
      const seriesKey = getSeriesKey(series as XYChartSeriesIdentifier, series.groupId);

      if (series.stackMode === StackMode.Percentage && allValues.has(seriesKey)) {
        const y1InPercentage = y1 === null || y0 === null ? null : y1 - y0;
        seriesLastValues.push({ y0, y1: y1InPercentage });
        allValues.set(seriesKey, seriesLastValues);
      }
      if (initialY0 !== null || initialY1 !== null) {
        seriesLastValues.push({ y0: initialY0, y1: initialY1 });
        allValues.set(seriesKey, seriesLastValues);
      }
    });
  });
  return allValues;
}

function computeScreenReaderValues(
  dataSeries: DataSeries[],
  values: Map<SeriesKey, LastValues[]>,
  specs: BasicSeriesSpec[],
  axesSpecs: AxisSpec[],
  chartRotation: Rotation,
) {
  const items: {
    label: string;
    values: FormattedDefaultExtraValue[];
  }[] = [];
  let seriesData: {
    label: string;
    values: FormattedDefaultExtraValue[];
  };
  values.forEach((lastValues, key) => {
    const [relevantDataSeries] = dataSeries.filter((series) => series.key === key);
    const { specId, data } = relevantDataSeries;
    const banded = isDataSeriesBanded(relevantDataSeries);
    const spec = getSpecsById<BasicSeriesSpec>(specs, specId);
    const hasSingleSeries = dataSeries.length === 1;
    const name = getSeriesName(relevantDataSeries, hasSingleSeries, false, spec);
    if (name === '' || !spec) return;
    const postFixes = getPostfix(spec);
    const labelY1 = banded ? getBandedLegendItemLabel(name, BandedAccessorType.Y1, postFixes) : name;

    // Use this to get axis spec w/ tick formatter
    const { yAxis } = getAxesSpecForSpecId(axesSpecs, spec.groupId, chartRotation);
    const formatter = spec.tickFormat ?? yAxis?.tickFormat ?? defaultTickFormatter;

    const xScaleType = getXScaleTypeFromSpec(spec.xScaleType);
    const label = banded ? getBandedLegendItemLabel(name, BandedAccessorType.Y0, postFixes) : labelY1;
    const defaultExtraValuesBySeries = lastValues.map((lastValue, index) => {
      const defaultExtra = banded
        ? getLegendExtra(true, xScaleType, formatter, 'y0', lastValue)
        : getLegendExtra(true, xScaleType, formatter, 'y1', lastValue);
      //@ts-ignore will not accept that xValue does not exist off the result of getLegendExtra return from function
      if (defaultExtra) defaultExtra.xValue = data[index].x;
      return (
        defaultExtra ?? {
          xValue: data[index].x,
          raw: null,
          formatted: null,
          legendSizingLabel: null,
        }
      );
    });
    //@ts-ignore values is not accepting the mutation to getLegendExtra when adding the xValue
    seriesData = { label, values: defaultExtraValuesBySeries };
    items.push(seriesData);
  });
  return items;
}
