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
  displayValue: {
    text: string;
    width: number;
    height: number;
    hideClippedValue?: boolean;
    isValueContainedInElement?: boolean;
  };
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
  const { padding } = displayValueStyle;
  const elementHeight = displayValue.isValueContainedInElement ? barHeight : displayValue.height;

  const displayValueHeight = elementHeight + padding;
  const displayValueWidth = displayValue.width + padding;

  const displayValueY = barHeight >= displayValueHeight ? y : y - displayValueHeight;
  const displayValueX = displayValueWidth > barWidth ?
    x - Math.abs(barWidth - displayValueWidth) / 2
    : x + Math.abs(barWidth - displayValueWidth) / 2;

  const rotatedDisplayValueX = displayValueHeight > barWidth ?
    x - Math.abs(barWidth - displayValueHeight) / 2
    : x + Math.abs(barWidth - displayValueHeight) / 2;

  const displayValueOffsetY = displayValueStyle.offsetY || 0;

  const props = {
    align: 'center',
    verticalAlign: 'top',
    ...displayValueStyle,
    text: displayValue.text,
    width: displayValueWidth,
    height: displayValueHeight,
    offsetY: displayValueOffsetY,
    x: displayValueX,
    y: displayValueY,
  };

  switch (chartRotation) {
    case 0:
      props.x = displayValueX;
      props.y = displayValueY;
      break;
    case 180:
      props.x = chartWidth - displayValueX - displayValueWidth;
      props.y = chartHeight - displayValueY - displayValueHeight;
      props.verticalAlign = 'bottom';
      break;
    case 90:
      props.x = (barHeight >= displayValueWidth) ?
        chartWidth - displayValueY - displayValueWidth
        : chartWidth - displayValueY;
      props.y = rotatedDisplayValueX;
      props.verticalAlign = 'middle';

      if (displayValue.isValueContainedInElement && barHeight >= displayValueWidth) {
        props.x = chartWidth - y - barHeight;
        props.y = x;
        props.width = barHeight;
        props.height = barWidth;
        props.align = 'right';
      }

      if (displayValue.isValueContainedInElement && displayValueHeight > barWidth) {
        props.width = 0;
        props.height = 0;
      }

      break;
    case -90:
      props.x = (barHeight >= displayValueWidth) ? displayValueY : displayValueY - displayValueWidth;
      props.y = chartHeight - rotatedDisplayValueX - displayValueHeight;
      props.verticalAlign = 'middle';

      if (displayValue.isValueContainedInElement && barHeight >= displayValueWidth) {
        props.x = y;
        props.y = chartHeight - x - barWidth;
        props.width = barHeight;
        props.height = barWidth;
        props.align = 'left';
      }

      if (displayValue.isValueContainedInElement && displayValueHeight > barWidth) {
        props.width = 0;
        props.height = 0;
      }

      break;
  }

  const isOverflowX = props.x + props.width > chartWidth || props.x < 0;
  const isOverflowY = props.y + props.height > chartHeight || props.y < 0;

  if (displayValue.hideClippedValue && (isOverflowX || isOverflowY)) {
    props.width = 0;
    props.height = 0;
  }

  return props;
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
