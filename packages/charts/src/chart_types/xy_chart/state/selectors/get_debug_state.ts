/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeAxesGeometriesSelector } from './compute_axes_geometries';
import { computeLegendSelector } from './compute_legend';
import { computeSeriesGeometriesSelector } from './compute_series_geometries';
import { getGridLinesSelector } from './get_grid_lines';
import { getAnnotationSpecsSelector, getAxisSpecsSelector } from './get_specs';
import { LegendItem } from '../../../../common/legend';
import { getPredicateFn, Predicate } from '../../../../common/predicate';
import { AnnotationSpec, AnnotationType, AxisSpec } from '../../../../specs';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import {
  DebugState,
  DebugStateAnnotations,
  DebugStateArea,
  DebugStateAxes,
  DebugStateBar,
  DebugStateLegend,
  DebugStateLine,
  DebugStateValue,
} from '../../../../state/types';
import { Rotation } from '../../../../utils/common';
import { AreaGeometry, BandedAccessorType, BarGeometry, LineGeometry, PerPanel } from '../../../../utils/geometry';
import { mergeWithDefaultAnnotationLine, mergeWithDefaultAnnotationRect } from '../../../../utils/themes/merge_utils';
import { FillStyle, Opacity, StrokeStyle, Theme, Visible } from '../../../../utils/themes/theme';
import { isHorizontalAxis, isVerticalAxis } from '../../utils/axis_type_utils';
import { AxisGeometry } from '../../utils/axis_utils';
import { LinesGrid } from '../../utils/grid_lines';
import { isHorizontalRotation, isVerticalRotation } from '../utils/common';

/**
 * Returns a stringified version of the `debugState`
 * @internal
 */
export const getDebugStateSelector = createCustomCachedSelector(
  [
    computeSeriesGeometriesSelector,
    computeLegendSelector,
    computeAxesGeometriesSelector,
    getGridLinesSelector,
    getAxisSpecsSelector,
    getSettingsSpecSelector,
    getAnnotationSpecsSelector,
    getChartThemeSelector,
  ],
  ({ geometries }, legend, axes, gridLines, axesSpecs, { rotation, locale }, annotations, theme): DebugState => {
    const seriesNameMap = getSeriesNameMap(legend);
    return {
      legend: getLegendState(legend),
      axes: getAxes(axes, axesSpecs, gridLines, rotation, locale),
      areas: geometries.areas.map(getAreaState(seriesNameMap)),
      lines: geometries.lines.map(getLineState(seriesNameMap)),
      bars: getBarsState(seriesNameMap, geometries.bars),
      annotations: getAnnotationsState(theme, annotations),
    };
  },
);

function getAxes(
  axesGeoms: AxisGeometry[],
  axesSpecs: AxisSpec[],
  gridLines: LinesGrid[],
  rotation: Rotation,
  locale: string,
): DebugStateAxes {
  return axesSpecs.reduce<DebugStateAxes>(
    (acc, { position, title, id }) => {
      const geom = axesGeoms.find(({ axis }) => axis.id === id);
      if (!geom) {
        return acc;
      }

      const isXAxis =
        (isHorizontalAxis(position) && isHorizontalRotation(rotation)) ||
        (isVerticalAxis(position) && isVerticalRotation(rotation));

      // sorted starting from the axis origin
      const sortingOrder = isHorizontalAxis(position)
        ? rotation === 0 || rotation === 90
          ? Predicate.NumAsc
          : Predicate.NumDesc
        : rotation === 0 || rotation === -90
          ? Predicate.NumDesc
          : Predicate.NumAsc;
      const visibleTicks = geom.visibleTicks
        .filter(({ label }) => label !== '')
        .sort(getPredicateFn(sortingOrder, locale, 'position'));

      const labels = visibleTicks.map(({ label }) => label);
      const values = visibleTicks.map(({ value }) => value);

      const gridlines = gridLines
        .flatMap(({ lineGroups }) => lineGroups.find(({ axisId }) => axisId === geom.axis.id)?.lines ?? [])
        .map(({ x1: x, y1: y }) => ({ x, y }));

      acc[isXAxis ? 'x' : 'y'].push({
        id,
        title,
        position,
        labels,
        values,
        gridlines,
      });

      return acc;
    },
    { x: [], y: [] },
  );
}

