/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { DEFAULT_FONT_FAMILY } from '../common/default_theme_attributes';
import type { LegendItem } from '../common/legend';
import { LegendValue, legendValueTitlesMap, shouldDisplayTable } from '../common/legend';
import { LEGEND_HIERARCHY_MARGIN } from '../components/legend/constants';
import { getLegendPositionConfig } from '../components/legend/position_style';
import { withContext } from '../renderers/canvas';
import type { GlobalChartState } from '../state/chart_state';
import { getChartThemeSelector } from '../state/selectors/get_chart_theme';
import { getInternalMainProjectionAreaSelector } from '../state/selectors/get_internal_main_projection_area';
import { getLegendConfigSelector } from '../state/selectors/get_legend_config_selector';
import { getLegendItemsSelector } from '../state/selectors/get_legend_items';
import type { LegendSizing } from '../state/selectors/get_legend_size';
import { getLegendSizeSelector, MARKER_WIDTH, TOP_MARGIN } from '../state/selectors/get_legend_size';
import { LayoutDirection, Position } from '../utils/common';

// Mirrors the sizes the legend size selector assumes for the HTML legend.
const FONT_SIZE = 12;
const FONT = `${FONT_SIZE}px ${DEFAULT_FONT_FAMILY}`;
const ROW_HEIGHT = FONT_SIZE * 1.5 + 8;
const MARKER_RADIUS = 4;
const LABEL_GAP = 4;
const ELLIPSIS = '…';

// Mirrors the HTML legend table: 12px text at 1.34 line height, 4px by 8px cell padding, a 10px
// color column and a bottom border on every cell.
const HEADER_FONT = `600 ${FONT}`;
const CELL_PADDING = { height: 4, width: 8 };
const TABLE_ROW_HEIGHT = Math.ceil(FONT_SIZE * 1.34) + CELL_PADDING.height * 2 + 1;
const COLOR_COLUMN_WIDTH = 10;
const TABLE_BORDER_COLOR = '#D3DAE6';

// Mirrors `_legend_item.scss`, `_legend_grid_list.scss`, `_legend_list.scss` and `style_utils.ts`:
// 18px label lines, a 4px margin before each item part, the horizontal grid list (24px column gap,
// 8px row gap and margins), the horizontal list layout (24px rows) and the 10px inset of a
// floating legend.
const LINE_HEIGHT = FONT_SIZE * 1.5;
const ITEM_MARGIN = 4;
const GRID_COLUMN_GAP = 24;
const LEGEND_ROW_GAP = 8;
const LIST_ROW_HEIGHT = 16 + LEGEND_ROW_GAP;
const LIST_VALUE_GAP = 8;
const FLOATING_INSET = 10;
const LIST_VALUE_TITLE_FONT = `bold ${FONT}`;

const fitLabel = (ctx: CanvasRenderingContext2D, label: string, maxWidth: number) => {
  if (ctx.measureText(label).width <= maxWidth) return label;
  let end = label.length;
  while (end > 0 && ctx.measureText(`${label.slice(0, end)}${ELLIPSIS}`).width > maxWidth) end--;
  return `${label.slice(0, end)}${ELLIPSIS}`;
};

/**
 * Splits a label into the lines the HTML legend shows: one truncated line for `maxLines` 1, else
 * words wrapped to `maxWidth` (long words broken), clamped to `maxLines` lines unless it is 0.
 */
const wrapLabel = (ctx: CanvasRenderingContext2D, label: string, maxWidth: number, maxLines: number) => {
  if (maxLines === 1) return [fitLabel(ctx, label, maxWidth)];
  const fits = (text: string) => ctx.measureText(text).width <= maxWidth;
  const lines: string[] = [];
  let line = '';
  label.split(/(?<=\s)/).forEach((word) => {
    if (fits(`${line}${word}`.trimEnd())) {
      line = `${line}${word}`;
      return;
    }
    if (line) lines.push(line.trimEnd());
    line = '';
    [...word].forEach((char) => {
      if (line && !fits(`${line}${char}`.trimEnd())) {
        lines.push(line);
        line = '';
      }
      line = `${line}${char}`;
    });
  });
  if (line.trim() || lines.length === 0) lines.push(line.trimEnd());
  if (maxLines <= 0 || lines.length <= maxLines) return lines;
  // A line clamp ends the last visible line with an ellipsis.
  const last = `${lines[maxLines - 1]} ${lines[maxLines]}`;
  return [...lines.slice(0, maxLines - 1), fitLabel(ctx, last, maxWidth)];
};

