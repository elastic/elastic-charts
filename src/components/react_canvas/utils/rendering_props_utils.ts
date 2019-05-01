import { GeometryStyle } from '../../../lib/series/rendering';
import { Rotation } from '../../../lib/series/specs';
import { AreaStyle, DisplayValueStyle, LineStyle, PointStyle } from '../../../lib/themes/theme';
import { Dimensions } from '../../../lib/utils/dimensions';
import { GlobalKonvaElementProps } from '../globals';

export interface PointStyleProps {
  radius: number;
  strokeWidth: number;
  strokeEnabled: boolean;
  fill: string;
  opacity: number;
}

export function buildAreaPointProps({
  areaIndex,
  pointIndex,
  x,
  y,
  color,
  pointStyleProps,
}: {
  areaIndex: number;
  pointIndex: number;
  x: number;
  y: number;
  color: string;
  pointStyleProps: PointStyleProps;
}) {
  return {
    key: `area-point-${areaIndex}-${pointIndex}`,
    x,
    y,
    stroke: color,
    ...pointStyleProps,
    ...GlobalKonvaElementProps,
  };
}

export function buildPointStyleProps({
  radius,
  strokeWidth,
  opacity,
  seriesPointStyle,
}: {
  radius: number;
  strokeWidth: number;
  opacity: number;
  seriesPointStyle?: PointStyle;
}): PointStyleProps {
  const pointStrokeWidth = seriesPointStyle ? seriesPointStyle.strokeWidth : strokeWidth;
  return {
    radius: seriesPointStyle ? seriesPointStyle.radius : radius,
    strokeWidth: pointStrokeWidth,
    strokeEnabled: pointStrokeWidth !== 0,
    fill: 'white',
    opacity: seriesPointStyle ? seriesPointStyle.opacity : opacity,
  };
}

export function buildAreaProps({
  index,
  areaPath,
  xTransform,
  color,
  opacity,
  seriesAreaStyle,
}: {
  index: number;
  areaPath: string;
  xTransform: number;
  color: string;
  opacity: number;
  seriesAreaStyle?: AreaStyle,
}) {
  return {
    key: `area-${index}`,
    data: areaPath,
    x: xTransform,
    fill: color,
    lineCap: 'round',
    lineJoin: 'round',
    opacity: seriesAreaStyle ? seriesAreaStyle.opacity : opacity,
    ...GlobalKonvaElementProps,
  };
}

export function buildAreaLineProps({
  areaIndex,
  lineIndex,
  xTransform,
  linePath,
  color,
  strokeWidth,
  geometryStyle,
  seriesAreaLineStyle,
}: {
  areaIndex: number;
  lineIndex: number;
  xTransform: number;
  linePath: string;
  color: string;
  strokeWidth: number;
  geometryStyle: GeometryStyle;
  seriesAreaLineStyle?: LineStyle;
}) {
  return {
    key: `area-${areaIndex}-line-${lineIndex}`,
    data: linePath,
    x: xTransform,
    stroke: color,
    strokeWidth: seriesAreaLineStyle ? seriesAreaLineStyle.strokeWidth : strokeWidth,
    lineCap: 'round',
    lineJoin: 'round',
    ...geometryStyle,
    ...GlobalKonvaElementProps,
  };
}

export function buildBarProps({
  index,
  x,
  y,
  width,
  height,
  fill,
  stroke,
  strokeWidth,
  borderEnabled,
  geometryStyle,
}: {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderEnabled: boolean;
  geometryStyle: GeometryStyle;
}) {
  return {
    key: `bar-${index}`,
    x,
    y,
    width,
    height,
    fill,
    strokeWidth,
    stroke,
    strokeEnabled: borderEnabled,
    ...GlobalKonvaElementProps,
    ...geometryStyle,
  };
}

export function buildBarValueProps({
  x,
  y,
  barHeight,
  barWidth,
  displayValueStyle,
  displayValue,
  chartRotation,
  chartDimensions,
}: {
  x: number;
  y: number;
  barHeight: number;
  barWidth: number;
  displayValueStyle: DisplayValueStyle;
  displayValue: { text: string; width: number; };
  chartRotation: Rotation;
  chartDimensions: Dimensions;
}): DisplayValueStyle & {
  x: number;
  y: number;
  align: string;
  text: string;
  width: number;
  height: number;
} {
  const chartHeight = chartDimensions.height;
  const chartWidth = chartDimensions.width;
  const { fontSize, padding } = displayValueStyle;
  const displayValueTextHeight = fontSize + padding;
  const displayValueY = barHeight >= displayValueTextHeight ? y : y - displayValueTextHeight;

  // if padding is less than 0, then text will appear above bar
  // this checks if there is enough space above the bar to render the value
  // if not, render the value within the bar
  const textPadding = (padding < 0 && y < fontSize) ? -padding : padding;
  const displayValueWidth = displayValue.width;

  const textX = displayValueWidth > barWidth ?
    x - Math.abs(barWidth - displayValueWidth) / 2
    : x + Math.abs(barWidth - displayValueWidth) / 2;

  const displayValueOffsetY = displayValueStyle.offsetY || 0;
  const sharedProps = {
    align: 'center',
    ...displayValueStyle,
    padding: textPadding,
    text: displayValue.text,
    width: displayValueWidth,
    height: fontSize,
    offsetY: displayValueOffsetY,
  };

  switch (chartRotation) {
    case 0:
      return {
        x: textX,
        y: displayValueY,
        ...sharedProps,
      };
    case 180:
      return {
        x: chartWidth - textX - displayValueWidth,
        y: chartHeight - displayValueY - displayValueTextHeight,
        ...sharedProps,
      };
    case 90:
      return {
        x: chartWidth - displayValueY - displayValueWidth,
        y: textX + barWidth + displayValueTextHeight / 2,
        ...sharedProps,
        align: 'right',
      };
    case -90:
      return {
        x: displayValueY,
        y: chartHeight - textX - barWidth - displayValueWidth / 2,
        ...sharedProps,
        align: 'left',
      };
  }

  return {
    x: textX,
    y: displayValueY,
    align: 'center',
    ...displayValueStyle,
    padding: textPadding,
    text: displayValue.text,
    width: displayValueWidth,
    height: fontSize,
    offsetY: displayValueOffsetY,
  };
}

export function buildLinePointProps({
  lineIndex,
  pointIndex,
  x,
  y,
  color,
  pointStyleProps,
}: {
  lineIndex: number;
  pointIndex: number;
  x: number;
  y: number;
  color: string;
  pointStyleProps: PointStyleProps;
}) {
  return {
    key: `line-point-${lineIndex}-${pointIndex}`,
    x,
    y,
    stroke: color,
    ...pointStyleProps,
    ...GlobalKonvaElementProps,
  };
}

export function buildLineProps({
  index,
  xTransform,
  linePath,
  color,
  strokeWidth,
  geometryStyle,
  seriesLineStyle,
}: {
  index: number;
  xTransform: number;
  linePath: string;
  color: string;
  strokeWidth: number;
  geometryStyle: GeometryStyle;
  seriesLineStyle?: LineStyle;
}) {
  return {
    key: `line-${index}`,
    x: xTransform,
    data: linePath,
    stroke: color,
    strokeWidth: seriesLineStyle ? seriesLineStyle.strokeWidth : strokeWidth,
    lineCap: 'round',
    lineJoin: 'round',
    ...geometryStyle,
    ...GlobalKonvaElementProps,
  };
}
