/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ReactElement } from 'react';
import React, { cloneElement, isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { getSvgLegend } from './svg_legend';
import { getSvgMarkers } from './svg_markers';
import { getSvgMetric } from './svg_metric';
import { Colors } from '../common/colors';
import { Chart } from '../components/chart';
import type { ChartProps } from '../components/chart';
import type { SvgExportCollector } from '../components/svg_export_context';
import { SvgExportContext } from '../components/svg_export_context';
import { getMeasureContext } from '../renderers/svg/measure';
import { SvgPainter } from '../renderers/svg/painter';
import { svgNodesToReact } from '../renderers/svg/to_react';
import { getChartThemeSelector } from '../state/selectors/get_chart_theme';

const measureWidth = (text: string, font: string) => {
  const ctx = getMeasureContext();
  if (!ctx) return 0;
  ctx.font = font;
  return ctx.measureText(text).width;
};

/** @public */
export interface RenderChartToSVGOptions {
  /** the size to draw a chart at when its own `size` is not in pixels, such as a percentage */
  size?: { width: number; height: number };
}

/**
 * Renders a chart to a standalone SVG document in Node, without a DOM: the chart itself, its legend
 * and its line annotation markers, drawn as SVG elements so any SVG viewer shows them.
 *
 * The element is a `Chart`, or any tree that renders exactly one. The chart needs a `size` in pixels, or
 * `options.size`, and is drawn with the `svg` renderer when it is the element itself (set `renderer="svg"` otherwise). Custom legends are
 * not drawn; a marker icon that renders an `<svg>` is nested as is and any other marker content is
 * drawn as its text.
 *
 * ```ts
 * import { renderChartToSVGString } from '@elastic/charts/server';
 * const svg = renderChartToSVGString(<Chart size={{ width: 600, height: 300 }}>...</Chart>);
 * ```
 * @public
 */
export function renderChartToSVGString(chart: ReactElement, options: RenderChartToSVGOptions = {}): string {
  const collector: SvgExportCollector = { size: options.size, stores: new Set(), stages: [] };
  const element =
    isValidElement(chart) && chart.type === Chart
      ? cloneElement(chart as ReactElement<ChartProps>, { renderer: 'svg' })
      : chart;
  renderToStaticMarkup(<SvgExportContext.Provider value={collector}>{element}</SvgExportContext.Provider>);

  if (collector.stores.size === 0) throw new Error('renderChartToSVGString expects a <Chart> element');
  if (collector.stores.size > 1)
    throw new Error('renderChartToSVGString draws a single chart, the element has several');
  const [store] = collector.stores;
  const state = store!.getState();
  const { width, height } = state.parentDimensions;
  if (width <= 0 || height <= 0) throw new Error('renderChartToSVGString needs a Chart with a size in pixels');

  const theme = getChartThemeSelector(state);
  const legend = getSvgLegend(state, measureWidth);
  const legendPainter = new SvgPainter({ width, height, idPrefix: `${state.chartId}-legend` });
  legend.paint?.(legendPainter);
  const { x, y } = legend.stageOffset;
  const background = theme.background.color;

  return renderToStaticMarkup(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      strokeMiterlimit={10}
    >
      {background !== Colors.Transparent.keyword && <rect width={width} height={height} fill={background} />}
      <g transform={x || y ? `translate(${x} ${y})` : undefined}>
        {collector.stages.map(({ nodes }, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <g key={index}>{svgNodesToReact(nodes)}</g>
        ))}
        {getSvgMetric(state, measureWidth)}
        {getSvgMarkers(state, measureWidth)}
      </g>
      {svgNodesToReact(legendPainter.nodes())}
    </svg>,
  );
}
