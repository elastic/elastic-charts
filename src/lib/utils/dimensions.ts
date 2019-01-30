import { AxisTicksDimensions } from '../axes/axis_utils';
import { AxisSpec, Position } from '../series/specs';
import { Theme } from '../themes/theme';
import { AxisId } from './ids';

export interface Dimensions {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface Margins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Compute the chart dimension padding the parent dimension by the specified set of axis
 * @param parentDimensions the parent dimension
 * @param axisDimensions the axis dimensions
 * @param axisSpecs the axis specs
 */
export function computeChartDimensions(
  parentDimensions: Dimensions,
  chartTheme: Theme,
  axisDimensions: Map<AxisId, AxisTicksDimensions>,
  axisSpecs: Map<AxisId, AxisSpec>,
  showLegend: boolean,
  legendPosition?: Position,
): Dimensions {
  const chartMargins = chartTheme.chart.margins;
  const chartPaddings = chartTheme.chart.paddings;
  const legendStyle = chartTheme.legend;
  const { titleFontSize, titlePadding } = chartTheme.axes;

  const axisTitleHeight = titleFontSize + titlePadding;

  let vLeftAxisSpecWidth = 0;
  let vRightAxisSpecWidth = 0;
  let hTopAxisSpecHeight = 0;
  let hBottomAxisSpecHeight = 0;

  axisDimensions.forEach(({ maxLabelBboxWidth = 0, maxLabelBboxHeight = 0 }, id) => {
    const axisSpec = axisSpecs.get(id);
    if (!axisSpec) {
      return;
    }
    const { position, tickSize, tickPadding } = axisSpec;
    switch (position) {
      case Position.Top:
        hTopAxisSpecHeight +=
          maxLabelBboxHeight + tickSize + tickPadding + chartMargins.top + axisTitleHeight;
        break;
      case Position.Bottom:
        hBottomAxisSpecHeight +=
          maxLabelBboxHeight + tickSize + tickPadding + chartMargins.bottom + axisTitleHeight;
        break;
      case Position.Left:
        vLeftAxisSpecWidth +=
          maxLabelBboxWidth + tickSize + tickPadding + chartMargins.left + axisTitleHeight;
        break;
      case Position.Right:
        vRightAxisSpecWidth +=
          maxLabelBboxWidth + tickSize + tickPadding + chartMargins.right + axisTitleHeight;
        break;
    }
  });
  // const hMargins = chartMargins.left + chartMargins.right;
  const chartWidth = parentDimensions.width - vLeftAxisSpecWidth - vRightAxisSpecWidth;
  const chartHeight = parentDimensions.height - hTopAxisSpecHeight - hBottomAxisSpecHeight;
  let vMargin = 0;
  if (hTopAxisSpecHeight === 0) {
    vMargin += chartMargins.top;
  }
  if (hBottomAxisSpecHeight === 0) {
    vMargin += chartMargins.bottom;
  }
  let hMargin = 0;
  if (vLeftAxisSpecWidth === 0) {
    hMargin += chartMargins.left;
  }
  if (vRightAxisSpecWidth === 0) {
    hMargin += chartMargins.right;
  }
  let legendTopMargin = 0;
  let legendLeftMargin = 0;
  if (showLegend) {
    switch (legendPosition) {
      case Position.Right:
        hMargin += legendStyle.verticalWidth;
        break;
      case Position.Left:
        hMargin += legendStyle.verticalWidth;
        legendLeftMargin = legendStyle.verticalWidth;
        break;
      case Position.Top:
        vMargin += legendStyle.horizontalHeight;
        legendTopMargin = legendStyle.horizontalHeight;
        break;
      case Position.Bottom:
        vMargin += legendStyle.horizontalHeight;
        break;
    }
  }
  let top = 0;
  let left = 0;
  if (hTopAxisSpecHeight === 0) {
    top = chartMargins.top + chartPaddings.top + legendTopMargin;
  } else {
    top = hTopAxisSpecHeight + chartPaddings.top + legendTopMargin;
  }
  if (vLeftAxisSpecWidth === 0) {
    left = chartMargins.left + chartPaddings.left + legendLeftMargin;
  } else {
    left = vLeftAxisSpecWidth + chartPaddings.left + legendLeftMargin;
  }
  return {
    top,
    left,
    width: chartWidth - hMargin - chartPaddings.left - chartPaddings.right,
    height: chartHeight - vMargin - chartPaddings.top - chartPaddings.bottom,
  };
}