const getLabelMaxLines = (state: GlobalChartState) =>
  Math.abs(getChartThemeSelector(state).legend.labelOptions.maxLines);

/** Draws one legend item whose first label line is centered on `cy`; returns its label line count. */
const drawItem = (
  ctx: CanvasRenderingContext2D,
  { color, label, isSeriesHidden }: LegendItem,
  x: number,
  cy: number,
  maxLabelWidth: number,
  labelColor: string,
  value = '',
  indent = 0,
  maxLines = 1,
) => {
  let lineCount = 1;
  withContext(ctx, () => {
    ctx.globalAlpha = isSeriesHidden ? 0.4 : 1;
    ctx.beginPath();
    ctx.arc(x + indent + MARKER_WIDTH / 2, cy, MARKER_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.font = FONT;
    ctx.fillStyle = labelColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const valueWidth = value ? ctx.measureText(value).width + LABEL_GAP : 0;
    const lines = wrapLabel(ctx, label, maxLabelWidth - indent - valueWidth, maxLines);
    lines.forEach((line, index) => ctx.fillText(line, x + indent + MARKER_WIDTH + LABEL_GAP, cy + index * LINE_HEIGHT));
    lineCount = lines.length;
    if (value) {
      // The value sits at the end of the item, like the HTML legend's value column.
      ctx.textAlign = 'right';
      ctx.fillText(value, x + MARKER_WIDTH + LABEL_GAP + maxLabelWidth, cy);
    }
  });
  return lineCount;
};

// The value a list legend shows after the label; only `LegendValue.Value` (partition charts) is drawn.
const getItemValue = ({ values }: LegendItem, legendValues: LegendValue[]) =>
  legendValues.includes(LegendValue.Value) ? values.find(({ type }) => type === LegendValue.Value)?.label ?? '' : '';

const drawTableRow = (
  ctx: CanvasRenderingContext2D,
  cells: { color?: string; label: string; values: string[] },
  x: number,
  y: number,
  labelWidth: number,
  valueWidths: number[],
  textColor: string,
) => {
  const textY = y + TABLE_ROW_HEIGHT / 2;
  if (cells.color) {
    ctx.beginPath();
    ctx.arc(x + COLOR_COLUMN_WIDTH / 2, textY, MARKER_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = cells.color;
    ctx.fill();
  }
  ctx.fillStyle = TABLE_BORDER_COLOR;
  ctx.fillRect(
    x,
    y + TABLE_ROW_HEIGHT - 1,
    COLOR_COLUMN_WIDTH + labelWidth + valueWidths.reduce((a, b) => a + b, 0),
    1,
  );
  ctx.fillStyle = textColor;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const labelX = x + COLOR_COLUMN_WIDTH + CELL_PADDING.width;
  ctx.fillText(fitLabel(ctx, cells.label, labelWidth - CELL_PADDING.width * 2), labelX, textY);
  ctx.textAlign = 'right';
  let right = x + COLOR_COLUMN_WIDTH + labelWidth;
  cells.values.forEach((value, index) => {
    right += valueWidths[index] ?? 0;
    ctx.fillText(value, right - CELL_PADDING.width, textY);
  });
};

/** Draws the legend table, with a header row, that the HTML legend shows for legend values. */
function renderLegendTable(
  ctx: CanvasRenderingContext2D,
  state: GlobalChartState,
  size: LegendSizing,
  items: LegendItem[],
  labelColor: string,
) {
  const { legendValues, legendTitle = '' } = getLegendConfigSelector(state);
  const { width, height } = state.parentDimensions;
  const { direction, vAlign, hAlign, floating } = getLegendPositionConfig(size.position);
  const isVertical = direction === LayoutDirection.Vertical;
  let left = isVertical && hAlign !== Position.Left ? width - size.width : 0;
  let top = isVertical ? TOP_MARGIN : vAlign === Position.Top ? 0 : height - size.height;
  const tableWidth = isVertical ? size.width : width;
  let bottom = isVertical ? height : top + size.height;
  const titles = legendValues.map((value) => legendValueTitlesMap[value]);

  withContext(ctx, () => {
    ctx.font = HEADER_FONT;
    const titleWidths = titles.map((title) => ctx.measureText(title).width);
    ctx.font = FONT;
    const valueWidths = titleWidths.map((titleWidth, index) =>
      Math.ceil(
        items.reduce(
          (widest, { values }) => Math.max(widest, ctx.measureText(values[index]?.label ?? '').width),
          titleWidth,
        ) +
          CELL_PADDING.width * 2,
      ),
    );
    const valuesWidth = valueWidths.reduce((a, b) => a + b, 0);
    // A horizontal table gives the series column at least half the width, like its CSS grid.
    let labelWidth = Math.max(tableWidth - COLOR_COLUMN_WIDTH - valuesWidth, isVertical ? 0 : tableWidth / 2);
    if (floating) {
      // A floating table takes its content width in a corner of the plot area, 10px inside it.
      const area = getInternalMainProjectionAreaSelector(state);
      const widestLabel = items.reduce((widest, item) => Math.max(widest, ctx.measureText(item.label).width), 0);
      ctx.font = HEADER_FONT;
      labelWidth = Math.ceil(Math.max(widestLabel, ctx.measureText(legendTitle).width)) + CELL_PADDING.width * 2;
      ctx.font = FONT;
      const floatingWidth = COLOR_COLUMN_WIDTH + labelWidth + valuesWidth;
      const floatingHeight = (items.length + 1) * TABLE_ROW_HEIGHT;
      left =
        hAlign === Position.Left ? area.left + FLOATING_INSET : area.left + area.width - FLOATING_INSET - floatingWidth;
      top = vAlign === Position.Bottom ? area.top + area.height - floatingHeight : area.top;
      bottom = area.top + area.height;
    }
    const rows = [
      { label: legendTitle, values: titles, font: HEADER_FONT },
      ...items.map(({ color, label, values, isSeriesHidden }) => ({
        color,
        label,
        values: legendValues.map((_, index) => values[index]?.label ?? ''),
        font: FONT,
        alpha: isSeriesHidden ? 0.4 : 1,
      })),
    ];
    rows.forEach((row, index) => {
      const y = top + index * TABLE_ROW_HEIGHT;
      if (y + TABLE_ROW_HEIGHT > bottom) return;
      withContext(ctx, () => {
        ctx.font = row.font;
        ctx.globalAlpha = 'alpha' in row ? row.alpha : 1;
        drawTableRow(ctx, row, left, y, labelWidth, valueWidths, labelColor);
      });
    });
  });
}

/**
 * Draws the legend in the space the chart layout reserved for the HTML legend: a table when
 * it shows legend values, a list otherwise. Legend actions are not drawn.
 * @internal
 */
export function renderLegend(ctx: CanvasRenderingContext2D, state: GlobalChartState) {
  const size = getLegendSizeSelector(state);
  if (size.width <= 0 || size.height <= 0) return;

  const items = getLegendItemsSelector(state).filter(({ isItemHidden }) => !isItemHidden);
  const { width, height } = state.parentDimensions;
  const labelColor = getChartThemeSelector(state).axes.axisTitle.fill;
  const { legendValues, legendPosition, legendLayout, flatLegend } = getLegendConfigSelector(state);
  if (shouldDisplayTable(legendValues, legendPosition, legendLayout)) {
    renderLegendTable(ctx, state, size, items, labelColor);
    return;
  }
  const { direction, vAlign, hAlign, floating } = getLegendPositionConfig(size.position);
  const maxLines = getLabelMaxLines(state);
  const { chartMargins } = getChartThemeSelector(state);

  withContext(ctx, () => {
    ctx.font = FONT;
    if (floating) {
      renderFloatingLegend(ctx, state, items, labelColor);
      return;
    }
    if (direction === LayoutDirection.Vertical) {
      const x = hAlign === Position.Left ? 0 : width - size.width;
      const maxLabelWidth = size.width - MARKER_WIDTH - LABEL_GAP;
      // The list starts below the chart's top margin, like its padding in the HTML legend.
      let y = TOP_MARGIN + chartMargins.top;
      items.forEach((item) => {
        // A hierarchical (partition) legend indents nested items like the HTML legend.
        const indent = flatLegend ? 0 : LEGEND_HIERARCHY_MARGIN * (item.depth ?? 0);
        const value = getItemValue(item, legendValues);
        if (y + ROW_HEIGHT > height) return;
        const lines = drawItem(ctx, item, x, y + ROW_HEIGHT / 2, maxLabelWidth, labelColor, value, indent, maxLines);
        y += ROW_HEIGHT + (lines - 1) * LINE_HEIGHT;
      });
      return;
    }

    const top = vAlign === Position.Top ? 0 : height - size.height;
    if (legendLayout === 'list') {
      renderHorizontalList(ctx, state, items, labelColor, top, top + size.height);
      return;
    }
    // The default horizontal legend is a grid of equal columns at least `verticalWidth` wide.
    const { verticalWidth } = getChartThemeSelector(state).legend;
    const available = width - chartMargins.left - chartMargins.right;
    const columns =
      items.length === 1
        ? 1
        : Math.max(1, Math.floor((available + GRID_COLUMN_GAP) / (verticalWidth + GRID_COLUMN_GAP)));
    const columnWidth = (available - GRID_COLUMN_GAP * (columns - 1)) / columns;
    const maxLabelWidth = columnWidth - ITEM_MARGIN * 2 - MARKER_WIDTH - LABEL_GAP;
    let rowTop = top + LEGEND_ROW_GAP;
    for (let start = 0; start < items.length; start += columns) {
      if (rowTop + LINE_HEIGHT > top + size.height) break;
      const rowCenterY = rowTop + LINE_HEIGHT / 2;
      const rowLines = items.slice(start, start + columns).map((item, column) => {
        const x = chartMargins.left + column * (columnWidth + GRID_COLUMN_GAP) + ITEM_MARGIN;
        const value = getItemValue(item, legendValues);
        return drawItem(ctx, item, x, rowCenterY, maxLabelWidth, labelColor, value, 0, maxLines);
      });
      rowTop += Math.max(...rowLines) * LINE_HEIGHT + LEGEND_ROW_GAP;
    }
  });
}

/** The values a horizontal list legend shows after each label, as `TITLE:` and value pairs. */
const getListValues = ({ values }: LegendItem, legendValues: LegendValue[]) =>
  legendValues.flatMap((type) => {
    const label = values.find((value) => value.type === type)?.label ?? '';
    const shown = label || (type === LegendValue.CurrentAndLastValue ? '—' : '');
    return shown ? [{ title: `${legendValueTitlesMap[type].toUpperCase()}:`, label: ` ${shown}` }] : [];
  });

/** Draws the horizontal list layout: items inline in 24px rows, labels cut at the width limit. */
function renderHorizontalList(
  ctx: CanvasRenderingContext2D,
  state: GlobalChartState,
  items: LegendItem[],
  labelColor: string,
  top: number,
  bottom: number,
) {
  const { legendValues } = getLegendConfigSelector(state);
  const {
    chartMargins,
    legend: { labelOptions },
  } = getChartThemeSelector(state);
  const { width } = state.parentDimensions;
  const right = width - chartMargins.right;
  const widthLimit = Math.abs(labelOptions.widthLimit);
  let x = chartMargins.left;
  let rowTop = top + LEGEND_ROW_GAP;
  items.forEach((item) => {
    const values = getListValues(item, legendValues);
    const measure = (text: string, font: string) => {
      ctx.font = font;
      return ctx.measureText(text).width;
    };
    const labelWidth = Math.min(
      measure(item.label, FONT),
      widthLimit > 0 ? widthLimit : Infinity,
      right - chartMargins.left - ITEM_MARGIN - MARKER_WIDTH - LABEL_GAP,
    );
    const valueWidths = values.map(
      ({ title, label }) => LIST_VALUE_GAP + measure(title, LIST_VALUE_TITLE_FONT) + measure(label, FONT),
    );
    const itemWidth =
      ITEM_MARGIN +
      MARKER_WIDTH +
      LABEL_GAP +
      labelWidth +
      valueWidths.reduce((sum, w) => sum + w, 0) +
      (values.length ? 0 : ITEM_MARGIN);
    if (x > chartMargins.left && x + itemWidth > right) {
      x = chartMargins.left;
      rowTop += LIST_ROW_HEIGHT;
    }
    if (rowTop + LIST_ROW_HEIGHT > bottom) return;
    const cy = rowTop + LIST_ROW_HEIGHT / 2;
    ctx.font = FONT;
    drawItem(ctx, item, x + ITEM_MARGIN, cy, labelWidth, labelColor);
    let valueX = x + ITEM_MARGIN + MARKER_WIDTH + LABEL_GAP + labelWidth;
    values.forEach(({ title, label }, index) =>
      withContext(ctx, () => {
        ctx.globalAlpha = item.isSeriesHidden ? 0.4 : 1;
        ctx.fillStyle = labelColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = LIST_VALUE_TITLE_FONT;
        const titleX = valueX + LIST_VALUE_GAP;
        ctx.fillText(title, titleX, cy);
        const titleWidth = ctx.measureText(title).width;
        ctx.font = FONT;
        ctx.fillText(label, titleX + titleWidth, cy);
        valueX += valueWidths[index] ?? 0;
      }),
    );
    x += itemWidth;
  });
}

/**
 * Draws a floating legend inside the plot area, 10px from its side: a grid of `floatingColumns`
 * columns as wide as their items, below the chart's top margin.
 */
function renderFloatingLegend(
  ctx: CanvasRenderingContext2D,
  state: GlobalChartState,
  items: LegendItem[],
  labelColor: string,
) {
  const { legendValues, legendPosition } = getLegendConfigSelector(state);
  const { vAlign, hAlign, floatingColumns = 1 } = legendPosition;
  const { chartMargins } = getChartThemeSelector(state);
  const area = getInternalMainProjectionAreaSelector(state);
  const columns = Math.min(Math.max(floatingColumns, 1), Math.max(items.length, 1));
  const itemWidths = items.map((item) => {
    const value = getItemValue(item, legendValues);
    const valueWidth = value ? ctx.measureText(value).width + LABEL_GAP : 0;
    return ITEM_MARGIN * 2 + MARKER_WIDTH + LABEL_GAP + ctx.measureText(item.label).width + valueWidth;
  });
  const columnWidths = Array.from({ length: columns }, (_, column) =>
    Math.max(0, ...itemWidths.filter((_w, index) => index % columns === column)),
  );
  const legendWidth = columnWidths.reduce((sum, w) => sum + w, 0);
  const rowCount = Math.ceil(items.length / columns);
  const legendHeight = chartMargins.top + rowCount * ROW_HEIGHT + chartMargins.bottom;
  const left =
    hAlign === Position.Left ? area.left + FLOATING_INSET : area.left + area.width - FLOATING_INSET - legendWidth;
  const top = vAlign === Position.Bottom ? area.top + area.height - legendHeight : area.top;
  items.forEach((item, index) => {
    const column = index % columns;
    const x = left + columnWidths.slice(0, column).reduce((sum, w) => sum + w, 0) + ITEM_MARGIN;
    const y = top + chartMargins.top + Math.floor(index / columns) * ROW_HEIGHT;
    const maxLabelWidth = (columnWidths[column] ?? 0) - ITEM_MARGIN * 2 - MARKER_WIDTH - LABEL_GAP;
    drawItem(ctx, item, x, y + ROW_HEIGHT / 2, maxLabelWidth, labelColor, getItemValue(item, legendValues));
  });
}
