/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { LegendItem } from '../../../../common/legend';
import { AxisSpec } from '../../../../specs';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import {
  DebugState,
  DebugStateArea,
  DebugStateAxes,
  DebugStateBar,
  DebugStateLegend,
  DebugStateLine,
  DebugStateValue,
} from '../../../../state/types';
import { AreaGeometry, BandedAccessorType, BarGeometry, LineGeometry, PerPanel } from '../../../../utils/geometry';
import { FillStyle, Opacity, StrokeStyle, Visible } from '../../../../utils/themes/theme';
import { isHorizontalAxis } from '../../utils/axis_type_utils';
import { AxisGeometry } from '../../utils/axis_utils';
import { LinesGrid } from '../../utils/grid_lines';
import { computeAxesGeometriesSelector } from './compute_axes_geometries';
import { computeLegendSelector } from './compute_legend';
import { computeSeriesGeometriesSelector } from './compute_series_geometries';
import { computeGridLinesSelector } from './get_grid_lines';
import { getAxisSpecsSelector } from './get_specs';

/**
 * Returns a stringified version of the `debugState`
 * @internal
 */
export const getDebugStateSelector = createCustomCachedSelector(
  [
    computeSeriesGeometriesSelector,
    computeLegendSelector,
    computeAxesGeometriesSelector,
    computeGridLinesSelector,
    getAxisSpecsSelector,
  ],
  ({ geometries }, legend, axes, gridLines, axesSpecs): DebugState => {
    const seriesNameMap = getSeriesNameMap(legend);

    return {
      legend: getLegendState(legend),
      axes: getAxes(axes, axesSpecs, gridLines),
      areas: geometries.areas.map(getAreaState(seriesNameMap)),
      lines: geometries.lines.map(getLineState(seriesNameMap)),
      bars: getBarsState(seriesNameMap, geometries.bars),
    };
  },
);

function getAxes(axesGeoms: AxisGeometry[], axesSpecs: AxisSpec[], gridLines: LinesGrid[]): DebugStateAxes {
  return axesSpecs.reduce<DebugStateAxes>(
    (acc, { position, title, id }) => {
      const geom = axesGeoms.find(({ axis }) => axis.id === id);
      if (!geom) {
        return acc;
      }

      const visibleTicks = geom.visibleTicks.filter(({ label }) => label !== '');
      const labels = visibleTicks.map(({ label }) => label);
      const values = visibleTicks.map(({ value }) => value);

      const gridlines = gridLines
        .flatMap(({ lineGroups }) => lineGroups.find(({ axisId }) => axisId === geom.axis.id)?.lines ?? [])
        .map(({ x1: x, y1: y }) => ({ x, y }));

      acc[isHorizontalAxis(position) ? 'x' : 'y'].push({
        id,
        title,
        position,
        ...(isHorizontalAxis(position)
          ? { labels, values, gridlines }
          : { labels: labels.reverse(), values: values.reverse(), gridlines: gridlines.reverse() }),
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
  const bars = barGeometries.reduce<BarGeometry[]>((acc, bars) => {
    return [...acc, ...bars.value];
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
      seriesLineStyle,
      seriesPointStyle,
    },
  }: PerPanel<LineGeometry>): DebugStateLine => {
    const name = seriesNameMap.get(key) ?? '';

    return {
      path,
      color,
      key,
      name,
      visible: hasVisibleStyle(seriesLineStyle),
      visiblePoints: hasVisibleStyle(seriesPointStyle),
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
      seriesAreaStyle,
      seriesPointStyle,
      seriesAreaLineStyle,
    },
  }: PerPanel<AreaGeometry>): DebugStateArea => {
    const [y1Path, y0Path] = lines;
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
    const lineVisible = hasVisibleStyle(seriesAreaLineStyle);
    const visiblePoints = hasVisibleStyle(seriesPointStyle);
    const name = seriesNameMap.get(key) ?? '';

    return {
      path,
      color,
      key,
      name,
      visible: hasVisibleStyle(seriesAreaStyle),
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
    .map(({ label: name, color, seriesIdentifiers }) => {
      return seriesIdentifiers.map(({ key }) => ({
        key,
        name,
        color,
      }));
    })
    .flat();

  return { items };
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
}: Partial<StrokeStyle & Visible & FillStyle & Opacity>): boolean {
  return Boolean(visible && opacity > 0 && strokeWidth > 0 && fill && stroke);
}
