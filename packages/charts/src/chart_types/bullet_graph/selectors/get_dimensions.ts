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
import { Rect } from '../../../geoms/types';
import { createCustomCachedSelector } from '../../../state/create_selector';
import { getChartThemeSelector } from '../../../state/selectors/get_chart_theme';
import { Size } from '../../../utils/dimensions';
import { Point } from '../../../utils/point';
import { BulletDatum, BulletGraphSpec, BulletGraphSubtype } from '../spec';
import {
  BulletGraphStyle,
  GRAPH_PADDING,
  HEADER_PADDING,
  SUBTITLE_LINE_HEIGHT,
  TITLE_LINE_HEIGHT,
  VALUE_LINE_HEIGHT,
} from '../theme';
import { getAnglesBySize } from '../utils/angular';

/** @internal */
export type BulletPanelDimensions = {
  graphArea: {
    size: Size;
    origin: Point;
    center: Point;
  };
  scale: ScaleLinear<number, number>;
  colorScale: ScaleLinear<number, number>;
  panel: Rect;
} & Omit<BulletHeaderLayout, 'panel'>;

/** @internal */
export type BulletDimensions = {
  rows: (BulletPanelDimensions | null)[][];
} & Pick<BulletGraphLayout, 'layoutAlignment' | 'shouldRenderMetric'>;

/** @internal */
export const getPanelDimensions = createCustomCachedSelector(
  [getLayout, getBulletSpec, getChartThemeSelector],
  (
    { shouldRenderMetric, headerLayout, layoutAlignment },
    spec,
    { bulletGraph: bulletGraphStyles },
  ): BulletDimensions => {
    if (shouldRenderMetric)
      return {
        rows: [],
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
          ...getScalesBySubtype(spec, graphSize, datum, bulletGraphStyles),
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
      layoutAlignment,
      shouldRenderMetric,
    };
  },
);

function getScalesBySubtype(
  { subtype, size, reverse }: BulletGraphSpec,
  graphSize: Size,
  { domain }: BulletDatum,
  { bandColors }: BulletGraphStyle,
): Pick<BulletPanelDimensions, 'scale' | 'colorScale'> {
  switch (subtype) {
    case BulletGraphSubtype.angular:
      const [startAngle, endAngle] = getAnglesBySize(size, reverse);

      return {
        scale: scaleLinear().domain([domain.min, domain.max]).range([startAngle, endAngle]),
        // @ts-ignore - range derived from strings
        colorScale: scaleLinear().domain([domain.min, domain.max]).range(bandColors),
      };

    case BulletGraphSubtype.horizontal:
      const paddedWidth = graphSize.width - GRAPH_PADDING.left - GRAPH_PADDING.right;

      return {
        scale: scaleLinear().domain([domain.min, domain.max]).range([0, paddedWidth]),
        // @ts-ignore - range derived from strings
        colorScale: scaleLinear().domain([domain.min, domain.max]).range(bandColors),
      };

    case BulletGraphSubtype.vertical:
      const paddedHeight = graphSize.height - GRAPH_PADDING.bottom - GRAPH_PADDING.top;

      return {
        scale: scaleLinear().domain([domain.min, domain.max]).range([0, paddedHeight]).clamp(true),
        // @ts-ignore - range derived from strings
        colorScale: scaleLinear().domain([domain.min, domain.max]).range(bandColors),
      };

    default:
      throw new Error('Unknown Bullet subtype');
  }
}
