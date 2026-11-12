/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ShapeRendererFn } from '../chart_types/xy_chart/renderer/shapes_paths';
import { DEFAULT_FONT_FAMILY } from '../common/default_theme_attributes';
import type { LegendItem } from '../common/legend';
import { cssFontShorthand } from '../common/text_utils';
import { LEGEND_HIERARCHY_MARGIN } from '../components/legend/constants';
import type { Painter } from '../renderers/painter';
import type { GlobalChartState } from '../state/chart_state';
import { getChartContainerDimensionsSelector } from '../state/selectors/get_chart_container_dimensions';
import { getChartThemeSelector } from '../state/selectors/get_chart_theme';
import { getInternalChartStateSelector } from '../state/selectors/get_internal_chart_state';
import { getInternalMainProjectionAreaSelector } from '../state/selectors/get_internal_main_projection_area';
import { getLegendConfigSelector } from '../state/selectors/get_legend_config_selector';
import { getLegendItemsSelector } from '../state/selectors/get_legend_items';
import { getLegendSizeSelector } from '../state/selectors/get_legend_size';
import { clamp, getColorFromVariant, LayoutDirection, Position } from '../utils/common';
import { PointShape } from '../utils/themes/theme';

/** the legend's CSS metrics: 12px text on a 1.5 line height, 2px row padding, a 16px swatch and 4px gaps */
const FONT_SIZE = 12;
const ROW_HEIGHT = 22;
const SWATCH_SIZE = 16;
const MARKER_SIZE = 8;
const GAP = 4;
/** horizontal legends: 8px between rows and around the list, 8px before each item */
const HORIZONTAL_PADDING = 8;
/** floating legends sit this far inside the plot area */
const INSIDE_PADDING = 10;
const HIDDEN_SERIES_OPACITY = 0.5;

const LABEL_FONT = cssFontShorthand(
  { fontFamily: DEFAULT_FONT_FAMILY, fontStyle: 'normal', fontVariant: 'normal', fontWeight: 400 },
  FONT_SIZE,
);

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Where the legend goes in the exported SVG and how it draws itself, mirroring the HTML legend's
 * layout: the stage is shifted when the legend sits left of or above it.
 * @internal
 */
export interface SvgLegend {
  stageOffset: { x: number; y: number };
  paint?: (painter: Painter) => void;
}

