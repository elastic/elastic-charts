import createCachedSelector from 're-reselect';
import { getLegendItemsSelector } from './get_legend_items';
import { CanvasTextBBoxCalculator } from '../../utils/bbox/canvas_text_bbox_calculator';
import { BBox } from '../../utils/bbox/bbox_calculator';
import { getSettingsSpecSelector } from './get_settings_specs';
import { isVerticalAxis } from '../../chart_types/xy_chart/utils/axis_utils';
import { getChartThemeSelector } from './get_chart_theme';
import { GlobalChartState } from '../chart_state';

const getParentDimensionSelector = (state: GlobalChartState) => state.parentDimensions;

const legendItemLabelsSelector = createCachedSelector(
  [getSettingsSpecSelector, getLegendItemsSelector],
  (settings, legendItems): string[] => {
    const labels: string[] = [];
    const { showLegendDisplayValue } = settings;
    legendItems.forEach((item) => {
      labels.push(`${item.label} ${showLegendDisplayValue ? item.displayValue.formatted.y1 : ''}`);
      labels.push(`${item.label} ${showLegendDisplayValue ? item.displayValue.formatted.y0 : ''}`);
    });
    return labels;
  },
)((state) => state.chartId);

const MARKER_WIDTH = 16;
// const MARKER_HEIGHT = 16;
const MARKER_LEFT_MARGIN = 4;
const VALUE_LEFT_MARGIN = 4;
const VERTICAL_PADDING = 4;

export const getLegendSizeSelector = createCachedSelector(
  [getSettingsSpecSelector, getChartThemeSelector, getParentDimensionSelector, legendItemLabelsSelector],
  (settings, theme, parentDimensions, labels): BBox => {
    const bboxCalculator = new CanvasTextBBoxCalculator();
    const bbox = labels.reduce(
      (acc, label) => {
        const bbox = bboxCalculator.compute(label, 10, 12, 'Arial', 1.5).getOrElse({ width: 0, height: 0 });
        if (acc.height < bbox.height) {
          acc.height = bbox.height;
        }
        if (acc.width < bbox.width) {
          acc.width = bbox.width;
        }
        return acc;
      },
      { width: 0, height: 0 },
    );

    bboxCalculator.destroy();
    const { showLegend, legendPosition } = settings;
    const {
      legend: { verticalWidth },
    } = theme;
    if (!showLegend) {
      return { width: 0, height: 0 };
    }
    const legendItemWidth = bbox.width + MARKER_WIDTH + MARKER_LEFT_MARGIN + VALUE_LEFT_MARGIN;
    if (isVerticalAxis(legendPosition)) {
      const legendItemHeight = bbox.height + VERTICAL_PADDING * 2;
      return {
        width: Math.ceil(Math.min(legendItemWidth, verticalWidth)),
        height: legendItemHeight,
      };
    } else {
      const isSingleLine = (parentDimensions.width - 20) / 200 > labels.length;
      return {
        height: isSingleLine ? bbox.height + 16 : bbox.height * 2 + 24,
        width: Math.ceil(Math.min(legendItemWidth, verticalWidth)),
      };
    }
  },
)((state) => state.chartId);
