/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ScaleLinear, scaleLinear } from 'd3-scale';

import { getBulletSpec } from './get_bullet_spec';
import { BulletGraphLayout, BulletHeaderLayout, getLayout } from './get_layout';
import { Color } from '../../../common/colors';
import { Rect } from '../../../geoms/types';
import { createCustomCachedSelector } from '../../../state/create_selector';
import { getChartThemeSelector } from '../../../state/selectors/get_chart_theme';
import { getResolvedBackgroundColorSelector } from '../../../state/selectors/get_resolved_background_color';
import { Size } from '../../../utils/dimensions';
import { Point } from '../../../utils/point';
import { ANGULAR_TICK_INTERVAL, TICK_INTERVAL } from '../renderer/canvas/constants';
import { BulletDatum, BulletGraphSpec, BulletGraphSubtype } from '../spec';
import {
  BulletGraphStyle,
  GRAPH_PADDING,
  HEADER_PADDING,
  SUBTITLE_LINE_HEIGHT,
  TITLE_LINE_HEIGHT,
  VALUE_LINE_HEIGHT,
} from '../theme';
import { getAngledChartSizing, getAnglesBySize } from '../utils/angular';
import { ColorTick, getColorBands } from '../utils/color';

/** @internal */
export type BulletPanelDimensions = {
  graphArea: {
    size: Size;
    origin: Point;
    center: Point;
  };
  scale: ScaleLinear<number, number>;
  ticks: number[];
  colorScale: chroma.Scale<chroma.Color>;
  colorBands: ColorTick[];
  panel: Rect;
} & Omit<BulletHeaderLayout, 'panel'>;

/** @internal */
export type BulletDimensions = {
  rows: (BulletPanelDimensions | null)[][];
  panel: Size;
} & Pick<BulletGraphLayout, 'layoutAlignment' | 'shouldRenderMetric'>;

/** @internal */
export const getPanelDimensions = createCustomCachedSelector(
  [getLayout, getBulletSpec, getChartThemeSelector, getResolvedBackgroundColorSelector],
  (
    { shouldRenderMetric, headerLayout, layoutAlignment, panel: panelSize },
    spec,
    { bulletGraph: bulletGraphStyles },
    backgroundColor,
  ): BulletDimensions => {
    if (shouldRenderMetric)
      return {
        rows: [],
        panel: { width: 0, height: 0 },
        layoutAlignment,
        shouldRenderMetric,
      };

    const rows = headerLayout.map((row, rowIndex) => {
      return row.map((bulletGraph, columnIndex): BulletPanelDimensions | null => {
        if (!bulletGraph) return null;
        const { panel, multiline, datum, ...rest } = bulletGraph;
        const verticalAlignment = layoutAlignment[rowIndex]!;

        const graphSize = {
          width: panel.width,
          height:
            panel.height -
            HEADER_PADDING.top -
            verticalAlignment.maxTitleRows * TITLE_LINE_HEIGHT -
            verticalAlignment.maxSubtitleRows * SUBTITLE_LINE_HEIGHT -
            (multiline ? VALUE_LINE_HEIGHT : 0) -
            HEADER_PADDING.bottom,
        };

        return {
          ...rest,
          ...getSubtypeDimensions(spec, graphSize, datum, bulletGraphStyles, backgroundColor),
          datum,
          multiline,
          graphArea: {
            size: graphSize,
            origin: {
              x: 0,
              y: panel.height - graphSize.height,
            },
            center: {
              x: graphSize.width / 2 - GRAPH_PADDING.left,
              y: graphSize.height / 2 - GRAPH_PADDING.top,
            },
          },
          panel: {
            x: panel.width * columnIndex,
            y: panel.height * rowIndex,
            ...panel,
          },
        };
      });
    });

    return {
      rows,
      panel: panelSize,
      layoutAlignment,
      shouldRenderMetric,
    };
  },
);

function getSubtypeDimensions(
  { subtype, colorBands: colorBandsConfig }: BulletGraphSpec,
  graphSize: Size,
  { domain }: BulletDatum,
  { colorBands: defaultColorBandsConfig }: BulletGraphStyle,
  backgroundColor: Color,
): Pick<BulletPanelDimensions, 'scale' | 'colorScale' | 'colorBands' | 'ticks'> {
  switch (subtype) {
    case BulletGraphSubtype.circle:
    case BulletGraphSubtype.halfCircle:
    case BulletGraphSubtype.twoThirdsCircle: {
      const [startAngle, endAngle] = getAnglesBySize(subtype);
      const scale = scaleLinear().domain(domain).range([startAngle, endAngle]);
      const { radius } = getAngledChartSizing(graphSize, subtype);

      const {
        bands: colorBands,
        scale: colorScale,
        ticks,
      } = getColorBands(
        scale,
        Math.abs(startAngle - endAngle) * radius,
        colorBandsConfig ?? defaultColorBandsConfig,
        ANGULAR_TICK_INTERVAL,
        backgroundColor,
      );

      return {
        scale,
        ticks,
        colorBands,
        colorScale,
      };
    }

    case BulletGraphSubtype.horizontal: {
      const paddedWidth = graphSize.width - GRAPH_PADDING.left - GRAPH_PADDING.right;
      const scale = scaleLinear().domain(domain).range([0, paddedWidth]);
      const {
        bands: colorBands,
        scale: colorScale,
        ticks,
      } = getColorBands(
        scale,
        paddedWidth,
        colorBandsConfig ?? defaultColorBandsConfig,
        TICK_INTERVAL,
        backgroundColor,
      );

      return {
        scale,
        ticks,
        colorBands,
        colorScale,
      };
    }

    case BulletGraphSubtype.vertical: {
      const paddedHeight = graphSize.height - GRAPH_PADDING.bottom - GRAPH_PADDING.top;
      const scale = scaleLinear().domain(domain).range([0, paddedHeight]);

      const {
        bands: colorBands,
        scale: colorScale,
        ticks,
      } = getColorBands(
        scale,
        paddedHeight,
        colorBandsConfig ?? defaultColorBandsConfig,
        TICK_INTERVAL,
        backgroundColor,
      );

      return {
        scale,
        ticks,
        colorBands,
        colorScale,
      };
    }

    default:
      throw new Error('Unknown Bullet subtype');
  }
}
