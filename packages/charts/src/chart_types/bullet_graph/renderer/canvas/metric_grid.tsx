/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ColorContrastOptions } from 'packages/charts/src/common/color_calcs';
import type { Size } from 'packages/charts/src/utils/dimensions';
import type { MetricStyle } from 'packages/charts/src/utils/themes/theme';
import React, { useMemo } from 'react';

import { colorToRgba } from '../../../../common/color_library_wrappers';
import { Colors, type Color } from '../../../../common/colors';
import { AlignedGrid } from '../../../../components/grid/aligned_grid';
import { mergePartial } from '../../../../utils/common';
import { Metric } from '../../../metric/renderer/dom/metric';
import {
  getFitValueFontSize,
  getMetricTextPartDimensions,
  getSnappedFontSizes,
} from '../../../metric/renderer/dom/text_measurements';
import { type BulletMetricWProgress } from '../../../metric/specs';
import type { BulletDimensions } from '../../selectors/get_panel_dimensions';
import { BulletSubtype, mergeValueLabels, type BulletDatum, type BulletSpec } from '../../spec';
import type { BulletStyle } from '../../theme';

interface BulletMetricProps {
  datum: BulletDatum;
  stats: { rows: number; rowIndex: number; columns: number; columnIndex: number };
  dimensions: BulletDimensions;
  style: BulletStyle;
  spec: BulletSpec;
  metricStyle: MetricStyle;
  size: Size;
  locale: string;
  chartId: string;
  hasTitles: boolean;
  backgroundColor: Color;
  contrastOptions: ColorContrastOptions;
}

const BulletMetric = ({
  datum,
  stats,
  dimensions,
  style,
  spec,
  metricStyle,
  size,
  locale,
  chartId,
  hasTitles,
  backgroundColor,
  contrastOptions,
}: BulletMetricProps) => {
  const width = size.width / stats.columns;
  const height = size.height / stats.rows;

  const bulletDatum: BulletMetricWProgress = useMemo(() => {
    const valueLabels = mergeValueLabels(spec.valueLabels);

    return {
      value: datum.value,
      target: datum.target,
      valueFormatter: datum.valueFormatter,
      targetFormatter: datum.targetFormatter,
      color: style.barBackground,
      progressBarDirection: spec.subtype === BulletSubtype.vertical ? 'vertical' : 'horizontal',
      title: datum.title,
      subtitle: datum.subtitle,
      domain: datum.domain,
      niceDomain: datum.niceDomain,
      valueLabels,
      extra: datum.target
        ? {
            value: datum.target.toString(),
            label: `${valueLabels.target}:`,
          }
        : undefined,
    };
  }, [datum, style.barBackground, spec.subtype, spec.valueLabels]);

  const colorScale = useMemo(
    () =>
      dimensions.rows[stats.rowIndex]?.[stats.columnIndex]?.colorScale ??
      (() => ({ hex: () => style.fallbackBandColor })), // should never happen
    [dimensions.rows, stats.rowIndex, stats.columnIndex, style.fallbackBandColor],
  );

  const bulletToMetricStyle = useMemo(
    () =>
      mergePartial(metricStyle, {
        fontFamily: style.fontFamily,
        barBackground: colorScale(datum.value).hex(),
        emptyBackground: Colors.Transparent.keyword,
        border: 'gray',
        minHeight: 0,
        textLightColor: 'white',
        textDarkColor: 'black',
        nonFiniteText: 'N/A',
        valueFontSize: 'default',
      }),
    [metricStyle, style.fontFamily, colorScale, datum.value],
  );

  const textDimensions = useMemo(() => {
    const dimensionsForText = getMetricTextPartDimensions(bulletDatum, { width, height }, bulletToMetricStyle, locale);
    const fittedValueFontSize = getFitValueFontSize(
      dimensionsForText.heightBasedSizes.valueFontSize,
      width - dimensionsForText.progressBarWidth,
      dimensionsForText.visibility.availableHeightWithoutValue,
      dimensionsForText.textParts,
      bulletToMetricStyle.minValueFontSize,
      false,
      false,
      dimensionsForText.metricSpacing.panelPadding,
      bulletToMetricStyle.fontFamily,
    );
    const sizes = getSnappedFontSizes(fittedValueFontSize, height, bulletToMetricStyle);

    dimensionsForText.heightBasedSizes.valueFontSize = sizes.valueFontSize;
    dimensionsForText.heightBasedSizes.valuePartFontSize = sizes.valuePartFontSize;

    return dimensionsForText;
  }, [bulletDatum, bulletToMetricStyle, locale, width, height]);

  return (
    <Metric
      chartId={`${chartId}-${stats.rowIndex}-${stats.columnIndex}`}
      datum={bulletDatum}
      hasTitles={hasTitles}
      totalRows={stats.rows}
      totalColumns={stats.columns}
      columnIndex={stats.columnIndex}
      rowIndex={stats.rowIndex}
      style={bulletToMetricStyle}
      backgroundColor={backgroundColor}
      contrastOptions={contrastOptions}
      textDimensions={textDimensions}
    />
  );
};

type BulletMetricGridProps = Omit<BulletMetricProps, 'datum' | 'stats' | 'contrastOptions'>;

/** @internal */
export const BulletMetricGrid = React.memo(
  ({
    dimensions,
    style,
    spec,
    metricStyle,
    size,
    locale,
    chartId,
    hasTitles,
    backgroundColor,
  }: BulletMetricGridProps) => {
    const contrastOptions: ColorContrastOptions = useMemo(
      () => ({
        lightColor: colorToRgba(metricStyle.textLightColor),
        darkColor: colorToRgba(metricStyle.textDarkColor),
      }),
      [metricStyle.textLightColor, metricStyle.textDarkColor],
    );

    const renderMetricContent = ({
      datum,
      stats,
    }: {
      datum: BulletDatum;
      stats: { rows: number; rowIndex: number; columns: number; columnIndex: number };
    }) => (
      <BulletMetric
        datum={datum}
        stats={stats}
        dimensions={dimensions}
        style={style}
        spec={spec}
        metricStyle={metricStyle}
        size={size}
        locale={locale}
        chartId={chartId}
        hasTitles={hasTitles}
        backgroundColor={backgroundColor}
        contrastOptions={contrastOptions}
      />
    );

    return <AlignedGrid<BulletDatum> data={spec.data} contentComponent={renderMetricContent} />;
  },
);

BulletMetricGrid.displayName = 'BulletMetricGrid';
