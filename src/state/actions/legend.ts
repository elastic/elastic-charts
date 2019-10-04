import { DataSeriesColorsValues } from 'chart_types/xy_chart/utils/series';

export const ON_TOGGLE_LEGEND = 'ON_TOGGLE_LEGEND';
export const ON_LEGEND_ITEM_OVER = 'ON_LEGEND_ITEM_OVER';
export const ON_LEGEND_ITEM_OUT = 'ON_LEGEND_ITEM_OUT';
export const ON_LEGEND_ITEM_CLICK = 'ON_LEGEND_ITEM_CLICK';
export const ON_TOGGLE_DESELECT_SERIES = 'ON_TOGGLE_DESELECT_SERIES';
export const ON_INVERT_DESELECT_SERIES = 'ON_INVERT_DESELECT_SERIES';
export const ON_LEGEND_RENDERED = 'ON_LEGEND_RENDERED';

export interface ToggleLegendAction {
  type: typeof ON_TOGGLE_LEGEND;
}
export interface LegendItemOverAction {
  type: typeof ON_LEGEND_ITEM_OVER;
  legendItemKey: string | null;
}
export interface LegendItemOutAction {
  type: typeof ON_LEGEND_ITEM_OUT;
}

export interface LegendItemClickAction {
  type: typeof ON_LEGEND_ITEM_CLICK;
  legendItemId: DataSeriesColorsValues | null;
}
export interface ToggleDeselectSeriesAction {
  type: typeof ON_TOGGLE_DESELECT_SERIES;
  legendItemId: DataSeriesColorsValues;
}

export interface InvertDeselectSeriesAction {
  type: typeof ON_INVERT_DESELECT_SERIES;
  legendItemId: DataSeriesColorsValues;
}
export interface LegendRenderedAction {
  type: typeof ON_LEGEND_RENDERED;
}

export function onToggleLegend(): ToggleLegendAction {
  return { type: ON_TOGGLE_LEGEND };
}

export function onLegendItemOver(legendItemKey: string | null): LegendItemOverAction {
  return { type: ON_LEGEND_ITEM_OVER, legendItemKey };
}

export function onLegendItemOut(): LegendItemOutAction {
  return { type: ON_LEGEND_ITEM_OUT };
}

export function onLegendItemClick(legendItemId: DataSeriesColorsValues | null): LegendItemClickAction {
  return { type: ON_LEGEND_ITEM_CLICK, legendItemId };
}

export function onToggleDeselectSeries(legendItemId: DataSeriesColorsValues): ToggleDeselectSeriesAction {
  return { type: ON_TOGGLE_DESELECT_SERIES, legendItemId };
}

export function onInvertDeselectSeries(legendItemId: DataSeriesColorsValues): InvertDeselectSeriesAction {
  return { type: ON_INVERT_DESELECT_SERIES, legendItemId };
}

export function onLegendRendered(): LegendRenderedAction {
  return { type: ON_LEGEND_RENDERED };
}
