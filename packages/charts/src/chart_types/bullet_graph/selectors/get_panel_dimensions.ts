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
import { ChromaColorScale, Color } from '../../../common/colors';
import { Rect } from '../../../geoms/types';
import { createCustomCachedSelector } from '../../../state/create_selector';
import { getChartThemeSelector } from '../../../state/selectors/get_chart_theme';
import { getResolvedBackgroundColorSelector } from '../../../state/selectors/get_resolved_background_color';
import { isWithinRange } from '../../../utils/common';
import { Size } from '../../../utils/dimensions';
import { GenericDomain, Range } from '../../../utils/domain';
import { Point } from '../../../utils/point';
import { ANGULAR_TICK_INTERVAL, TICK_INTERVAL } from '../renderer/canvas/constants';
import { BulletDatum, BulletGraphSpec, BulletGraphSubtype } from '../spec';
import { BulletGraphStyle, GRAPH_PADDING } from '../theme';
import { getAngledChartSizing, getAnglesBySize } from '../utils/angular';
import { ColorTick, getColorBands } from '../utils/color';
import { TickOptions, getTicks } from '../utils/ticks';

/** @internal */
export type BulletPanelDimensions = {
  graphArea: {
    size: Size;
    origin: Point;
    center: Point;
  };
  scale: ScaleLinear<number, number>;
  ticks: number[];
  colorScale: ChromaColorScale;
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
          height: panel.height - verticalAlignment.headerHeight,
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
  { ticks: desiredTicks, domain, niceDomain }: BulletDatum,
  { colorBands: defaultColorBandsConfig, fallbackBandColor }: BulletGraphStyle,
  backgroundColor: Color,
): Pick<BulletPanelDimensions, 'scale' | 'colorScale' | 'colorBands' | 'ticks'> {
  switch (subtype) {
    case BulletGraphSubtype.circle:
    case BulletGraphSubtype.halfCircle:
    case BulletGraphSubtype.twoThirdsCircle: {
      const [startAngle, endAngle] = getAnglesBySize(subtype);
      const { radius } = getAngledChartSizing(graphSize, subtype);

      const { scale, ticks } = getScaleWithTicks(domain, [startAngle, endAngle], {
        rangeMultiplier: radius,
        desiredTicks,
        nice: niceDomain,
        interval: ANGULAR_TICK_INTERVAL,
      });

      const { bands: colorBands, scale: colorScale } = getColorBands(
        scale,
        colorBandsConfig ?? defaultColorBandsConfig,
        ticks,
        backgroundColor,
        fallbackBandColor,
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
      const { scale, ticks } = getScaleWithTicks(domain, [0, paddedWidth], {
        desiredTicks,
        nice: niceDomain,
        interval: TICK_INTERVAL,
      });

      const { bands: colorBands, scale: colorScale } = getColorBands(
        scale,
        colorBandsConfig ?? defaultColorBandsConfig,
        ticks,
        backgroundColor,
        fallbackBandColor,
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
      const { scale, ticks } = getScaleWithTicks(domain, [0, paddedHeight], {
        desiredTicks,
        nice: niceDomain,
        interval: TICK_INTERVAL,
      });

      const { bands: colorBands, scale: colorScale } = getColorBands(
        scale,
        colorBandsConfig ?? defaultColorBandsConfig,
        ticks,
        backgroundColor,
        fallbackBandColor,
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

function getScaleWithTicks(domain: GenericDomain, range: Range, tickOptions: TickOptions) {
  let scale = scaleLinear().domain(domain).range(range);
  const scaleRange: Range = scale.range() as Range;
  const ticks = getTicks(Math.abs(scaleRange[1] - scaleRange[0]) * (tickOptions.rangeMultiplier || 1), tickOptions);
  const customRange = typeof ticks !== 'number';

  if (tickOptions.nice) {
    scale = scale.nice(customRange ? undefined : ticks);
  }

  const updatedDomain = scale.domain() as GenericDomain;

  return {
    scale,
    ticks: customRange ? ticks(updatedDomain).filter(isWithinRange(updatedDomain)) : scale.ticks(ticks),
  };
}