function getBarsState(
  seriesNameMap: Map<string, string>,
  barGeometries: Array<PerPanel<BarGeometry[]>>,
): DebugStateBar[] {
  const buckets = new Map<string, DebugStateBar>();
  const bars = barGeometries.reduce<BarGeometry[]>((acc, { value }) => {
    return acc.concat(value);
  }, []);
  bars.forEach(
    ({
      color,
      seriesIdentifier: { key },
      seriesStyle: { rect, rectBorder },
      value: { x, y, mark },
      displayValue,
    }: BarGeometry) => {
      const label = displayValue?.text;
      const name = seriesNameMap.get(key) ?? '';
      const bucket: DebugStateBar = buckets.get(key) ?? {
        key,
        name,
        color,
        bars: [],
        labels: [],
        visible: hasVisibleStyle(rect) || hasVisibleStyle(rectBorder),
      };

      bucket.bars.push({ x, y, mark });

      if (label) {
        bucket.labels.push(label);
      }

      buckets.set(key, bucket);

      return buckets;
    },
  );

  return [...buckets.values()];
}

function getLineState(seriesNameMap: Map<string, string>) {
  return ({
    value: {
      line: path,
      points,
      color,
      seriesIdentifier: { key },
      style,
    },
  }: PerPanel<LineGeometry>): DebugStateLine => {
    const name = seriesNameMap.get(key) ?? '';

    return {
      path,
      color,
      key,
      name,
      visible: hasVisibleStyle(style.line),
      visiblePoints: hasVisibleStyle(style.point),
      points: points.map(({ value: { x, y, mark } }) => ({ x, y, mark })),
    };
  };
}

function getAreaState(seriesNameMap: Map<string, string>) {
  return ({
    value: {
      area: path,
      lines,
      points,
      color,
      seriesIdentifier: { key },
      style,
    },
  }: PerPanel<AreaGeometry>): DebugStateArea => {
    const [y1Path = '', y0Path] = lines;
    const linePoints = points.reduce<{
      y0: DebugStateValue[];
      y1: DebugStateValue[];
    }>(
      (acc, { value: { accessor, ...value } }) => {
        if (accessor === BandedAccessorType.Y0) {
          acc.y0.push(value);
        } else {
          acc.y1.push(value);
        }

        return acc;
      },
      {
        y0: [],
        y1: [],
      },
    );
    const lineVisible = hasVisibleStyle(style.line);
    const visiblePoints = hasVisibleStyle(style.point);
    const name = seriesNameMap.get(key) ?? '';

    return {
      path,
      color,
      key,
      name,
      visible: hasVisibleStyle(style.area),
      lines: {
        y0: y0Path
          ? {
              visible: lineVisible,
              path: y0Path,
              points: linePoints.y0,
              visiblePoints,
            }
          : undefined,
        y1: {
          visible: lineVisible,
          path: y1Path,
          points: linePoints.y1,
          visiblePoints,
        },
      },
    };
  };
}

/**
 * returns series key to name mapping
 */
function getSeriesNameMap(legendItems: LegendItem[]): Map<string, string> {
  return legendItems.reduce((acc, { label: name, seriesIdentifiers }) => {
    seriesIdentifiers.forEach(({ key }) => {
      acc.set(key, name);
    });
    return acc;
  }, new Map<string, string>());
}

function getLegendState(legendItems: LegendItem[]): DebugStateLegend {
  const items = legendItems
    .filter(({ isSeriesHidden }) => !isSeriesHidden)
    .flatMap(({ label: name, color, seriesIdentifiers }) => {
      return seriesIdentifiers.map(({ key }) => ({
        key,
        name,
        color,
      }));
    });

  return { items };
}

function getAnnotationsState(
  { lineAnnotation, rectAnnotation }: Theme,
  annotationSpecs: AnnotationSpec[],
): DebugStateAnnotations[] {
  return annotationSpecs.flatMap<DebugStateAnnotations>((annotation) => {
    return annotation.dataValues.map((dataValue) => ({
      data: dataValue,
      id: annotation.id,
      style:
        annotation.annotationType === AnnotationType.Line
          ? mergeWithDefaultAnnotationLine(lineAnnotation, annotation?.style)
          : mergeWithDefaultAnnotationRect(rectAnnotation, annotation?.style),
      type: annotation.annotationType,
      domainType: annotation.annotationType === AnnotationType.Line ? annotation.domainType : undefined,
    }));
  });
}

/**
 * Returns true for styles if they are visible
 * Serves as a catchall for multiple style types
 */
function hasVisibleStyle({
  visible = true,
  fill = '#fff',
  stroke = '#fff',
  strokeWidth = 1,
  opacity = 1,
}: Partial<StrokeStyle & (Visible | { visible: 'auto' | 'never' | 'always' }) & FillStyle & Opacity>): boolean {
  return Boolean(
    (visible === 'always' || visible === 'auto' || visible === true) &&
      opacity > 0 &&
      // strokeWidth > 0 &&
      fill &&
      stroke,
  );
}
