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
import { sortNumbers } from '../../../utils/common';
import { Size } from '../../../utils/dimensions';
import { ContinuousDomain } from '../../../utils/domain';
import { Point } from '../../../utils/point';
import { ANGULAR_TICK_INTERVAL, TICK_INTERVAL } from '../renderer/canvas/constants';
import { getColorBandSizes } from '../renderer/canvas/sub_types/common';
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

/** @internal */
export type BulletPanelDimensions = {
  graphArea: {
    size: Size;
    origin: Point;
    center: Point;
  };
  scale: ScaleLinear<number, number>;
  colorScale: (value: number, continuous?: boolean) => string;
  panel: Rect;
} & Omit<BulletHeaderLayout, 'panel'>;

/** @internal */
export type BulletDimensions = {
  rows: (BulletPanelDimensions | null)[][];
  panel: Size;
} & Pick<BulletGraphLayout, 'layoutAlignment' | 'shouldRenderMetric'>;

/** @internal */
export const getPanelDimensions = createCustomCachedSelector(
  [getLayout, getBulletSpec, getChartThemeSelector],
  (
    { shouldRenderMetric, headerLayout, layoutAlignment, panel: panelSize },
    spec,
    { bulletGraph: bulletGraphStyles },
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
      panel: panelSize,
      layoutAlignment,
      shouldRenderMetric,
    };
  },
);

function getScalesBySubtype(
  { subtype }: BulletGraphSpec,
  graphSize: Size,
  { domain }: BulletDatum,
  { bandColors }: BulletGraphStyle,
): Pick<BulletPanelDimensions, 'scale' | 'colorScale'> {
  const [start, end] = domain;
  const [min, max] = sortNumbers(domain) as ContinuousDomain;
  switch (subtype) {
    case BulletGraphSubtype.circle:
    case BulletGraphSubtype.halfCircle:
    case BulletGraphSubtype.twoThirdsCircle: {
      const [startAngle, endAngle] = getAnglesBySize(subtype);
      const scale = scaleLinear().domain(domain).range([startAngle, endAngle]);
      const { radius } = getAngledChartSizing(graphSize, subtype);
      const totalDomainArc = Math.abs(end - start);
      const { colorTicks, colorBandSizeValue } = getColorBandSizes(
        Math.abs(startAngle - endAngle) * radius,
        ANGULAR_TICK_INTERVAL,
        scale,
        totalDomainArc,
      );

      return {
        scale,
        colorScale: getDiscreteColorScale([min, max], bandColors, colorTicks, colorBandSizeValue),
      };
    }

    case BulletGraphSubtype.horizontal: {
      const paddedWidth = graphSize.width - GRAPH_PADDING.left - GRAPH_PADDING.right;
      const scale = scaleLinear().domain(domain).range([0, paddedWidth]);
      const { colorTicks, colorBandSizeValue } = getColorBandSizes(paddedWidth, TICK_INTERVAL, scale);

      return {
        scale,
        colorScale: getDiscreteColorScale(domain, bandColors, colorTicks, colorBandSizeValue),
      };
    }

    case BulletGraphSubtype.vertical: {
      const paddedHeight = graphSize.height - GRAPH_PADDING.bottom - GRAPH_PADDING.top;
      const scale = scaleLinear().domain(domain).range([0, paddedHeight]);
      const { colorTicks, colorBandSizeValue } = getColorBandSizes(paddedHeight, TICK_INTERVAL, scale);

      return {
        scale,
        colorScale: getDiscreteColorScale(domain, bandColors, colorTicks, colorBandSizeValue),
      };
    }

    default:
      throw new Error('Unknown Bullet subtype');
  }
}

function getDiscreteColorScale(
  domain: BulletDatum['domain'],
  bandColors: BulletGraphStyle['bandColors'],
  colorTicks: number[],
  colorBandSizeValue: number,
): BulletPanelDimensions['colorScale'] {
  const continuosScale = scaleLinear()
    .domain(domain)
    // @ts-ignore - range derived from strings
    .range(bandColors);

  return (value, continuous = false) => {
    if (continuous) return `${continuosScale(value)}`;

    const tickIndex = Math.floor(value / colorBandSizeValue);
    const tickValue = colorTicks[tickIndex];

    return `${continuosScale(tickValue ?? colorTicks.at(tickIndex > colorTicks.length ? 0 : -1) ?? NaN)}`;
  };
}
