/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ReactNode } from 'react';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ChartType } from '../chart_types';
import type { AnnotationLineProps } from '../chart_types/xy_chart/annotations/line/types';
import type { AnnotationMarker } from '../chart_types/xy_chart/annotations/types';
import { computeAnnotationDimensionsSelector } from '../chart_types/xy_chart/state/selectors/compute_annotations';
import { computeChartLayoutSelector } from '../chart_types/xy_chart/state/selectors/compute_chart_layout';
import { DEFAULT_FONT_FAMILY } from '../common/default_theme_attributes';
import { cssFontShorthand } from '../common/text_utils';
import { baselineOffset, fontAttributes } from '../renderers/svg/text';
import type { GlobalChartState } from '../state/chart_state';
import { getChartContainerDimensionsSelector } from '../state/selectors/get_chart_container_dimensions';
import { clamp, Position, renderWithProps } from '../utils/common';
import type { Dimensions } from '../utils/dimensions';

/** `.echAnnotation__marker`: 12px bold text on a normal line height */
const FONT_SIZE = 12;
const LINE_HEIGHT = 14;
const FONT = cssFontShorthand(
  { fontFamily: DEFAULT_FONT_FAMILY, fontStyle: 'normal', fontVariant: 'normal', fontWeight: 700 },
  FONT_SIZE,
);
const DEFAULT_ICON_SIZE = 16;

/** the CSS transform that centres a marker without explicit dimensions on its anchor, in fractions of its size */
const CENTRING: Record<Position, [number, number]> = {
  [Position.Right]: [0, -0.5],
  [Position.Left]: [-1, -0.5],
  [Position.Top]: [-0.5, -1],
  [Position.Bottom]: [-0.5, 0],
};

interface Content {
  width: number;
  height: number;
  draw: (x: number, y: number, color: string) => ReactNode;
}

/**
 * The line annotation markers (icon and body) as SVG elements in chart content coordinates.
 * An icon that renders an `<svg>` is nested as is; any other content is drawn as its text.
 * @internal
 */
export function getSvgMarkers(
  state: GlobalChartState,
  measureWidth: (text: string, font: string) => number,
): ReactNode[] {
  if (state.chartType !== ChartType.XYAxis) return [];
  const { chartDimensions } = computeChartLayoutSelector(state).dimensions;
  const bounds = getChartContainerDimensionsSelector(state);
  const lines = [...computeAnnotationDimensionsSelector(state).values()]
    .flat()
    .filter((d): d is AnnotationLineProps => 'markers' in d);

  return lines.flatMap(({ id, datum, panel, markers }) =>
    markers.map((marker, index) => {
      const icon = toContent(renderWithProps(marker.icon, datum), measureWidth);
      const body = marker.body ? toContent(renderWithProps(marker.body, datum), measureWidth) : null;
      const anchorX = chartDimensions.left + panel.left + marker.position.left;
      const anchorY = chartDimensions.top + panel.top + marker.position.top;
      const [fx, fy] = marker.dimension ? [0, 0] : CENTRING[marker.alignment];
      const iconX = anchorX + fx * icon.width;
      const iconY = anchorY + fy * icon.height;
      return (
        // eslint-disable-next-line react/no-array-index-key
        <g key={`${id}-${index}`} className="echAnnotation__marker">
          {icon.draw(iconX, iconY, marker.color)}
          {body && drawBody(body, marker, iconX, iconY, icon, bounds)}
        </g>
      );
    }),
  );
}

/** places the body next to the icon on the marker's side, shifted along that side to stay inside the chart, as the popper does */
function drawBody(
  body: Content,
  { alignment, color }: AnnotationMarker,
  x: number,
  y: number,
  icon: Content,
  bounds: Dimensions,
) {
  const centreX = clamp(x + (icon.width - body.width) / 2, bounds.left, bounds.left + bounds.width - body.width);
  const centreY = clamp(y + (icon.height - body.height) / 2, bounds.top, bounds.top + bounds.height - body.height);
  switch (alignment) {
    case Position.Top:
      return body.draw(centreX, y - body.height, color);
    case Position.Left:
      return body.draw(x - body.width, centreY, color);
    case Position.Right:
      return body.draw(x + icon.width, centreY, color);
    default:
      return body.draw(centreX, y + icon.height, color);
  }
}

function toContent(node: ReactNode, measureWidth: (text: string, font: string) => number): Content {
  const markup = renderToStaticMarkup(<>{node}</>).trim();
  if (markup.startsWith('<svg')) {
    const openingTag = markup.slice(0, markup.indexOf('>'));
    const width = numericAttribute(openingTag, 'width') ?? DEFAULT_ICON_SIZE;
    const height = numericAttribute(openingTag, 'height') ?? DEFAULT_ICON_SIZE;
    return {
      width,
      height,
      draw: (x, y, color) => (
        <g
          transform={`translate(${x} ${y})`}
          color={color}
          fill={color}
          // the icon's own markup, rendered by React from the marker the chart was given
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: markup }}
        />
      ),
    };
  }

  const text = decodeEntities(markup.replaceAll(/<[^>]*>/g, ''));
  return {
    width: text ? measureWidth(text, FONT) : 0,
    height: text ? LINE_HEIGHT : 0,
    draw: (x, y, color) =>
      text && (
        <text x={x} y={y + LINE_HEIGHT / 2} dy={baselineOffset(FONT, 'middle')} {...fontAttributes(FONT)} fill={color}>
          {text}
        </text>
      ),
  };
}

function numericAttribute(tag: string, name: string): number | undefined {
  const value = Number.parseFloat(new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1] ?? '');
  return Number.isFinite(value) ? value : undefined;
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#x27': "'", '#39': "'", nbsp: ' ' };

function decodeEntities(text: string): string {
  return text.replaceAll(/&(#x27|#39|amp|lt|gt|quot|nbsp);/g, (_, entity: string) => ENTITIES[entity] ?? '');
}