/** @internal */
export function getSvgLegend(state: GlobalChartState, measureWidth: (text: string, font: string) => number): SvgLegend {
  const config = getLegendConfigSelector(state);
  const items = getLegendItemsSelector(state).filter(({ isItemHidden }) => !isItemHidden);
  if (!config.showLegend || config.customLegend || items.length === 0 || !getInternalChartStateSelector(state)) {
    return { stageOffset: { x: 0, y: 0 } };
  }

  const theme = getChartThemeSelector(state);
  const size = getLegendSizeSelector(state);
  const container = getChartContainerDimensionsSelector(state);
  const { width: chartWidth } = state.parentDimensions;
  const { direction, floating, floatingColumns, hAlign, vAlign } = config.legendPosition;
  const vertical = direction === LayoutDirection.Vertical;
  const { margin } = size;

  const values = items.map(({ values: [first] }) => first?.label ?? '');
  const valueWidth = Math.max(0, ...values.map((value) => (value ? measureWidth(value, LABEL_FONT) : 0)));
  const naturalWidth = (item: LegendItem) =>
    item.depth * LEGEND_HIERARCHY_MARGIN +
    SWATCH_SIZE +
    GAP +
    measureWidth(item.label, LABEL_FONT) +
    (valueWidth > 0 ? GAP + valueWidth : 0);

  let box: Box;
  let columns: number;
  let columnWidth: number;
  let rowHeight = ROW_HEIGHT;
  let stageOffset = { x: 0, y: 0 };

  if (floating) {
    const plot = getInternalMainProjectionAreaSelector(state);
    if (vertical) {
      columns = clamp(floatingColumns ?? 1, 1, items.length);
      columnWidth = Math.max(...items.map(naturalWidth)) + theme.legend.spacingBuffer;
    } else {
      const available = plot.width - 2 * INSIDE_PADDING;
      columns = Math.max(1, Math.floor(available / theme.legend.verticalWidth));
      columnWidth = available / columns;
    }
    const width = columnWidth * columns;
    const height = Math.min(Math.ceil(items.length / columns) * rowHeight, plot.height);
    box = {
      x:
        hAlign === Position.Right && vertical
          ? plot.left + plot.width - INSIDE_PADDING - width
          : plot.left + INSIDE_PADDING,
      y: vAlign === Position.Bottom ? plot.top + plot.height - height : plot.top,
      width,
      height,
    };
  } else if (vertical) {
    const left = hAlign === Position.Left;
    stageOffset = { x: left ? size.width + 2 * margin : 0, y: 0 };
    box = {
      x: left ? margin : container.width + margin,
      y: theme.chartMargins.top,
      width: size.width,
      height: container.height - theme.chartMargins.top - theme.chartMargins.bottom,
    };
    columns = 1;
    columnWidth = size.width;
  } else {
    const top = vAlign === Position.Top;
    stageOffset = { x: 0, y: top ? size.height + 2 * margin : 0 };
    const { left, right } = theme.chartMargins;
    const available = chartWidth - left - right;
    columns = items.length === 1 ? 1 : Math.max(1, Math.floor(available / theme.legend.verticalWidth));
    columnWidth = available / columns;
    rowHeight = ROW_HEIGHT + HORIZONTAL_PADDING / 2;
    box = {
      x: left,
      y: (top ? margin : container.height + margin) + HORIZONTAL_PADDING / 2,
      width: available,
      height: size.height - HORIZONTAL_PADDING,
    };
  }

  const textColor = theme.axes.axisTitle.fill;
  const maxRows = Math.max(1, Math.floor(box.height / rowHeight));

  const paint = (painter: Painter) => {
    items.forEach((item, index) => {
      const row = Math.floor(index / columns);
      if (row >= maxRows) return;
      const x =
        box.x +
        (index % columns) * columnWidth +
        (vertical ? 0 : HORIZONTAL_PADDING) +
        item.depth * LEGEND_HIERARCHY_MARGIN;
      const y = box.y + row * rowHeight + ROW_HEIGHT / 2;
      const right = box.x + ((index % columns) + 1) * columnWidth;

      painter.save();
      if (item.isSeriesHidden) painter.globalAlpha = HIDDEN_SERIES_OPACITY;
      paintSwatch(painter, item, x + MARKER_SIZE, y);

      painter.font = LABEL_FONT;
      painter.textBaseline = 'middle';
      painter.fillStyle = textColor;
      const value = values[index] ?? '';
      const labelX = x + SWATCH_SIZE + GAP;
      const labelRight = value ? right - valueWidth - GAP : right;
      painter.textAlign = 'left';
      painter.fillText(
        truncate(item.label, labelRight - labelX, (text) => measureWidth(text, LABEL_FONT)),
        labelX,
        y,
      );
      if (value) {
        painter.textAlign = 'right';
        painter.fillText(value, right, y);
      }
      painter.restore();
    });
  };

  return { stageOffset, paint };
}

function paintSwatch(painter: Painter, { color, pointStyle }: LegendItem, cx: number, cy: number) {
  const {
    shape = PointShape.Circle,
    stroke = color,
    strokeWidth = 1,
    opacity = 1,
  } = pointStyle?.shape ? pointStyle : {};
  const [shapeFn, rotation] = ShapeRendererFn[shape];
  const d = shapeFn((MARKER_SIZE - strokeWidth) / 2);
  painter.save();
  painter.translate(cx, cy);
  painter.rotate((rotation * Math.PI) / 180);
  painter.globalAlpha *= opacity;
  painter.fillStyle = color;
  painter.fillPath(d);
  painter.strokeStyle = getColorFromVariant(color, stroke);
  painter.lineWidth = strokeWidth;
  painter.strokePath(d);
  painter.restore();
}

function truncate(text: string, maxWidth: number, measure: (candidate: string) => number): string {
  if (measure(text) <= maxWidth) return text;
  let low = 0;
  let high = text.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (measure(`${text.slice(0, mid)}…`) <= maxWidth) low = mid;
    else high = mid - 1;
  }
  return low === 0 ? '' : `${text.slice(0, low)}…`;
}
